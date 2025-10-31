const router = require('express').Router();
// each sub-router
const authRoutes = require('./auth.routes');
const propertiesRoutes = require('./properties.routes');
const reportsRoutes = require('./reports.routes');
const ratingsRoutes = require('./ratings.routes');
const uploadRoutes = require('./upload.routes');

router.use('/auth', require('./auth.routes'));
router.use('/properties', require('./properties.routes'));
router.use('/reports', require('./reports.routes'));
router.use('/ratings', require('./ratings.routes'));
router.use('/rentcheck', require('./rentcheck.routes'));
router.use('/upload', require('./upload.routes'));
router.use('/confirm', require('./confirmations.routes'));



module.exports = router;
