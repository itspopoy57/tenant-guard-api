const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function create({ propertyId, userId, stars, pros, cons, note }) {
  return prisma.rating.create({
    data: {
      stars,
      pros: pros ?? [],
      cons: cons ?? [],
      note,
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
      _avg: { stars: true },
      _count: { stars: true },
    }),
  ]);

  return { items, avg: agg._avg.stars ?? 0, count: agg._count.stars ?? 0 };
}

module.exports = { create, listByProperty };
