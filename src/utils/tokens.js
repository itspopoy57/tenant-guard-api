const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'dev_secret';

function signJwt(payload, opts = { expiresIn: '7d' }) {
  return jwt.sign(payload, SECRET, opts);
}
function verifyJwt(token) {
  return jwt.verify(token, SECRET);
}
module.exports = { signJwt, verifyJwt };
