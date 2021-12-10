const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const { Post, Review } = require('../models');
const { cloudinary } = require('../cloudinary');

const { MAPBOX_ACCESS_TOKEN } = process.env;
const mapBoxToken = MAPBOX_ACCESS_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapBoxToken });

const getPosts = async (req, res, next) => {
  // http://localhost:8080/api/v1/posts?page=2
  const posts = await Post.paginate(
    {},
    {
      page: req.query.page || 1,
      limit: 10,
      sort: '-_id', // sort by id from last to first
    }
  );

  posts.page = Number(posts.page);

  res.render('posts/index', { posts, mapBoxToken, title: 'Posts' });
};

const newPost = (req, res, next) => {
  res.render('posts/new');
};

const createPost = async (req, res, next) => {
  req.body.post.images = [];

  for (const file of req.files) {
    req.body.post.images.push({
      path: file.path,
      filename: file.filename,
    });
  }

  const response = await geocodingClient
    .forwardGeocode({
      query: req.body.post.location,
      limit: 1,
    })
    .send();

  req.body.post.geometry = response.body.features[0].geometry; // [ -96.7969, 32.7763 ]
  req.body.post.author = req.user._id;

  const post = new Post(req.body.post);

  post.properties.description = `<strong><a href="/api/v1/posts/${post._id}">${
    post.title
  }</a></strong>
    <p>${post.location}</p>
    <p>${post.description.substring(0, 20)}...</p>`;

  await post.save();
  req.session.success = 'Post created successfully!';
  res.redirect(`/api/v1/posts/${post.id}`);
};

const showPost = async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate({
    path: 'reviews',
    options: { sort: { _id: -1 } },
    populate: {
      path: 'author',
      model: 'User',
    },
  });

  const floorRating = post.calculateAvgRating();

  res.render('posts/show', { post, mapBoxToken, floorRating });
};

const editPost = async (req, res, next) => {
  // const post = await Post.findById(req.params.id); // isAuthor middleware

  res.render('posts/edit');
};

const updatePost = async (req, res, next) => {
  // const post = await Post.findById(req.params.id); // isAuthor middleware
  const { post } = res.locals; // Destructure post from res.locals

  // Check if there's any images for deletion
  if (req.body.deleteImages && req.body.deleteImages.length) {
    const deleteImages = req.body.deleteImages; // Assign deleteImages from req.body to its own variable

    // Loop over deleteImages
    for (const filename of deleteImages) {
      await cloudinary.uploader.destroy(filename); // Delete images from cloudinary

      // Delete image from post.images
      for (const image of post.images) {
        if (image.filename === filename) {
          const index = post.images.indexOf(image);
          post.images.splice(index, 1);
        }
      }
    }
  }

  // Check if there are any new images for upload
  if (req.files) {
    // Upload images
    for (const file of req.files) {
      // Add images to post.images array
      post.images.push({
        path: file.path,
        filename: file.filename,
      });
    }
  }

  // Check if location was updated
  if (req.body.post.location !== post.location) {
    const response = await geocodingClient
      .forwardGeocode({
        query: req.body.post.location,
        limit: 1,
      })
      .send();

    post.geometry = response.body.features[0].geometry;
    post.location = req.body.post.location;
  }

  // Update the post with any new properties
  post.title = req.body.post.title;
  post.description = req.body.post.description;
  post.price = req.body.post.price;
  post.properties.description = `<strong><a href="/api/v1/posts/${post._id}">${
    post.title
  }</a></strong>
    <p>${post.location}</p>
    <p>${post.description.substring(0, 20)}...</p>`;

  await post.save(); // Save the updated post into the db
  res.redirect(`/api/v1/posts/${post.id}`); // Redirect to show page
};

const deletePost = async (req, res, next) => {
  // const post = await Post.findById(req.params.id); // isAuthor middleware
  const { post } = res.locals; // Destructure post from res.locals

  // Delete all reviews
  if (post) {
    await Review.remove({
      _id: {
        $in: post.reviews,
      },
    });
  }

  for (const image of post.images) {
    await cloudinary.uploader.destroy(image.filename);
  }

  await post.remove();
  req.session.success = 'Post deleted successfully!';
  res.redirect('/api/v1/posts');
};

module.exports = {
  getPosts,
  newPost,
  createPost,
  showPost,
  editPost,
  updatePost,
  deletePost,
};
