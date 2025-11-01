const express = require('express');
const router = express.Router();

const ctrl = require('../controllers/properties.controller');
const auth = require('../middleware/auth'); // <-- you already use this for protected stuff

// existing:
router.get('/', ...ctrl.list);
router.get('/search', ctrl.searchLight);
router.get('/:id', ctrl.getOne);
router.get('/:id/alerts', ctrl.getAlerts);
router.post('/', ...ctrl.create);

// NEW:
router.get('/:id/claim-status', auth, ctrl.claimStatus);
router.post('/:id/claim', auth, ctrl.claimResidence);
router.get('/:id/landlordContact', auth, ctrl.getLandlordContact);


module.exports = router;
