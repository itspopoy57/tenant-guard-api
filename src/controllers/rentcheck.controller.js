const { z } = require('zod');
const prisma = require('../lib/prisma');
const { success } = require('../utils/http');

// This is what the mobile app sends now
const schema = z.object({
  address: z.string().min(3),
  city: z.string().min(2),
  rent: z.number().int().min(1),
  bedrooms: z.string().min(1),
});

function bedroomsAsInt(b) {
  const m = String(b).match(/\d+/);
  if (!m) return 1;
  const n = parseInt(m[0], 10);
  if (Number.isNaN(n) || n <= 0) return 1;
  return n;
}

async function check(req, res, next) {
  try {
    console.log('🧪 rentcheck.controller.check called');
    console.log('🧪 req.user =', req.user);
    console.log('🧪 req.body =', req.body);

    const userId = req.user?.id;
    if (!userId) {
      console.log('🧪 NO USER -> 401');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // validate new body shape
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      console.log('🧪 schema failed', parsed.error.issues);
      return res.status(400).json({
        error: 'Invalid input (new schema)',
        details: parsed.error.issues,
      });
    }

    const { address, city, rent, bedrooms } = parsed.data;
    console.log('🧪 parsed.data =', parsed.data);

    const prop = await prisma.property.findFirst({
      where: {
        address: { equals: address, mode: 'insensitive' },
        city: { equals: city, mode: 'insensitive' },
      },
      include: {
        ratings: true,
        reports: true,
      },
    });

    let avgScore = null;
    let issuesCount = 0;

    if (prop) {
      if (prop.ratings.length > 0) {
        const sum = prop.ratings.reduce((acc, r) => acc + r.overall, 0);
        avgScore = sum / prop.ratings.length;
      }
      issuesCount = prop.reports.length;
    }

    const bedsInt = bedroomsAsInt(bedrooms);
    const baseline = bedsInt * 800 + 200;
    const ratio = rent / baseline;

    let riskLevel = 'low';
    let summary = 'Rent seems reasonable for this size.';

    if (ratio >= 1.3) {
      riskLevel = 'high';
      summary = 'Rent looks VERY high for what it is.';
    } else if (ratio >= 1.1) {
      riskLevel = 'medium';
      summary = 'Rent is a bit high compared to similar places.';
    }

    if (issuesCount >= 3 && riskLevel !== 'high') {
      riskLevel = 'medium';
      summary += ' This building has multiple past complaints.';
    }
    if (issuesCount >= 5) {
      riskLevel = 'high';
      summary = '⚠ Tenants reported serious recurring problems in this building.';
    }

    const payload = {
      riskLevel,
      summary,
      avgScore,
      issuesCount,
      debug: {
        address,
        city,
        rent,
        bedrooms,
        baseline,
        ratio,
        propertyId: prop?.id || null,
      },
    };

    console.log('🧪 sending payload:', payload);
    return success(res, payload);
  } catch (e) {
    console.log('🧨 rentcheck.controller.check ERROR:', e);
    next(e);
  }
}

module.exports = {
  check,
};
