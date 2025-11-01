const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/auth.controller");
const registerCtrl = require('../controllers/register.controller'); // NEW


router.post("/login", ctrl.login);
router.post("/register", ctrl.register);

module.exports = router;
