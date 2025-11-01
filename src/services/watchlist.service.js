const prisma = require('../lib/prisma');

async function add(userId, propertyId) {
  const wl = await prisma.watchlist.create({
    data: { userId, propertyId },
    select: {
      id: true,
      createdAt: true,
      property: {
        select: {
          id: true, address: true, city: true, province: true, postalCode: true,
          _count: { select: { reports: true } },
          ratings: { select: { overall: true } },
        },
      },
    },
  });
  // quick avg
  let avg = null;
  if (wl.property.ratings.length) {
    const total = wl.property.ratings.reduce((s, r) => s + (r.overall || 0), 0);
    avg = total / wl.property.ratings.length;
  }
  return {
    id: wl.id,
    createdAt: wl.createdAt,
    property: {
      id: wl.property.id,
      address: wl.property.address,
      city: wl.property.city,
      province: wl.property.province,
      postalCode: wl.property.postalCode,
      reportsCount: wl.property._count.reports,
      avgRating: avg,
    },
  };
}

async function remove(userId, propertyId) {
  await prisma.watchlist.deleteMany({ where: { userId, propertyId } });
}

async function isSaved(userId, propertyId) {
  const x = await prisma.watchlist.findFirst({ where: { userId, propertyId }, select: { id: true } });
  return !!x;
}

async function listMine(userId) {
  const rows = await prisma.watchlist.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      createdAt: true,
      property: {
        select: {
          id: true, address: true, city: true, province: true, postalCode: true,
          _count: { select: { reports: true } },
          ratings: { select: { overall: true } },
        },
      },
    },
  });

  return rows.map(r => {
    let avg = null;
    if (r.property.ratings.length) {
      const t = r.property.ratings.reduce((s, rr) => s + (rr.overall || 0), 0);
      avg = t / r.property.ratings.length;
    }
    return {
      id: r.id,
      createdAt: r.createdAt,
      property: {
        id: r.property.id,
        address: r.property.address,
        city: r.property.city,
        province: r.property.province,
        postalCode: r.property.postalCode,
        reportsCount: r.property._count.reports,
        avgRating: avg,
      },
    };
  });
}

module.exports = { add, remove, isSaved, listMine };
