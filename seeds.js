/* eslint-disable no-unused-vars */
const faker = require('faker');
const { Post, Review } = require('./models');
const cities = require('./cities');

// 40 posts
// const seedPosts = async () => {
//   await Post.remove({});

//   for (const i of new Array(40)) {
//     const post = {
//       title: faker.lorem.word(),
//       description: faker.lorem.text(),
//       coordinates: [-122.0842499, 37.4224764],
//       author: {
//         _id: '61aa3c8eb30f3b8b0c9f290c',
//         username: 'Matt',
//       },
//     };

//     await Post.create(post);
//   }

//   console.log('40 new posts created');
// };

// 600 posts
const seedPosts = async () => {
  await Post.deleteMany({});
  await Review.deleteMany({});

  for (const i of new Array(600)) {
    const random1000 = Math.floor(Math.random() * 1000);
    const random5 = Math.floor(Math.random() * 6); // 0-5
    const title = faker.lorem.word();
    const description = faker.lorem.text();
    const postData = {
      title,
      description,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      geometry: {
        type: 'Point',
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      price: random1000,
      avgRating: random5,
      author: '61aa3c8eb30f3b8b0c9f290c',
      images: [
        {
          url: '',
        },
      ],
    };

    const post = new Post(postData);

    post.properties.description = `<strong><a href="/api/v1/posts/${
      post._id
    }">${title}</a></strong>
    <p>${post.location}</p>
    <p>${description.substring(0, 20)}...</p>`;

    await post.save();
  }

  console.log('600 new posts created');
};

module.exports = seedPosts;
