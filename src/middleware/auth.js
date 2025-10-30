const { verifyJwt } = require('../utils/tokens');
const { fail } = require('../utils/http');

module.exports = function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return fail(res, 'Unauthorized', 401);
  try {
    req.user = verifyJwt(token);
    next();
  } catch (e) {
    return fail(res, 'Invalid token', 401);
  }
};
