const { model } = require('mongoose');
const { ReviewSchema } = require('./schemas');

const Review = model('Review', ReviewSchema);

module.exports = Review;
