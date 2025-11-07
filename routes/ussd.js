const express = require('express');
const { processUSSD, ussdSession } = require('../controllers/ussdController.js');

const router = express.Router();

router.post('/ussd', ussdSession, processUSSD);

module.exports = router;