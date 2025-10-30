const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getPropertyWithDetails(id) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      reports: { orderBy: { createdAt: 'desc' } },
      ratings: {
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } },
      },
    },
  });

  if (!property) return null;

  const agg = await prisma.rating.aggregate({
    where: { propertyId: id },
    _avg: { overall: true },
    _count: { overall: true },
  });

  property.ratingsSummary = {
    avg: agg._avg.overall ?? 0,
    count: agg._count.overall ?? 0,
  };

  return property;
}

module.exports = { getPropertyWithDetails };
