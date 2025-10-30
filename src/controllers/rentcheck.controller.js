const { z } = require('zod');
const { success } = require('../utils/http');
const validate = require('../middleware/validate');
const service = require('../services/rentcheck.service');

const schema = z.object({
  body: z.object({
    province: z.string().default('QC').optional(),
    base: z.number().int().min(1),
    proposed: z.number().int().min(1),
    year: z.number().int().min(1900),
    majorWork: z.boolean().optional().default(false),
  })
});

const create = [
  validate(schema),
  async (req, res, next) => {
    try {
      const out = await service.create({ userId: req.user.id, ...req.valid.body });
      return success(res, out, 201);
    } catch (e) { next(e); }
  }
];

module.exports = { create };
