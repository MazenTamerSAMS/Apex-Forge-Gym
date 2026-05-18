const router = require('express').Router();
const { register, login, forgotPassword, resetPassword, profile, saveBmi } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/forgot-password', asyncHandler(forgotPassword));
router.post('/reset-password', asyncHandler(resetPassword));
router.get('/profile', protect, asyncHandler(profile));
router.post('/bmi', protect, asyncHandler(saveBmi));

module.exports = router;
