const { Post, Review } = require('../models');

const createReview = async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  req.body.review.author = req.user._id;
  const review = await Review.create(req.body.review);

  post.reviews.push(review); // Assign review to post
  post.save();

  req.session.success = 'Review created successfully!';
  res.redirect(`/api/v1/posts/${post.id}`);
};

const updateReview = async (req, res, next) => {
  res.send('updateReview');
};

const deleteReview = async (req, res, next) => {
  res.send('deleteReview');
};

module.exports = {
  createReview,
  updateReview,
  deleteReview,
};
