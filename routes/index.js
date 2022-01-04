const express = require('express');
const router = express.Router();
const { asyncErrorHandler } = require('../middleware');
const { landingPage } = require('../controllers/index');

router.get('/', asyncErrorHandler(landingPage));

module.exports = router;
