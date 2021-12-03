const faker = require('faker');
const { Post } = require('./models');

const seedPosts = async () => {
  await Post.remove({});

  for (const i of new Array(40)) {
    const post = {
      title: faker.lorem.word(),
      description: faker.lorem.text(),
      coordinates: [-122.0842499, 37.4224764],
      author: {
        _id: '61aa3c8eb30f3b8b0c9f290c',
        username: 'Matt',
      },
    };

    await Post.create(post);
  }

  console.log('40 new posts created');
};

module.exports = seedPosts;
