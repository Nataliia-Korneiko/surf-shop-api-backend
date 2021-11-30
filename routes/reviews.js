const express = require('express');
const router = express.Router({ mergeParams: true });
const { asyncErrorHandler } = require('../middleware');
const {
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviews');

router.post('/', asyncErrorHandler(createReview));

router.put('/:review_id', (req, res, next) => {
  res.send('PUT /posts/:id/reviews/:review_id');
});

router.delete('/:review_id', (req, res, next) => {
  res.send('DELETE /posts/:id/reviews/:review_id');
});

module.exports = router;
