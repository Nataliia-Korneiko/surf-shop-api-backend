const express = require('express');
const router = express.Router();
const multer = require('multer');
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

const upload = multer({ dest: 'uploads/' });

router.get('/', asyncErrorHandler(getPosts));
router.get('/new', newPost);
router.post('/', upload.array('images', 4), asyncErrorHandler(createPost));
router.get('/:id', asyncErrorHandler(showPost));
router.get('/:id/edit', asyncErrorHandler(editPost));
router.put('/:id', upload.array('images', 4), asyncErrorHandler(updatePost));
router.delete('/:id', asyncErrorHandler(deletePost));

module.exports = router;
