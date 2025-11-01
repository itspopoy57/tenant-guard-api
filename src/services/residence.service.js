const prisma = require('../lib/prisma');

async function claimResidence({ userId, propertyId }) {
  // create or return existing
  const rec = await prisma.tenantResidence.upsert({
    where: {
      userId_propertyId: {
        userId,
        propertyId,
      },
    },
    update: {}, // nothing to update
    create: {
      userId,
      propertyId,
    },
  });

  return rec;
}

async function hasResidence({ userId, propertyId }) {
  const found = await prisma.tenantResidence.findUnique({
    where: {
      userId_propertyId: {
        userId,
        propertyId,
      },
    },
    select: { id: true },
  });

  return !!found;
}

module.exports = {
  claimResidence,
  hasResidence,
};
