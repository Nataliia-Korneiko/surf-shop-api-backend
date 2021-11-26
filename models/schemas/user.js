const { Schema, Types } = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
  email: String,
  image: String,
  posts: [
    {
      type: Types.ObjectId,
      ref: 'Post',
    },
  ],
});

UserSchema.plugin(passportLocalMongoose);

module.exports = UserSchema;
