const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/rentcheck.controller');

router.post('/', auth, ...ctrl.create);

module.exports = router;
