const prisma = require('../lib/prisma');

async function list({ q, city }) {
  const where = {
    AND: [
      q ? { OR: [
        { address: { contains: q, mode: 'insensitive' } },
        { postalCode: { contains: q, mode: 'insensitive' } },
      ] } : {},
      city ? { city } : {},
    ]
  };
  return prisma.property.findMany({ where, take: 50, orderBy: { address: 'asc' } });
}

async function getById(id) {
  return prisma.property.findUnique({
    where: { id },
    include: { ratings: true, reports: true },
  });
}

async function create({ address, city, province, postalCode, landlordId }) {
  return prisma.property.create({
    data: { address, city, province, postalCode, landlordId: landlordId || null },
  });
}

module.exports = { list, getById, create };
