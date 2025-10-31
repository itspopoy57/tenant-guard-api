const { z } = require('zod');
const { success } = require('../utils/http');
const validate = require('../middleware/validate');
const service = require('../services/reports.service');

// What the app sends from ReportNew:
// propertyId, category, severity, text, mediaUrl
const createSchema = z.object({
  body: z.object({
    propertyId: z.string().min(1, 'propertyId required'),
    category: z.string().min(1, 'category required'),
    severity: z.number().int().min(1).max(5),
    text: z.string().min(1, 'text required'),
    mediaUrl: z.string().url().optional().nullable(),
  }),
});

const create = [
  validate(createSchema),
  async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { propertyId, category, severity, text, mediaUrl } = req.valid.body;

      const out = await service.create({
        propertyId,
        userId,
        category,
        severity,
        text,
        mediaUrl: mediaUrl ?? null,
      });

      return success(res, out, 201);
    } catch (e) {
      next(e);
    }
  },
];

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
