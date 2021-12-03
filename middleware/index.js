const { Review } = require('../models');

const asyncErrorHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const isReviewAuthor = async (req, res, next) => {
  const review = await Review.findById(req.params.review_id);

  if (review.author.equals(req.user._id)) {
    return next();
  }

  req.session.error = 'You cannot change not your own review! Bye bye!';
  // return res.redirect('/api/v1');
  return res.redirect(`/api/v1/posts/${req.params.id}`);
};

module.exports = {
  asyncErrorHandler,
  isReviewAuthor,
};
