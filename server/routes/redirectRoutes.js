const express = require('express');
const router = express.Router();
const { validateUrl } = require('../middleware/validateUrl');
const { handleRedirectCheck } = require('../controllers/redirectController');
const { handleBulkCheck } = require('../controllers/bulkController');
const { handleApiTest } = require('../controllers/apiTesterController');

// POST /api/check
router.post('/check', validateUrl, handleRedirectCheck);

// POST /api/bulk
router.post('/bulk', handleBulkCheck);

// POST /api/test
router.post('/test', handleApiTest);

module.exports = router;
