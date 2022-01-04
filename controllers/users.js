/* eslint-disable camelcase */
const util = require('util');
const { Post } = require('../models');
const { cloudinary } = require('../cloudinary');

const getProfile = async (req, res, next) => {
  const posts = await Post.find()
    .where('author')
    .equals(req.user._id)
    .limit(10)
    .exec();
  res.render('profile', { posts });
};

const updateProfile = async (req, res, next) => {
  const { username, email } = req.body;
  const { user } = res.locals;

  // Check if username or email need to be updated
  if (username) user.username = username;
  if (email) user.email = email;
  if (req.file) {
    if (user.image.filename) {
      await cloudinary.uploader.destroy(user.image.filename);
    }

    const { path, filename } = req.file;
    user.image = { path, filename };
  }
  await user.save();

  const login = util.promisify(req.login.bind(req)); // Promisify req.login
  await login(user);

  req.session.success = 'Profile successfully updated!';
  res.redirect('/api/v1/users/profile');
};

module.exports = {
  getProfile,
  updateProfile,
};
