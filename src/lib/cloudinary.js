const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadBase64Image(dataUrl, folder='tenant-guard') {
  const res = await cloudinary.uploader.upload(dataUrl, {
    folder,
    resource_type: 'image',
  });
  return res.secure_url;
}

module.exports = { uploadBase64Image };
