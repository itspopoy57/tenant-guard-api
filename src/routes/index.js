const router = require('express').Router();

router.use('/auth', require('./auth.routes'));
router.use('/properties', require('./properties.routes'));
router.use('/reports', require('./reports.routes'));
router.use('/ratings', require('./ratings.routes'));
router.use('/rentcheck', require('./rentcheck.routes'));
router.use('/upload', require('./upload.routes'));



module.exports = router;
