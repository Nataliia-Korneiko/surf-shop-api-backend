const user = async () => {
  try {
    console.log('user');
  } catch (error) {
    throw new Error(error.message);
  }
};

module.exports = {
  user,
};
