const router = require('express').Router();
const auth = require('../middleware/auth');
const ctrl = require('../controllers/upload.controller');

router.post('/', auth, ...ctrl.upload);

module.exports = router;
