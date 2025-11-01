// api/src/controllers/watchlist.controller.js
const prisma = require('../lib/prisma');
const { success } = require('../utils/http');

// POST /watchlist  { propertyId }
// toggles: if not saved -> save, if saved -> remove
async function toggle(req, res, next) {
  try {
    const userId = req.user?.id;
    const { propertyId } = req.body || {};

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!propertyId) {
      return res.status(400).json({ error: 'propertyId required' });
    }

    // is it already saved?
    const existing = await prisma.watchlist.findUnique({
      where: {
        userId_propertyId: { userId, propertyId },
      },
    });

    if (existing) {
      // user already saved it -> REMOVE it
      await prisma.watchlist.delete({
        where: {
          userId_propertyId: { userId, propertyId },
        },
      });

      return success(res, { saved: false }, 200);
    }

    // not saved yet -> ADD it
    await prisma.watchlist.create({
      data: {
        userId,
        propertyId,
      },
    });

    return success(res, { saved: true }, 201);
  } catch (e) {
    next(e);
  }
}

// GET /watchlist
// return user's saved buildings WITH property info
async function list(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const rows = await prisma.watchlist.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        createdAt: true,
        property: {
          select: {
            id: true,
            address: true,
            city: true,
            province: true,
            postalCode: true,
            // you can also include summary stats like ratings, reports, etc
            ratings: {
              select: { overall: true },
            },
            reports: {
              select: { id: true },
            },
          },
        },
      },
    });

    // massage into nicer shape for the app
    const out = rows
      .filter(r => r.property) // safety: drop weird rows
      .map(r => {
        const p = r.property;
        const avg =
          p.ratings && p.ratings.length
            ? (
                p.ratings.reduce(
                  (sum, x) => sum + (x.overall || 0),
                  0
                ) / p.ratings.length
              )
            : null;

        return {
          id: p.id,
          address: p.address,
          city: p.city,
          province: p.province,
          postalCode: p.postalCode,
          avgRating: avg,
          issuesCount: p.reports?.length || 0,
          savedAt: r.createdAt,
        };
      });

    return success(res, out, 200);
  } catch (e) {
    next(e);
  }
}

// GET /watchlist/isSaved/:propertyId
// lets Property screen know if star should be filled
async function isSaved(req, res, next) {
  try {
    const userId = req.user?.id;
    const { propertyId } = req.params;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const item = await prisma.watchlist.findUnique({
      where: {
        userId_propertyId: { userId, propertyId },
      },
      select: { userId: true, propertyId: true },
    });

    return success(res, { saved: !!item }, 200);
  } catch (e) {
    next(e);
  }
}

module.exports = {
  toggle,
  list,
  isSaved,
};
