const { z } = require('zod');
const { success } = require('../utils/http');
const validate = require('../middleware/validate');
const service = require('../services/reports.service');
const prisma = require('../lib/prisma');

// ---------------------------
// CREATE a report
// ---------------------------
const createSchema = z.object({
  body: z.object({
    propertyId: z.string().min(1, 'propertyId required'),
    category: z.string().min(1, 'category required'),
    severity: z.number().int().min(1).max(5),
    text: z.string().min(1, 'text required'),
    mediaUrl: z.string().url().optional().nullable(),
  }),
});

const create = [
  validate(createSchema),
  async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { propertyId, category, severity, text, mediaUrl } = req.valid.body;

      const out = await service.create({
        propertyId,
        userId,
        category,
        severity,
        text,
        mediaUrl: mediaUrl ?? null,
      });

      return success(res, out, 201);
    } catch (e) {
      next(e);
    }
  },
];

// ---------------------------
// LIST reports for a property
// ---------------------------
async function byProperty(req, res, next) {
  try {
    const { propertyId } = req.params;
    const rows = await service.listForProperty(propertyId);
    return success(res, rows);
  } catch (e) {
    next(e);
  }
}

// ---------------------------
// GET one report by ID
// ---------------------------
async function getOne(req, res, next) {
  try {
    const { id } = req.params;

    const r = await prisma.report.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, email: true },
        },
        confirmations: {
          select: { id: true },
        },
      },
    });

    if (!r) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const out = {
      id: r.id,
      propertyId: r.propertyId,
      category: r.category,
      severity: r.severity,
      status: r.status,
      text: r.text,
      mediaUrl: r.mediaUrl,
      createdAt: r.createdAt,
      user: r.user ? { id: r.user.id, email: r.user.email } : null,
      confirmationsCount: r.confirmations?.length || 0,
    };

    return success(res, out);
  } catch (e) {
    next(e);
  }
}

// ---------------------------
// PATCH /reports/:id/status
// body: { status: "fixed" | "ignored" | "new" }
// only the original reporter can do this
// ---------------------------
async function updateStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const allowed = ['new', 'fixed', 'ignored', 'open'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const report = await prisma.report.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (report.userId !== userId) {
      return res.status(403).json({ error: 'Not allowed' });
    }

    const updated = await prisma.report.update({
      where: { id },
      data: { status },
      select: { id: true, status: true },
    });

    return success(res, updated);
  } catch (e) {
    next(e);
  }
}

// ---------------------------
// POST /confirm/reports/:id/confirm
// "I have this too"
// ---------------------------
async function confirmIssue(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;
    const out = await service.confirmIssue(id, userId);

    return success(res, out);
  } catch (e) {
    next(e);
  }
}

// ---------------------------
// NEW: GET /reports/:id/contacts
// timeline of landlord contact attempts for this issue
// ---------------------------
async function getContacts(req, res, next) {
  try {
    const { id } = req.params; // reportId
    // (this route can be public/readable, doesn't strictly need auth)
    const contacts = await service.listContacts(id);
    return success(res, contacts);
  } catch (e) {
    next(e);
  }
}

// ---------------------------
// NEW: POST /reports/:id/contact
// body: { status: "reported" | "promised_fix" | "ignored", note?: string }
// only logged-in user can add
// ---------------------------
const addContactSchema = z.object({
  body: z.object({
    status: z.enum(['reported', 'promised_fix', 'ignored']),
    note: z.string().optional(),
  }),
});

const addContact = [
  validate(addContactSchema),
  async (req, res, next) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { id } = req.params; // reportId
      const { status, note } = req.valid.body;

      const entry = await service.addContact({
        reportId: id,
        userId,
        status,
        note,
      });

      return success(res, entry, 201);
    } catch (e) {
      next(e);
    }
  },
];

module.exports = {
  create,
  byProperty,
  getOne,
  updateStatus,
  confirmIssue,
  getContacts,   // NEW
  addContact,    // NEW
};
