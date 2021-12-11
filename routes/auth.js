const express = require('express');
const router = express.Router();
const { asyncErrorHandler } = require('../middleware');
const {
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  getLogout,
} = require('../controllers/auth');

router.get('/register', getRegister);
router.post('/register', asyncErrorHandler(postRegister));
router.get('/login', getLogin);
router.post('/login', asyncErrorHandler(postLogin));
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
