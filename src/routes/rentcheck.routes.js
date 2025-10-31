const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/rentcheck.controller');

router.post('/', auth, async (req, res, next) => {
  console.log('💥 HIT /rentcheck with body:', req.body);
  return ctrl.check(req, res, next);
});

module.exports = router;
