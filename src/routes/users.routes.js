const router = require('express').Router();
const prisma = require('../lib/prisma');

// we already have auth middleware in api/src/middleware/auth.js
const auth = require('../middleware/auth');

// GET /users/me/reports
router.get('/me/reports', auth, async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // pull ONLY this user's reports
    const rows = await prisma.report.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        category: true,
        severity: true,
        status: true,
        text: true,
        mediaUrl: true,
        createdAt: true,
        property: {
          select: {
            id: true,
            address: true,
            city: true,
            province: true,
            postalCode: true,
          },
        },
      },
    });

    return res.json({ ok: true, data: rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
