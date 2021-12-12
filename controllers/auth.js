/* eslint-disable no-regex-spaces */
/* eslint-disable no-tabs */
/* eslint-disable no-control-regex */
/* eslint-disable indent */
const util = require('util');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const { User } = require('../models');
const { deleteProfileImage } = require('../middleware');

const { SENDGRID_API_KEY, SENDGRID_API_EMAIL_FROM } = process.env;
sgMail.setApiKey(SENDGRID_API_KEY);

const getRegister = (req, res, next) => {
  res.render('register', { title: 'Register', username: '', email: '' });
};

const postRegister = async (req, res, next) => {
  try {
    if (req.file) {
      const { path, filename } = req.file;

      req.body.image = {
        path,
        filename,
      };
    }

    const user = await User.register(new User(req.body), req.body.password);

    req.login(user, function (err) {
      if (err) return next(err);

      req.session.success = `Welcome to Surf Shop, ${user.username}!`;
      res.redirect('/api/v1');
    });
  } catch (err) {
    deleteProfileImage(req);
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
  if (req.query.returnTo) req.session.redirectTo = req.headers.referer;

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

    // !!!
    // console.log(redirectUrl); // req.session.redirectTo - undefined
    res.redirect(redirectUrl);
  });
};

const getLogout = (req, res, next) => {
  req.logout();
  res.redirect('/api/v1');
};

const getForgotPassword = (req, res, next) => {
  res.render('users/forgot');
};

const putForgotPassword = async (req, res, next) => {
  const { email } = req.body;

  const token = await crypto.randomBytes(20).toString('hex');
  const user = await User.findOne({ email });

  if (!user) {
    req.session.error = 'No account with that email!';
    return res.redirect('/api/v1/auth/forgot-password');
  }

  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1h
  await user.save();

  const { username } = user;

  const msg = {
    to: email,
    from: SENDGRID_API_EMAIL_FROM,
    subject: 'Surf Shop - Forgot Password / Reset Password',
    text: `Hello, ${username}!
      You are receiving this because you (or someone else) have requested the reset of the password for your account. Please click on the following link, or copy and paste it into your browser to complete the process:
      http://${req.headers.host}/api/v1/auth/reset-password/${token}
      If you did not request this, please ignore this email and your password will remain unchanged.`.replace(
      /      /g,
      ''
    ),
  };
  await sgMail.send(msg);

  req.session.success = `An email has been sent to ${email} with further instructions.`;
  res.redirect('/api/v1/auth/forgot-password');
};

const getResetPassword = async (req, res, next) => {
  const { token } = req.params;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }, // $gt selects those documents where the value of the field is greater than the specified one
  });

  if (!user) {
    req.session.error = 'Password reset token is invalid or has expired.';
    return res.redirect('/api/v1/auth/forgot-password');
  }

  res.render('users/reset', { token });
};

const putResetPassword = async (req, res, next) => {
  const { token } = req.params;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    req.session.error = 'Password reset token is invalid or has expired.';
    return res.redirect('/api/v1/auth/forgot-password');
  }

  if (req.body.password === req.body.confirm) {
    await user.setPassword(req.body.password);

    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    const login = util.promisify(req.login.bind(req)); // Promisify req.login
    await login(user);
  } else {
    req.session.error = 'Passwords do not match!';
    return res.redirect(`/api/v1/auth/reset-password/${token}`);
  }

  const { username, email } = user;

  const msg = {
    to: email,
    from: SENDGRID_API_EMAIL_FROM,
    subject: 'Surf Shop - Password Changed',
    text: `Hello, ${username}!
		  This email is to confirm that the password for your account has just been changed.
		  If you did not make this change, please hit reply and notify us at once.`.replace(
      /		  /g,
      ''
    ),
  };
  await sgMail.send(msg);

  req.session.success = 'Password successfully updated!';
  res.redirect('/api/v1');
};

module.exports = {
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  getLogout,
  getForgotPassword,
  putForgotPassword,
  getResetPassword,
  putResetPassword,
};
