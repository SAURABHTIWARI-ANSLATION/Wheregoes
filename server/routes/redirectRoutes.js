const express = require('express');
const router = express.Router();
const { validateUrl } = require('../middleware/validateUrl');
const { handleRedirectCheck } = require('../controllers/redirectController');

// POST /api/check
router.post('/check', validateUrl, handleRedirectCheck);

module.exports = router;
