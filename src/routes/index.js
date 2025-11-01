const router = require('express').Router();

// import each sub-router once
const authRoutes = require('./auth.routes');
const propertiesRoutes = require('./properties.routes');
const reportsRoutes = require('./reports.routes');
const ratingsRoutes = require('./ratings.routes');
const rentcheckRoutes = require('./rentcheck.routes');
const uploadRoutes = require('./upload.routes');
const confirmationsRoutes = require('./confirmations.routes');
const usersRoutes = require('./users.routes');
const watchlistRoutes = require('./watchlist.routes');
const inquiryRoutes = require('./inquiry.routes'); // 👈 NEW (correct path)

// mount them under their prefixes
router.use('/auth', authRoutes);
router.use('/properties', propertiesRoutes);
router.use('/reports', reportsRoutes);
router.use('/ratings', ratingsRoutes);
router.use('/rentcheck', rentcheckRoutes);
router.use('/upload', uploadRoutes);
router.use('/confirm', confirmationsRoutes);
router.use('/users', usersRoutes);
router.use('/watchlist', watchlistRoutes);
router.use('/inquiry', inquiryRoutes); // 👈 NEW

module.exports = router;
