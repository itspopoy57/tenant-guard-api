const prisma = require('../lib/prisma');
const { hashPassword, comparePassword } = require('../utils/passwords');
const { signJwt } = require('../utils/tokens');
const { HttpError } = require('../utils/http');

async function register({ email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new HttpError('Email already in use', 409);
  const hash = await hashPassword(password);
  const user = await prisma.user.create({ data: { email, password: hash } });
  const token = signJwt({ id: user.id, email: user.email });
  return { token };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new HttpError('Invalid credentials', 401);
  const ok = await comparePassword(password, user.password);
  if (!ok) throw new HttpError('Invalid credentials', 401);
  const token = signJwt({ id: user.id, email: user.email });
  return { token };
}

module.exports = { register, login };
