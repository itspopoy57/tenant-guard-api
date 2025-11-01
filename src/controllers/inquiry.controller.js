const { z } = require('zod');
const prisma = require('../lib/prisma');
const { success } = require('../utils/http');

// validate body
const inquirySchema = z.object({
  body: z.object({
    propertyId: z.string().min(1, 'propertyId is required'),
    name: z.string().min(1, 'name is required'),
    email: z.string().email('valid email required'),
    message: z.string().min(5, 'message is too short'),
  }),
});

const validate = require('../middleware/validate');

// POST /inquiry
const createInquiry = [
  validate(inquirySchema),
  async (req, res, next) => {
    try {
      const { propertyId, name, email, message } = req.valid.body;

      // optional: attach logged in user if token present
      // req.user exists only if auth middleware ran.
      // For now we’ll allow anonymous so we won't enforce auth here.
      const userId = req.user?.id || null;

      const saved = await prisma.rentalInquiry.create({
        data: {
          propertyId,
          name,
          email,
          message,
          userId,
        },
        select: {
          id: true,
          createdAt: true,
        },
      });

      return success(res, {
        inquiryId: saved.id,
        createdAt: saved.createdAt,
      }, 201);
    } catch (e) {
      next(e);
    }
  },
];

module.exports = {
  createInquiry,
};
