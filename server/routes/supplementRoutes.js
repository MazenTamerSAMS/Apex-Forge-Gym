const router = require('express').Router();
const { listSupplements, toggleWishlist } = require('../controllers/supplementController');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(listSupplements));
router.post('/wishlist', protect, asyncHandler(toggleWishlist));

module.exports = router;
