const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary');
const { asyncErrorHandler } = require('../middleware');
const {
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  getLogout,
  getForgotPassword,
  putForgotPassword,
  getResetPassword,
  putResetPassword,
} = require('../controllers/auth');

const upload = multer({ storage });

router.get('/register', getRegister);
router.post(
  '/register',
  upload.single('image'),
  asyncErrorHandler(postRegister)
);
router.get('/login', getLogin);
router.post('/login', asyncErrorHandler(postLogin));
router.get('/logout', getLogout);
router.get('/forgot-password', getForgotPassword);
router.put('/forgot-password', asyncErrorHandler(putForgotPassword));
router.get('/reset-password/:token', asyncErrorHandler(getResetPassword));
router.put('/reset-password/:token', asyncErrorHandler(putResetPassword));

module.exports = router;
