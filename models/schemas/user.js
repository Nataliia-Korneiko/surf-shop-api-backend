const { Schema } = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  image: String,
});

UserSchema.plugin(passportLocalMongoose);

module.exports = UserSchema;
