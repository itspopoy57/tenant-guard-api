const { z } = require('zod');
const { success } = require('../utils/http');
const validate = require('../middleware/validate');
const service = require('../services/ratings.service');

// This matches what the mobile app sends now
const createSchema = z.object({
  body: z.object({
    propertyId: z.string().min(1, 'propertyId required'),

    overall: z.number().int().min(1).max(5),

    pros: z.array(z.string()).default([]),
    cons: z.array(z.string()).default([]),

    note: z.string().trim().optional().default(''),

    maintenance: z.number().int().min(1).max(5).optional(),
    noise: z.number().int().min(1).max(5).optional(),
    response: z.number().int().min(1).max(5).optional(),
  }),
});

// POST /ratings
const create = [
  validate(createSchema),
  async (req, res, next) => {
    try {
      // auth middleware should have populated req.user
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const {
        propertyId,
        overall,
        pros,
        cons,
        note,
        maintenance,
        noise,
        response,
      } = req.valid.body;

      const out = await service.create({
        propertyId,
        userId,
        overall,
        pros,
        cons,
        note,
        maintenance,
        noise,
        response,
      });

      return success(res, out, 201);
    } catch (e) {
      next(e);
    }
  },
];

// GET /ratings/:propertyId
async function byProperty(req, res, next) {
  try {
    const { propertyId } = req.params;
    const rows = await service.listForProperty(propertyId);
    return success(res, rows);
  } catch (e) {
    next(e);
  }
}

module.exports = {
  create,
  byProperty,
};
