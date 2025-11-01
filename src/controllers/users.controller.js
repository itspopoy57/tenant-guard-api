// src/controllers/users.controller.js
const prisma = require('../lib/prisma');
const { success } = require('../utils/http');

// GET /users/me/reports
// requires auth (req.user.id must exist)
async function myReports(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // grab this user's reports, newest first
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
        _count: {
          select: {
            confirmations: true,
          },
        },
      },
    });

    return success(res, rows);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  myReports,
};
