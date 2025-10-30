const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// We accept { propertyId, userId, stars, pros, cons, note }
// and store into model fields: overall (Int), pros String[], cons String[]
async function create({ propertyId, userId, stars, pros, cons, note }) {
  return prisma.rating.create({
    data: {
      overall: stars,                            // map stars -> overall (your schema)
      pros: { set: Array.isArray(pros) ? pros : [] },   // <-- scalar list create syntax
      cons: { set: Array.isArray(cons) ? cons : [] },   // <-- scalar list create syntax
      note: note ?? null,
      property: { connect: { id: propertyId } },
      user: { connect: { id: userId } },
    },
  });
}

async function listByProperty(propertyId) {
  const [items, agg] = await Promise.all([
    prisma.rating.findMany({
      where: { propertyId },
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, email: true } } },
    }),
    prisma.rating.aggregate({
      where: { propertyId },
      _avg: { overall: true },
      _count: { overall: true },
    }),
  ]);

  return {
    items,
    avg: agg._avg.overall ?? 0,
    count: agg._count.overall ?? 0,
  };
}

module.exports = { create, listByProperty };
