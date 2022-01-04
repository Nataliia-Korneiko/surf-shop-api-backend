const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary');
const {
  asyncErrorHandler,
  isLoggedIn,
  isAuthor,
  searchAndFilterPosts,
} = require('../middleware');
const {
  getPosts,
  newPost,
  createPost,
  showPost,
  editPost,
  updatePost,
  deletePost,
} = require('../controllers/posts');

const upload = multer({ storage });

router.get(
  '/',
  asyncErrorHandler(searchAndFilterPosts),
  asyncErrorHandler(getPosts)
);
router.get('/new', isLoggedIn, newPost);
router.post(
  '/',
  isLoggedIn,
  upload.array('images', 4),
  asyncErrorHandler(createPost)
);
router.get('/:id', asyncErrorHandler(showPost));
router.get('/:id/edit', isLoggedIn, asyncErrorHandler(isAuthor), editPost);
router.put(
  '/:id',
  isLoggedIn,
  asyncErrorHandler(isAuthor),
  upload.array('images', 4),
  asyncErrorHandler(updatePost)
);
router.delete(
  '/:id',
  isLoggedIn,
  asyncErrorHandler(isAuthor),
  asyncErrorHandler(deletePost)
);

module.exports = router;
