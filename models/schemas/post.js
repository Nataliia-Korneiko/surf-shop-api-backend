const { Schema, Types } = require('mongoose');

const PostSchema = new Schema({
  title: String,
  price: String,
  description: String,
  images: [
    {
      url: String,
      public_id: String,
    },
  ],
  location: String,
  coordinates: Array,
  author: {
    type: Types.ObjectId,
    ref: 'User',
  },
  reviews: [
    {
      type: Types.ObjectId,
      ref: 'Review',
    },
  ],
});

module.exports = PostSchema;
