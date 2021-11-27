const express = require('express');
const router = express.Router();
const { asyncErrorHandler } = require('../middleware');
const {
  getPosts,
  newPost,
  createPost,
  showPost,
  editPost,
  updatePost,
  deletePost,
} = require('../controllers/posts');

router.get('/', asyncErrorHandler(getPosts));
router.get('/new', newPost);
router.post('/', asyncErrorHandler(createPost));
router.get('/:id', asyncErrorHandler(showPost));
router.get('/:id/edit', asyncErrorHandler(editPost));
router.put('/:id', asyncErrorHandler(updatePost));
router.delete('/:id', asyncErrorHandler(deletePost));

module.exports = router;
