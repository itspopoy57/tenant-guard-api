const prisma = require('../lib/prisma');

// CREATE a new tenant report
async function create({ propertyId, userId, category, severity, text, mediaUrl }) {
  const report = await prisma.report.create({
    data: {
      propertyId,
      userId,
      category,
      severity,
      text,
      mediaUrl: mediaUrl || null,
      status: 'open',
    },
    select: {
      id: true,
      propertyId: true,
      category: true,
      severity: true,
      text: true,
      mediaUrl: true,
      status: true,
      createdAt: true,
    },
  });

  return report;
}

// LIST reports for one property (for Property page)
async function listForProperty(propertyId) {
  const rows = await prisma.report.findMany({
    where: { propertyId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, email: true },
      },
      confirmations: true,
    },
  });

  return rows.map((r) => ({
    id: r.id,
    propertyId: r.propertyId,
    category: r.category,
    severity: r.severity,
    status: r.status,
    text: r.text,
    mediaUrl: r.mediaUrl || null,
    createdAt: r.createdAt,
    user: r.user ? { id: r.user.id, email: r.user.email } : null,
    confirmationsCount: r.confirmations?.length || 0,
  }));
}

// CONFIRM "I have this too"
async function confirmIssue(reportId, userId) {
  // upsert so user can't spam multiple confirmations
  await prisma.reportConfirmation.upsert({
    where: {
      // unique compound constraint would be ideal: (reportId, userId)
      // if you don't have @@unique([reportId,userId]) yet in prisma schema,
      // you should add it. For now we hack by using cuid().
      id: `${reportId}__${userId}`,
    },
    create: {
      id: `${reportId}__${userId}`,
      reportId,
      userId,
    },
    update: {},
  });

  // count how many confirmations total now
  const count = await prisma.reportConfirmation.count({
    where: { reportId },
  });

  return {
    reportId,
    confirmations: count,
  };
}


// 🔥 NEW: contact timeline helpers 🔥

// fetch all contact timeline entries for a report
async function listContacts(reportId) {
  const contacts = await prisma.reportContact.findMany({
    where: { reportId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, email: true } },
    },
  });

  return contacts.map((c) => ({
    id: c.id,
    status: c.status,     // "reported" | "promised_fix" | "ignored"
    note: c.note || null, // optional text like "he said plumber Friday"
    createdAt: c.createdAt,
    user: c.user ? { id: c.user.id, email: c.user.email } : null,
  }));
}

// create a new contact timeline entry
async function addContact({ reportId, userId, status, note }) {
  const entry = await prisma.reportContact.create({
    data: {
      reportId,
      userId,
      status,
      note: note || null,
    },
    select: {
      id: true,
      status: true,
      note: true,
      createdAt: true,
      user: {
        select: { id: true, email: true },
      },
    },
  });

  return {
    id: entry.id,
    status: entry.status,
    note: entry.note,
    createdAt: entry.createdAt,
    user: entry.user
      ? { id: entry.user.id, email: entry.user.email }
      : null,
  };
}

module.exports = {
  create,
  listForProperty,
  confirmIssue,
  listContacts,  // NEW
  addContact,    // NEW
};
