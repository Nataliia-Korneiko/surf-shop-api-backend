const crypto = require('crypto');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
  process.env;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let buf = crypto.randomBytes(16);
    buf = buf.toString('hex');

    let uniqFileName = file.originalname.replace(/\.jpeg|\.jpg|\.png/gi, '');
    uniqFileName += buf;

    return {
      folder: 'surf-shop',
      format: 'jpeg',
      filename: uniqFileName,
    };
  },
});

module.exports = {
  cloudinary,
  storage,
};
