/* eslint-disable camelcase */
const { Post } = require('../models');
const cloudinary = require('cloudinary').v2;
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  MAPBOX_ACCESS_TOKEN,
} = process.env;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const geocodingClient = mbxGeocoding({ accessToken: MAPBOX_ACCESS_TOKEN });

const getPosts = async (req, res, next) => {
  const posts = await Post.find({});

  res.render('posts/index', { posts });
};

const newPost = (req, res, next) => {
  res.render('posts/new');
};

const createPost = async (req, res, next) => {
  req.body.post.images = [];

  for (const file of req.files) {
    const image = await cloudinary.uploader.upload(file.path);

    req.body.post.images.push({
      url: image.secure_url,
      public_id: image.public_id,
    });
  }

  const response = await geocodingClient
    .forwardGeocode({
      query: req.body.post.location,
      limit: 1,
    })
    .send();

  req.body.post.coordinates = response.body.features[0].geometry.coordinates; // [ -96.7969, 32.7763 ]
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
  const post = await Post.findById(req.params.id); // Find the post by id

  // Check if there's any images for deletion
  if (req.body.deleteImages && req.body.deleteImages.length) {
    const deleteImages = req.body.deleteImages; // Assign deleteImages from req.body to its own variable

    // Loop over deleteImages
    for (const public_id of deleteImages) {
      await cloudinary.uploader.destroy(public_id); // Delete images from cloudinary

      // Delete image from post.images
      for (const image of post.images) {
        if (image.public_id === public_id) {
          const index = post.images.indexOf(image);
          post.images.splice(index, 1);
        }
      }
    }
  }

  // Check if there are any new images for upload
  if (req.files) {
    // Upload images
    for (const file of req.files) {
      const image = await cloudinary.uploader.upload(file.path);

      // Add images to post.images array
      post.images.push({
        url: image.secure_url,
        public_id: image.public_id,
      });
    }
  }

  // Check if location was updated
  if (req.body.post.location !== post.location) {
    const response = await geocodingClient
      .forwardGeocode({
        query: req.body.post.location,
        limit: 1,
      })
      .send();

    post.coordinates = response.body.features[0].geometry.coordinates;
    post.location = req.body.post.location;
  }

  // Update the post with any new properties
  post.title = req.body.post.title;
  post.description = req.body.post.description;
  post.price = req.body.post.price;

  post.save(); // Save the updated post into the db
  res.redirect(`/api/v1/posts/${post.id}`); // Redirect to show page
};

const deletePost = async (req, res, next) => {
  const post = await Post.findById(req.params.id);

  for (const image of post.images) {
    await cloudinary.uploader.destroy(image.public_id);
  }

  await post.remove();
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
