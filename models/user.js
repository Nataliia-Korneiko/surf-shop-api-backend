const { model } = require('mongoose');
const { UserSchema } = require('./schemas');

const User = model('User', UserSchema);

module.exports = User;
