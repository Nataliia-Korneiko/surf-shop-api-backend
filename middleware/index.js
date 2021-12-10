const { Review, Post } = require('../models');

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

module.exports = {
  asyncErrorHandler,
  isReviewAuthor,
  isLoggedIn,
  isAuthor,
};
