const prisma = require('../lib/prisma');

// Create a safety/maintenance report
async function create({ propertyId, userId, category, severity, text, mediaUrl }) {
  return prisma.report.create({
    data: {
      category,
      severity,
      text,
      mediaUrl: mediaUrl ?? null,
      property: { connect: { id: propertyId } },
      user: { connect: { id: userId } },
    },
    include: {
      user: { select: { id: true, email: true } },
    },
  });
}

async function listForProperty(propertyId) {
  return prisma.report.findMany({
    where: { propertyId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, email: true } },
    },
  });
}

module.exports = {
  create,
  listForProperty,
};
