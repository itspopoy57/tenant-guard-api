const { z } = require('zod');
const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { success, HttpError } = require('../utils/http');
const { signJwt } = require('../utils/tokens');

// validation schema for signup
const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email required'),
    password: z.string().min(4, 'Password too short'),
    role: z.enum(['tenant', 'landlord']).optional().default('tenant'),
  }),
});

function validate(schema) {
  return (req, res, next) => {
    try {
      const out = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.valid = out;
      next();
    } catch (err) {
      return res.status(400).json({
        error: err.errors?.[0]?.message || 'Invalid input',
      });
    }
  };
}

const register = [
  validate(registerSchema),
  async (req, res, next) => {
    try {
      const { email, password, role } = req.valid.body;

      // does this email already exist?
      const existing = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });

      if (existing) {
        throw new HttpError(409, 'Email already registered');
      }

      // hash pw
      const hashed = await bcrypt.hash(password, 10);

      // create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashed,
          role,
        },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

      // issue token
      const token = signJwt({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      return success(res, { token, user }, 201);
    } catch (e) {
      next(e);
    }
  },
];

module.exports = {
  register,
};
