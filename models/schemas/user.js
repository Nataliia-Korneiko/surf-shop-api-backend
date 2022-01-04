const { Schema } = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  image: {
    path: {
      type: String,
      default: '/images/default-avatar.png',
    },
    filename: String,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

UserSchema.plugin(passportLocalMongoose);

module.exports = UserSchema;
