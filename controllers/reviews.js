const { Post, Review } = require('../models');

const createReview = async (req, res, next) => {
  const post = await Post.findById(req.params.id).populate('reviews').exec();

  const haveReviewed = post.reviews.filter((review) => {
    return review.author.equals(req.user._id);
  }).length;

  // Check if haveReviewed is 0 (false) or 1 (true)
  if (haveReviewed) {
    req.session.error = 'Sorry, you can only create one review per post!';
    return res.redirect(`/api/v1/posts/${post.id}`);
  }

  req.body.review.author = req.user._id;
  const review = await Review.create(req.body.review);

  post.reviews.push(review); // Assign review to post
  post.save();

  req.session.success = 'Review created successfully!';
  res.redirect(`/api/v1/posts/${post.id}`);
};

const updateReview = async (req, res, next) => {
  await Review.findByIdAndUpdate(req.params.review_id, req.body.review);

  req.session.success = 'Review updated successfully!';
  res.redirect(`/api/v1/posts/${req.params.id}`);
};

const deleteReview = async (req, res, next) => {
  await Post.findByIdAndUpdate(req.params.id, {
    $pull: {
      reviews: req.params.review_id,
    },
  });

  await Review.findByIdAndRemove(req.params.review_id);

  req.session.success = 'Review deleted successfully!';
  res.redirect(`/api/v1/posts/${req.params.id}`);
};

module.exports = {
  createReview,
  updateReview,
  deleteReview,
};
