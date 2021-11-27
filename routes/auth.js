const express = require('express');
const router = express.Router();
const { postRegister, postLogin, getLogout } = require('../controllers/auth');
const { asyncErrorHandler } = require('../middleware');

router.get('/register', (req, res, next) => {
  res.send('GET /register');
});

router.post('/register', asyncErrorHandler(postRegister));

router.get('/login', (req, res, next) => {
  res.send('GET /login');
});

router.post('/login', postLogin);

router.get('/logout', getLogout);

router.get('/forgot-password', (req, res, next) => {
  res.send('GET /forgot-password');
});

router.put('/forgot-password', (req, res, next) => {
  res.send('PUT /forgot-password');
});

router.get('/reset-password/:token', (req, res, next) => {
  res.send('GET /reset-password/:token');
});

router.put('/reset-password/:token', (req, res, next) => {
  res.send('PUT /reset-password/:token');
});

module.exports = router;
