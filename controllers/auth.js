const { User } = require('../models');

const getRegister = (req, res, next) => {
  res.render('register', { title: 'Register', username: '', email: '' });
};

const postRegister = async (req, res, next) => {
  try {
    const user = await User.register(new User(req.body), req.body.password);

    req.login(user, function (err) {
      if (err) return next(err);

      req.session.success = `Welcome to Surf Shop, ${user.username}!`;
      res.redirect('/api/v1');
    });
  } catch (err) {
    const { username, email } = req.body;
    let error = err.message;
    // eval(require('locus'));

    if (
      error.includes('duplicate') &&
      error.includes('index: email_1 dup key')
    ) {
      error = 'A user with the given email is already registered';
    }

    res.render('register', { title: 'Register', username, email, error });
  }
};

const getLogin = (req, res, next) => {
  if (req.isAuthenticated()) return res.redirect('/api/v1');
  res.render('login', { title: 'Login' });
};

const postLogin = async (req, res, next) => {
  const { username, password } = req.body;
  const { user, error } = await User.authenticate()(username, password);

  if (!user && error) return next(error);

  req.login(user, function (err) {
    if (err) return next(err);

    req.session.success = `Welcome back, ${username}!`;
    const redirectUrl = req.session.redirectTo || '/api/v1';
    delete req.session.redirectTo;
    res.redirect(redirectUrl);
  });
};

const getLogout = (req, res, next) => {
  req.logout();
  res.redirect('/api/v1');
};

module.exports = {
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  getLogout,
};
