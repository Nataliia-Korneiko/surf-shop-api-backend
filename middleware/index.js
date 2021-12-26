/* eslint-disable no-useless-escape */
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const { Review, Post, User } = require('../models');
const { cloudinary } = require('../cloudinary');

const { MAPBOX_ACCESS_TOKEN } = process.env;
const mapBoxToken = MAPBOX_ACCESS_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken });

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& - the whole matched string
}

const asyncErrorHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const isReviewAuthor = async (req, res, next) => {
  const review = await Review.findById(req.params.review_id);

  if (review.author.equals(req.user._id)) {
    return next();
  }

  req.session.error = 'You cannot change not your own review! Bye bye!';
  // return res.redirect(`/api/v1/posts/${req.params.id}`);
  return res.redirect('/api/v1');
};

const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();

  req.session.error = 'You need to be logged in to do that!';
  req.session.redirectTo = req.originalUrl;
  res.redirect('/api/v1/auth/login');
};

const isAuthor = async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  if (post.author.equals(req.user._id)) {
    res.locals.post = post;
    return next();
  }
  req.session.error = 'Access denied!';
  res.redirect('/api/v1');
};

const isValidPassword = async (req, res, next) => {
  const { user } = await User.authenticate()(
    req.user.username,
    req.body.currentPassword
  );

  if (user) {
    res.locals.user = user;
    next();
  } else {
    deleteProfileImage(req);
    req.session.error = 'Incorrect current password!';
    return res.redirect('/api/v1/users/profile');
  }
};

const changePassword = async (req, res, next) => {
  const { newPassword, passwordConfirmation } = req.body;

  if (newPassword && !passwordConfirmation) {
    deleteProfileImage(req);
    req.session.error = 'Missing password confirmation!';
    return res.redirect('/api/v1/users/profile');

    // Check if new password values exist
  } else if (newPassword && passwordConfirmation) {
    const { user } = res.locals;

    // Check if new passwords match
    if (newPassword === passwordConfirmation) {
      await user.setPassword(newPassword); // Set new password on user object
      next();
    } else {
      deleteProfileImage(req);
      req.session.error = 'New passwords must match!';
      return res.redirect('/api/v1/users/profile');
    }
  } else {
    next();
  }
};

const deleteProfileImage = async (req, res, next) => {
  if (req.file) await cloudinary.uploader.destroy(req.file.filename);
};

const searchAndFilterPosts = async (req, res, next) => {
  const queryKeys = Object.keys(req.query); // Pull keys from req.query (if there are any) and assign them to queryKeys variable as an array of string values

  // Check if queryKeys array has any values in it if true then we know that req.query has properties which means the user:
  // a) clicked a paginate button (page number)
  // b) submitted the search/filter form
  // c) both a and b
  if (queryKeys.length) {
    const dbQueries = []; // Initialize an empty array to store our db queries (objects) in
    let { search, price, avgRating, location, distance } = req.query; // Destructure all potential properties from req.query

    // Check if search exists, if it does then we know that the user submitted the search/filter form with a search query
    if (search) {
      search = new RegExp(escapeRegExp(search), 'gi'); // Convert search to a regular expression and escape any special characters

      // Create a db query object and push it into the dbQueries array now the database will know to search the title, description, and location fields, using the search regular expression
      dbQueries.push({
        $or: [{ title: search }, { description: search }, { location: search }], // $or - operator performs a logical OR operation on an array of two or more <expressions> and selects the documents that satisfy at least one of the <expressions>
      });
    }

    // Check if location exists, if it does then we know that the user submitted the search/filter form with a location query
    if (location) {
      let coordinates;

      try {
        if (typeof JSON.parse(location) === 'number') {
          throw new Error();
        }
        location = JSON.parse(location);
        coordinates = location;
      } catch (err) {
        // Geocode the location to extract geo-coordinates (lat, lng)
        const response = await geocodingClient
          .forwardGeocode({
            query: location,
            limit: 1,
          })
          .send();

        coordinates = response.body.features[0].geometry.coordinates; // Destructure coordinates [ <longitude> , <latitude> ]
      }

      let maxDistance = distance || 1; // Get the max distance or set it to 1 mi
      maxDistance *= 1609.34; // We need to convert the distance to meters, one mile is approximately 1609.34 meters

      // Create a db query object for proximity searching via location (geometry) and push it into the dbQueries array
      dbQueries.push({
        geometry: {
          $geoWithin: {
            $centerSphere: [coordinates, maxDistance / 6371],
          },
        },
      });
    }

    // Check if price exists, if it does then we know that the user submitted the search/filter form with a price query (min, max, or both)
    if (price) {
      // Check individual min/max values and create a db query object for each then push the object into the dbQueries array min will search for all post documents with price greater than or equal to ($gte) the min value max will search for all post documents with price less than or equal to ($lte) the min value
      if (price.min) dbQueries.push({ price: { $gte: Number(price.min) } }); // $gte - >=
      if (price.max) dbQueries.push({ price: { $lte: Number(price.max) } }); // $lte - <=
    }

    // Check if avgRating exists, if it does then we know that the user submitted the search/filter form with a avgRating query (0 - 5 stars)
    if (avgRating) {
      dbQueries.push({ avgRating: { $in: avgRating } }); // Create a db query object that finds any post documents where the avgRating value is included in the avgRating array (e.g., [0, 1, 2, 3, 4, 5])
    }

    res.locals.dbQuery = dbQueries.length ? { $and: dbQueries } : {}; // Pass database query to next middleware in route's middleware chain which is the getPosts from /controllers/posts.js
  }

  res.locals.query = req.query; // Pass req.query to the view as a local variable to be used in the searchAndFilter.ejs partial this allows us to maintain the state of the searchAndFilter form
  queryKeys.splice(queryKeys.indexOf('page'), 1); // Build the paginateUrl for paginatePosts partial first remove 'page' string value from queryKeys array, if it exists

  // Now check if queryKeys has any other values, if it does then we know the user submitted the search/filter form
  // if it doesn't then they are on /posts or a specific page from /posts, e.g., /posts?page=2
  // we assign the delimiter based on whether or not the user submitted the search/filter form
  // e.g., if they submitted the search/filter form then we want page=N to come at the end of the query string
  // e.g., /posts?search=surfboard&page=N
  // but if they didn't submit the search/filter form then we want it to be the first (and only) value in the query string,
  // which would mean it needs a ? delimiter/prefix
  // e.g., /posts?page=N
  // N represents a whole number greater than 0, e.g., 1

  const delimiter = queryKeys.length ? '&' : '?';
  // Build the paginateUrl local variable to be used in the paginatePosts.ejs partial
  // do this by taking the originalUrl and replacing any match of ?page=N or &page=N with an empty string
  // then append the proper delimiter and page= to the end
  // the actual page number gets assigned in the paginatePosts.ejs partial
  res.locals.paginateUrl =
    req.originalUrl.replace(/(\?|\&)page=\d+/g, '') + `${delimiter}page=`;

  next();
};

module.exports = {
  asyncErrorHandler,
  isReviewAuthor,
  isLoggedIn,
  isAuthor,
  isValidPassword,
  changePassword,
  deleteProfileImage,
  searchAndFilterPosts,
};
