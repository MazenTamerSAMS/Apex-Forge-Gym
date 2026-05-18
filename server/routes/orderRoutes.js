const router = require('express').Router();
const { createOrder, history } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

router.post('/create', protect, asyncHandler(createOrder));
router.get('/history', protect, asyncHandler(history));

module.exports = router;
