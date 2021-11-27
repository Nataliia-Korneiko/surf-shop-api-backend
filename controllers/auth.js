const passport = require('passport');
const { User } = require('../models');

const postRegister = async (req, res, next) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    image: req.body.image,
  });

  await User.register(newUser, req.body.password);

  res.redirect('/api/v1');
};

const postLogin = (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/api/v1',
    failureRedirect: '/api/v1/auth/login',
  })(req, res, next);
};

const getLogout = (req, res, next) => {
  req.logout();
  res.redirect('/api/v1');
};

module.exports = {
  postRegister,
  postLogin,
  getLogout,
};
