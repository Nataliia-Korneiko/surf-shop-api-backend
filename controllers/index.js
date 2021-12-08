const { Post } = require('../models');

const { MAPBOX_ACCESS_TOKEN } = process.env;
const mapBoxToken = MAPBOX_ACCESS_TOKEN;

const landingPage = async (req, res, next) => {
  const posts = await Post.find({});

  res.render('index', { posts, mapBoxToken, title: 'Home' });
};

module.exports = {
  landingPage,
};
