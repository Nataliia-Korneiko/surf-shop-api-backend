const { Post } = require('../models');

const { MAPBOX_ACCESS_TOKEN } = process.env;
const mapBoxToken = MAPBOX_ACCESS_TOKEN;

const landingPage = async (req, res, next) => {
  const posts = await Post.find({}).sort('-_id').exec();
  const recentPosts = posts.slice(0, 3);

  res.render('index', {
    posts,
    mapBoxToken,
    recentPosts,
    title: 'Home',
  });
};

module.exports = {
  landingPage,
};
