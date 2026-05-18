const router = require('express').Router();
const { createContact } = require('../controllers/contactController');
const asyncHandler = require('../utils/asyncHandler');

router.post('/', asyncHandler(createContact));

module.exports = router;
