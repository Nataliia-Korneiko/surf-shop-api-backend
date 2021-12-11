const express = require('express');
const router = express.Router();
const {
  asyncErrorHandler,
  isLoggedIn,
  isValidPassword,
  changePassword,
} = require('../middleware');
const { getProfile, updateProfile } = require('../controllers/users');

router.get('/profile', isLoggedIn, asyncErrorHandler(getProfile));
router.put(
  '/profile',
  isLoggedIn,
  asyncErrorHandler(isValidPassword),
  asyncErrorHandler(changePassword),
  asyncErrorHandler(updateProfile)
);

module.exports = router;
