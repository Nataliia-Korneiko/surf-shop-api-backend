const { Review, Post, User } = require('../models');
const { cloudinary } = require('../cloudinary');

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

module.exports = {
  asyncErrorHandler,
  isReviewAuthor,
  isLoggedIn,
  isAuthor,
  isValidPassword,
  changePassword,
  deleteProfileImage,
};
