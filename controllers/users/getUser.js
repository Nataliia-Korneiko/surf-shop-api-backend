const getUser = async (req, res, next) => {
  try {
    console.log('getUser');
  } catch (error) {
    next(error);
  }
};

module.exports = getUser;
