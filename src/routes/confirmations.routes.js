const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const { confirmIssue } = require('../controllers/confirmations.controller');

// matches what the app is calling
// POST /confirm/reports/:reportId/confirm
router.post('/reports/:reportId/confirm', auth, confirmIssue);

module.exports = router;
