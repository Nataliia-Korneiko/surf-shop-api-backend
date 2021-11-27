const { Post } = require('../models');

const getPosts = async (req, res, next) => {
  const posts = await Post.find({});

  res.render('posts/index', { posts });
};

const newPost = (req, res, next) => {
  res.render('posts/new');
};

const createPost = async (req, res, next) => {
  const post = await Post.create(req.body.post);

  res.redirect(`/api/v1/posts/${post.id}`);
};

const showPost = async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  res.render('posts/show', { post });
};

const editPost = async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  res.render('posts/edit', { post });
};

const updatePost = async (req, res, next) => {
  const post = await Post.findByIdAndUpdate(req.params.id, req.body.post, {
    new: true,
  });

  res.redirect(`/api/v1/posts/${post.id}`);
};

const deletePost = async (req, res, next) => {
  await Post.findByIdAndRemove(req.params.id);

  res.redirect('/api/v1/posts');
};

module.exports = {
  getPosts,
  newPost,
  createPost,
  showPost,
  editPost,
  updatePost,
  deletePost,
};
