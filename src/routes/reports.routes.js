const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const ctrl = require('../controllers/reports.controller');

// create a report (must be logged in)
router.post('/', auth, ...ctrl.create);

// list reports for a property
router.get('/property/:propertyId', ctrl.byProperty);

// get one report by id
router.get('/:id', ctrl.getOne);

// "I have this too"
router.post('/confirm/:id/confirm', auth, ctrl.confirmIssue);

// landlord contact timeline
router.get('/:id/contacts', ctrl.getContacts);

// add one landlord contact log
router.post('/:id/contact', auth, ...ctrl.addContact);

// update status (fixed / ignored / etc, only owner)
router.patch('/:id/status', auth, ctrl.updateStatus);

module.exports = router;
