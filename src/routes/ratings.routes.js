const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const ctrl = require('../controllers/ratings.controller');

router.post('/', auth, ctrl.create);
router.get('/:propertyId', ctrl.byProperty);   // <-- now defined

module.exports = router;
