const { z } = require('zod');
const { success, HttpError } = require('../utils/http');
const validate = require('../middleware/validate');
const service = require('../services/properties.service');

const prisma = require('../lib/prisma'); // ⬅ needed for existence check
const residenceService = require('../services/residence.service'); // ⬅ new service for "I live here"


// -----------------------------
// Schemas
// -----------------------------

// schema used for GET /properties (list)
const listSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    city: z.string().optional(),
  }),
});

// schema for POST /properties (create new building)
const createSchema = z.object({
  body: z.object({
    address: z.string().min(3),
    city: z.string().min(1),
    province: z.string().min(1),
    postalCode: z.string().min(3),

    landlordId: z.string().optional().nullable(),
    yearBuilt: z.number().optional().nullable(),
    numUnits: z.number().optional().nullable(),
  }),
});

// (optional) for PATCH /properties/:id/contact-landlord later we'll add schema here


// -----------------------------
// GET /properties   (legacy list)
// -----------------------------
const list = [
  validate(listSchema),
  async (req, res, next) => {
    try {
      // prefer parsed safe data
      const { q, city } = req.valid?.query ?? req.query ?? {};
      const out = await service.list({ q, city });
      return success(res, out);
    } catch (e) {
      next(e);
    }
  },
];


// -----------------------------
// GET /properties/search?q=...   (lightweight search for FindPlace)
// -----------------------------
async function searchLight(req, res, next) {
  try {
    const q = req.query.q || '';
    const out = await service.searchWithSummary(q);
    return success(res, out);
  } catch (e) {
    next(e);
  }
}


// -----------------------------
// GET /properties/:id/alerts     (recent severe alerts for banner)
// -----------------------------
async function getAlerts(req, res, next) {
  try {
    const { id } = req.params;
    const alerts = await service.getRecentSevereAlerts(id);
    return success(res, alerts);
  } catch (e) {
    next(e);
  }
}


// -----------------------------
// GET /properties/:id
// full property view with ratings, reports, etc
// -----------------------------
async function getOne(req, res, next) {
  try {
    const { id } = req.params;
    const data = await service.getByIdWithDetails(id);
    if (!data) {
      return res.status(404).json({ error: 'Property not found' });
    }
    return success(res, data);
  } catch (e) {
    next(e);
  }
}


// -----------------------------
// POST /properties
// mobile "Add this building"
// -----------------------------
const create = [
  validate(createSchema),
  async (req, res, next) => {
    try {
      // tolerate missing validate() in early mobile calls
      const payload = req.valid?.body ?? req.body ?? {};

      // minimal required fields to avoid prisma crash
      if (
        !payload.address ||
        !payload.city ||
        !payload.province ||
        !payload.postalCode
      ) {
        throw new HttpError(
          400,
          'Missing required fields for property'
        );
      }

      const out = await service.create(payload);
      return success(res, out, 201);
    } catch (e) {
      next(e);
    }
  },
];


// ==================================================================
// NEW FEATURE: tenant "I live here" claim
// ==================================================================
//
// GET  /properties/:id/claim-status
// POST /properties/:id/claim
//
// We use residenceService + prisma to:
//  - verify property exists
//  - upsert TenantResidence(userId, propertyId)
//  - tell the app if already claimed
// ==================================================================


// GET /properties/:id/claim-status
// requires auth middleware, BUT if user isn't authed we just return claimed:false
async function claimStatus(req, res, next) {
  try {
    const userId = req.user?.id;
    const { id: propertyId } = req.params;

    // if not logged in, just answer "no" so UI can show the CTA
    if (!userId) {
      return success(res, { claimed: false });
    }

    const claimed = await residenceService.hasResidence({
      userId,
      propertyId,
    });

    return success(res, { claimed });
  } catch (e) {
    next(e);
  }
}


// POST /properties/:id/claim
// requires auth; creates TenantResidence row (or returns existing)
async function claimResidence(req, res, next) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id: propertyId } = req.params;

    // make sure property still exists
    const prop = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { id: true },
    });
    if (!prop) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const rec = await residenceService.claimResidence({
      userId,
      propertyId,
    });

    return success(res, {
      claimed: true,
      residenceId: rec.id,
    });
  } catch (e) {
    next(e);
  }
}




async function getLandlordContact(req, res, next) {
  try {
    const propertyId = req.params.id;

    // who is asking?
    const userId = req.user?.id;

    // if they're not even logged in just return locked
    if (!userId) {
      return success(res, { locked: true });
    }

    // do we have an approved claim?
    const claim = await prisma.propertyClaim.findUnique({
      where: {
        userId_propertyId: {
          userId,
          propertyId,
        },
      },
      select: { status: true },
    });

    const isApproved = claim?.status === 'approved';

    if (!isApproved) {
      // not approved -> don't leak phone/email
      return success(res, { locked: true });
    }

    // ok approved. get landlord info
    const prop = await prisma.property.findUnique({
      where: { id: propertyId },
      select: {
        landlord: {
          select: {
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    // if property has no landlord row yet, just return empty
    if (!prop || !prop.landlord) {
      return success(res, {
        locked: false,
        landlord: null,
      });
    }

    return success(res, {
      locked: false,
      landlord: prop.landlord,
    });
  } catch (e) {
    next(e);
  }
}


// GET /properties/:id/landlordContact
async function getLandlordContact(req, res, next) {
  try {
    const { id } = req.params; // propertyId
    const userId = req.user?.id || null; // may be undefined if not logged in

    // 1. Get the property + landlord basic info
    const property = await prisma.property.findUnique({
      where: { id },
      select: {
        id: true,
        landlord: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        claims: {
          select: {
            userId: true,
            status: true, // "pending" | "approved" | "rejected"
          },
        },
      },
    });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // no landlord data at all? nothing to show.
    if (!property.landlord) {
      return res.json({
        data: {
          locked: true,
          landlord: null,
        },
      });
    }

    // 2. Figure out if this requester is an approved tenant
    let isApprovedTenant = false;
    if (userId) {
      const claimForMe = property.claims.find(
        (c) => c.userId === userId && c.status === 'approved'
      );
      if (claimForMe) {
        isApprovedTenant = true;
      }
    }

    // 3. If NOT approved tenant → locked view
    if (!isApprovedTenant) {
      // We do not leak phone or email here. We can still tease contact is available.
      return res.json({
        data: {
          locked: true,
          landlord: {
            name: property.landlord.name || 'Landlord / Property Manager',
            email: null,
            phoneMasked: null,
          },
        },
      });
    }

    // 4. Approved tenant → unlocked view
    // We will show email openly.
    // For phone, let's mask it (xxx-xxx-1234 style) so it's not just blasting raw number in logs / screenshots.
    let phoneMasked = null;
    if (property.landlord.phone) {
      const raw = property.landlord.phone.replace(/\D+/g, ''); // digits only
      if (raw.length >= 4) {
        const last4 = raw.slice(-4);
        phoneMasked = `***-***-${last4}`;
      } else {
        phoneMasked = '***';
      }
    }

    return res.json({
      data: {
        locked: false,
        landlord: {
          name: property.landlord.name || 'Landlord / Property Manager',
          email: property.landlord.email || null,
          phoneMasked: phoneMasked,
        },
      },
    });
  } catch (e) {
    next(e);
  }
}

// -----------------------------
// EXPORTS
// -----------------------------
module.exports = {
  list,
  searchLight,
  getOne,
  create,
  getAlerts,
  getLandlordContact, 

  // new:
  claimStatus,
  claimResidence,
};
