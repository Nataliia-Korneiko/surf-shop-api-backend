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
  lat: Number,
  lng: Number,
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
