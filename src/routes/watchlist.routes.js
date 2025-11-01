// api/src/routes/watchlist.routes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // <-- your auth middleware
const ctrl = require('../controllers/watchlist.controller');

// must be logged in for all watchlist endpoints
router.use(auth);

// save/unsave current property
router.post('/', ctrl.toggle);

// list all saved
router.get('/', ctrl.list);

// check if this property is saved
router.get('/isSaved/:propertyId', ctrl.isSaved);

module.exports = router;
