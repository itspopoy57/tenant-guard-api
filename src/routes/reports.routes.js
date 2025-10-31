const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const ctrl = require('../controllers/reports.controller');

// tenant submits a new issue report with optional photo
router.post('/', auth, ...ctrl.create);

// list reports for a property (optional, for debug / later UI)
router.get('/:propertyId', ctrl.byProperty);

module.exports = router;
