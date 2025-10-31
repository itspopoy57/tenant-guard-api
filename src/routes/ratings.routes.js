const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const ctrl = require('../controllers/ratings.controller');

// create a rating (protected)
router.post('/', auth, ...ctrl.create);

// list ratings for a property (public or protected — your choice)
router.get('/:propertyId', ctrl.byProperty);

module.exports = router;
