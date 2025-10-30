const { z } = require('zod');
const validate = require('../middleware/validate');
const { success } = require('../utils/http');
const { uploadBase64Image } = require('../lib/cloudinary');

const schema = z.object({
  body: z.object({
    dataUrl: z.string().min(10), // "data:image/jpeg;base64,...."
  })
});

const upload = [
  validate(schema),
  async (req, res, next) => {
    try {
      const url = await uploadBase64Image(
        req.valid.body.dataUrl,
        process.env.CLOUDINARY_UPLOAD_FOLDER || 'tenant-guard'
      );
      return success(res, { url }, 201);
    } catch (e) { next(e); }
  }
];

module.exports = { upload };
