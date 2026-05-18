const router = require('express').Router();
const { subscribe } = require('../controllers/newsletterController');
const asyncHandler = require('../utils/asyncHandler');

router.post('/subscribe', asyncHandler(subscribe));

module.exports = router;
