const { success } = require('../utils/http');
const ratingService = require('../services/ratings.service');

// POST /ratings  — accepts stars or overall (1..5), normalizes to stars
async function create(req, res, next) {
  try {
    const { propertyId } = req.body || {};
    let { stars, overall, pros, cons, note } = req.body || {};

    const s = Number(stars ?? overall);
    if (!propertyId) return res.status(400).json({ error: 'propertyId is required' });
    if (!Number.isInteger(s) || s < 1 || s > 5) {
      return res.status(400).json({ error: 'stars/overall must be an integer 1..5' });
    }

    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const saved = await ratingService.create({
      propertyId,
      userId,
      stars: s, // service maps stars -> overall in DB
      pros: Array.isArray(pros) ? pros : [],
      cons: Array.isArray(cons) ? cons : [],
      note: typeof note === 'string' && note.trim() ? note.trim() : null,
    });

    return success(res, saved, 201);
  } catch (e) { next(e); }
}

// GET /ratings/:propertyId — list + summary
async function byProperty(req, res, next) {
  try {
    const { propertyId } = req.params;
    const data = await ratingService.listByProperty(propertyId);
    return success(res, data);
  } catch (e) { next(e); }
}

module.exports = { create, byProperty };
