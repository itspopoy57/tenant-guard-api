const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/properties.controller');

// GET /properties
// ctrl.list is an array [validate(...), async handler]
router.get('/', ...ctrl.list);

// GET /properties/:id
// ctrl.getOne is a single function
router.get('/:id', ctrl.getOne);

router.get('/:id/summary', ctrl.getSummary);


// POST /properties
// ctrl.create is also an array [validate(...), async handler]
router.post('/', ...ctrl.create);

module.exports = router;