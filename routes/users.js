const express = require('express');
const router = express.Router();

router.get('/profile', (req, res, next) => {
  res.send('GET /profile');
});

router.put('/profile/:user_id', (req, res, next) => {
  res.send('PUT /profile/:user_id');
});

module.exports = router;
