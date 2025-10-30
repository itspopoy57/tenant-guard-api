const { z } = require('zod');
const { success, HttpError } = require('../utils/http');
const validate = require('../middleware/validate');
const service = require('../services/properties.service');
const { getPropertyWithDetails } = require('../services/propertyWithDetails.service');

// ========== SCHEMAS ==========

const listSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    city: z.string().optional(),
  }),
});

const createSchema = z.object({
  body: z.object({
    address: z.string().min(3),
    city: z.string().min(2),
    province: z.string().min(2),
    postalCode: z.string().min(3),
    landlordId: z.string().optional().nullable(),
  }),
});

// ========== CONTROLLERS ==========

// GET /properties
const list = [
  validate(listSchema),
  async (req, res, next) => {
    try {
      const { q, city } = req.valid.query;
      const out = await service.list({ q, city });
      return success(res, out);
    } catch (e) {
      next(e);
    }
  },
];

// GET /properties/:id
async function getOne(req, res, next) {
  try {
    const { id } = req.params;

    const data = await getPropertyWithDetails(id);
    if (!data) {
      return res.status(404).json({ error: 'Property not found' });
    }

    return success(res, data);
  } catch (e) {
    next(e);
  }
}

// POST /properties
const create = [
  validate(createSchema),
  async (req, res, next) => {
    try {
      const out = await service.create(req.valid.body);
      return success(res, out, 201);
    } catch (e) {
      next(e);
    }
  },
];

// ========== EXPORTS ==========
module.exports = {
  list,
  getOne,
  create,
};
