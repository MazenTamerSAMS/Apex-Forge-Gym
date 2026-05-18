const router = require('express').Router();
const { listPlans, subscribe, cancel } = require('../controllers/planController');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(listPlans));
router.post('/subscribe', protect, asyncHandler(subscribe));
router.post('/cancel', protect, asyncHandler(cancel));

module.exports = router;
