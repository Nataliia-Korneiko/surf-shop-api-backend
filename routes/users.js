const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary');
const {
  asyncErrorHandler,
  isLoggedIn,
  isValidPassword,
  changePassword,
} = require('../middleware');
const { getProfile, updateProfile } = require('../controllers/users');

const upload = multer({ storage });

router.get('/profile', isLoggedIn, asyncErrorHandler(getProfile));
router.put(
  '/profile',
  isLoggedIn,
  upload.single('image'),
  asyncErrorHandler(isValidPassword),
  asyncErrorHandler(changePassword),
  asyncErrorHandler(updateProfile)
);

module.exports = router;
