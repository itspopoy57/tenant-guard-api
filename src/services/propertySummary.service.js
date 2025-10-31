const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get aggregate quality summary for a property:
 * - averages for stars / maintenance / noise / response
 * - most common pros/cons tags
 */
async function getPropertySummary(propertyId) {
  // 1. pull all ratings for this property
  const ratings = await prisma.rating.findMany({
    where: { propertyId },
    select: {
      overall: true,
      maintenance: true,
      noise: true,
      response: true,
      pros: true, // assuming pros is String[] (we will handle if undefined)
      cons: true, // same
    },
  });

  if (!ratings || ratings.length === 0) {
    // No data yet
    return {
      overallAvg: null,
      maintenanceAvg: null,
      noiseAvg: null,
      responseAvg: null,
      topPros: [],
      topCons: [],
      count: 0,
    };
  }

  // helpers
  function avgOf(field) {
    const nums = ratings
      .map(r => r[field])
      .filter(v => typeof v === 'number');
    if (nums.length === 0) return null;
    const sum = nums.reduce((a, b) => a + b, 0);
    return Number((sum / nums.length).toFixed(1));
  }

  // build frequency maps for pros/cons tags
  const prosFreq = {};
  const consFreq = {};

  for (const r of ratings) {
    if (Array.isArray(r.pros)) {
      for (const tag of r.pros) {
        prosFreq[tag] = (prosFreq[tag] || 0) + 1;
      }
    }
    if (Array.isArray(r.cons)) {
      for (const tag of r.cons) {
        consFreq[tag] = (consFreq[tag] || 0) + 1;
      }
    }
  }

  function topN(freqMap, n = 3) {
    return Object.entries(freqMap)
      .sort((a, b) => b[1] - a[1]) // high to low
      .slice(0, n)
      .map(([tag]) => tag);
  }

  return {
    overallAvg: avgOf('overall'),
    maintenanceAvg: avgOf('maintenance'),
    noiseAvg: avgOf('noise'),
    responseAvg: avgOf('response'),
    topPros: topN(prosFreq, 3),
    topCons: topN(consFreq, 3),
    count: ratings.length,
  };
}

module.exports = { getPropertySummary };
