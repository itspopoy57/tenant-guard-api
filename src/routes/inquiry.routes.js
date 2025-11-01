const express = require('express');
const router = express.Router();

const { createInquiry } = require('../controllers/inquiry.controller');

// renter leads do NOT need to be logged in to send interest
// (you *can* add a rate limit later)
router.post('/', ...createInquiry);

module.exports = router;
