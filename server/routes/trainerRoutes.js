const router = require('express').Router();
const { listTrainers, bookTrainer, favoriteTrainer } = require('../controllers/trainerController');
const { protect } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(listTrainers));
router.post('/book', protect, asyncHandler(bookTrainer));
router.post('/subscribe', protect, asyncHandler(bookTrainer));
router.post('/favorite', protect, asyncHandler(favoriteTrainer));

module.exports = router;
