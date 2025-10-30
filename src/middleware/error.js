const { fail } = require('../utils/http');

function errorHandler(err, req, res, next) { // eslint-disable-line
  const status = err.status || 500;
  const msg = err.message || 'Internal Server Error';
  if (status >= 500) console.error(err);
  return fail(res, msg, status);
}
module.exports = errorHandler;
