const prisma = require('../lib/prisma');

// Create a rating for a property by a user
// Body shape expected from frontend:
// {
//   propertyId: string,
//   overall: number (1-5)          <-- required
//   pros: string[],
//   cons: string[],
//   note: string (optional),
//   maintenance?: number,
//   noise?: number,
//   response?: number
// }
async function create({
  propertyId,
  userId,
  overall,
  pros,
  cons,
  note,
  maintenance,
  noise,
  response,
}) {
  return prisma.rating.create({
    data: {
      overall,
      maintenance: maintenance ?? null,
      noise: noise ?? null,
      response: response ?? null,
      note: note ?? null,
      pros: pros ?? [],
      cons: cons ?? [],
      property: { connect: { id: propertyId } },
      user: { connect: { id: userId } },
    },
    include: {
      user: {
        select: { id: true, email: true },
      },
    },
  });
}

// Get all ratings for a property (for debugging / future UI use)
async function listForProperty(propertyId) {
  return prisma.rating.findMany({
    where: { propertyId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, email: true },
      },
    },
  });
}

module.exports = {
  create,
  listForProperty,
};
