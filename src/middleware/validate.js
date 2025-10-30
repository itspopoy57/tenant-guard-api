const { ZodError } = require('zod');
const { fail } = require('../utils/http');

function validate(schema) {
  return (req, res, next) => {
    try {
      const data = schema.parse({ body: req.body, query: req.query, params: req.params });
      req.valid = data;
      next();
    } catch (e) {
      if (e instanceof ZodError) {
        const msg = e.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
        return fail(res, msg, 422);
      }
      next(e);
    }
  };
}
module.exports = validate;
