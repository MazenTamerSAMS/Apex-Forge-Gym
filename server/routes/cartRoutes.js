const router = require('express').Router();
const { getCart, addToCart, updateQuantity, removeFromCart } = require('../controllers/cartController');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', protect, asyncHandler(getCart));
router.post('/add', protect, asyncHandler(addToCart));
router.patch('/quantity', protect, asyncHandler(updateQuantity));
router.delete('/remove/:id', protect, asyncHandler(removeFromCart));

module.exports = router;
