const prisma = require('../lib/prisma');

// Create (or keep) a confirmation that "I also have this problem"
async function confirmReport({ reportId, userId }) {
  // 1. Make sure the report exists
  const report = await prisma.report.findUnique({
    where: { id: reportId },
  });
  if (!report) {
    const err = new Error('Report not found');
    err.status = 404;
    throw err;
  }

  // 2. Upsert confirmation so the same user can't spam it
  //    Uses the @@unique([reportId, userId]) constraint in your Prisma model
  await prisma.reportConfirmation.upsert({
    where: {
      reportId_userId: {
        reportId,
        userId,
      },
    },
    create: {
      reportId,
      userId,
    },
    update: {}, // nothing to update if it already exists
  });

  // 3. Recount how many tenants confirmed this issue
  const total = await prisma.reportConfirmation.count({
    where: { reportId },
  });

  // 4. Return that number so frontend can update fast
  return {
    reportId,
    confirmations: total,
  };
}

module.exports = {
  confirmReport,
};
