const { Schema, Types } = require('mongoose');

const ReviewSchema = new Schema({
  body: String,
  rating: Number,
  author: {
    type: Types.ObjectId,
    ref: 'User',
  },
});

module.exports = ReviewSchema;
