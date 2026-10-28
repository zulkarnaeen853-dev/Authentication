const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinaryConfig'); 


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'user_profile',
    allowed_formats: ["png", "jpeg", "jpg", "webp"]
  },
});

const upload = multer({ storage: storage});

module.exports = upload;
