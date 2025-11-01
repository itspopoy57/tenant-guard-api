const prisma = require('../lib/prisma');

// GET /properties (list)
async function list({ q, city }) {
  const where = {};

  if (q) {
    where.OR = [
      { address:    { contains: q, mode: 'insensitive' } },
      { city:       { contains: q, mode: 'insensitive' } },
      { postalCode: { contains: q, mode: 'insensitive' } },
    ];
  }

  if (city) {
    where.city = { equals: city, mode: 'insensitive' };
  }

  const props = await prisma.property.findMany({
    where,
    // some of your rows might not have createdAt - use id sort to be safe
    orderBy: { id: 'desc' },
  });

  return props;
}

// POST /properties
async function create(data) {
  // only pass fields prisma knows about
  const {
    address,
    city,
    province,
    postalCode,
    landlordId = null,
    yearBuilt = null,
    numUnits = null,
  } = data;

  const out = await prisma.property.create({
    data: {
      address,
      city,
      province,
      postalCode,
      landlordId,
      yearBuilt,
      numUnits,
    },
  });

  return out;
}

// used for GET /properties/search?q=...
async function searchWithSummary(q) {
  if (!q || !q.trim()) {
    return [];
  }

  const results = await prisma.property.findMany({
    where: {
      OR: [
        { address:    { contains: q, mode: 'insensitive' } },
        { city:       { contains: q, mode: 'insensitive' } },
        { postalCode: { contains: q, mode: 'insensitive' } },
      ],
    },
    take: 20,
    orderBy: { id: 'desc' }, // safe ordering
    include: {
      ratings: {
        select: { overall: true },
      },
      reports: {
        select: { id: true }, // we'll just count them in JS
      },
    },
  });

  return results.map((p) => {
    let avg = null;
    if (p.ratings.length > 0) {
      const total = p.ratings.reduce(
        (sum, r) => sum + (r.overall || 0),
        0
      );
      avg = total / p.ratings.length;
    }

    return {
      id: p.id,
      address: p.address,
      city: p.city,
      province: p.province,
      postalCode: p.postalCode,
      ratingsSummary: avg == null
        ? null
        : {
            avg,
            count: p.ratings.length,
          },
      reportsCount: p.reports.length,
    };
  });
}

async function getRecentSevereAlerts(propertyId) {
  // timeframe: last 30 days
  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
  const sinceDate = new Date(Date.now() - THIRTY_DAYS_MS);

  // "serious" = severity >= 4
  // status is not "fixed"
  // belongs to this property
  const reports = await prisma.report.findMany({
    where: {
      propertyId,
      severity: { gte: 4 },
      status: { not: 'fixed' },
      createdAt: { gte: sinceDate },
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      text: true,
      category: true,
      severity: true,
      createdAt: true,
    },
    take: 5, // we only need a sample for preview
  });

  return {
    count: reports.length,
    examples: reports.map(r => r.text).filter(Boolean),
  };
}


// full detail for Property screen (/properties/:id)
async function getByIdWithDetails(id) {
  if (!id) return null;

  const prop = await prisma.property.findUnique({
    where: { id },
    include: {
      landlord: true,
      ratings: {
        include: {
          user: { select: { id: true, email: true } },
        },
        orderBy: { id: 'desc' },
        take: 20,
      },
      reports: {
        include: {
          user: { select: { id: true, email: true } },
          confirmations: true,
        },
        orderBy: { id: 'desc' },
        take: 20,
      },
    },
  });

  if (!prop) return null;

  // compute ratingsSummary
  let ratingsSummary = null;
  if (prop.ratings.length > 0) {
    const total = prop.ratings.reduce(
      (sum, r) => sum + (r.overall || r.stars || 0),
      0
    );
    ratingsSummary = {
      avg: total / prop.ratings.length,
      count: prop.ratings.length,
    };
  }

  return {
    ...prop,
    ratingsSummary,
  };
}

module.exports = {
  list,
  create,
  searchWithSummary,
  getByIdWithDetails,
  getRecentSevereAlerts,
};
