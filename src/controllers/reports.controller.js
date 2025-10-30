const { z } = require('zod');
const validate = require('../middleware/validate');
const { success } = require('../utils/http');
const reportService = require('../services/reports.service');

const createSchema = z.object({
  body: z.object({
    propertyId: z.string().min(1),
    category: z.string().min(1),
    severity: z.number().int().min(1).max(5),
    text: z.string().min(1),
    mediaUrl: z.string().url().optional().nullable(),
  })
});

const create = [
  validate(createSchema),
  async (req, res, next) => {
    try {
      // req.user is set by your auth middleware
      const userId = req.user?.id;
      if (!userId) throw new Error('Missing authenticated user');

      const payload = { ...req.valid.body, userId };
      const saved = await reportService.create(payload);
      return success(res, saved, 201);
    } catch (e) { next(e); }
  }
];

module.exports = { create };
