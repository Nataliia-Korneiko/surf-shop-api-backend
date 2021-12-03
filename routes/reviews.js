const express = require('express');
const router = express.Router({ mergeParams: true });
const { asyncErrorHandler, isReviewAuthor } = require('../middleware');
const {
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviews');

router.post('/', asyncErrorHandler(createReview));
router.put('/:review_id', isReviewAuthor, asyncErrorHandler(updateReview));
router.delete('/:review_id', isReviewAuthor, asyncErrorHandler(deleteReview));

module.exports = router;
