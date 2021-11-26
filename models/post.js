const { model } = require('mongoose');
const { PostSchema } = require('./schemas');

const Post = model('Post', PostSchema);

module.exports = Post;
