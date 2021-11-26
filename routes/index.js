const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
  res.render('index', { title: 'Surf Shop - Home' });
});

module.exports = router;
