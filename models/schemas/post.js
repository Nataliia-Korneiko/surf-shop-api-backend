const { Schema, Types } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');

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
  avgRating: {
    type: Number,
    default: 0,
  },
});

PostSchema.methods.calculateAvgRating = function () {
  let ratingsTotal = 0;

  if (this.reviews.length) {
    this.reviews.forEach((review) => {
      ratingsTotal += review.rating;
    });

    this.avgRating = Math.round((ratingsTotal / this.reviews.length) * 10) / 10;
  } else {
    this.avgRating = ratingsTotal;
  }

  const floorRating = Math.floor(this.avgRating);
  this.save();
  return floorRating;
};

PostSchema.plugin(mongoosePaginate);

module.exports = PostSchema;
