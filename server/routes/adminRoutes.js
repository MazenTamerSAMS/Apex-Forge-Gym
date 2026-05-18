const router = require('express').Router();
const admin = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');
const asyncHandler = require('../utils/asyncHandler');

router.use(protect, adminOnly);
router.get('/stats', asyncHandler(admin.stats));
router.get('/users', asyncHandler(admin.users));
router.get('/orders', asyncHandler(admin.orders));
router.post('/supplements', asyncHandler(admin.createSupplement));
router.put('/supplements/:id', asyncHandler(admin.updateSupplement));
router.delete('/supplements/:id', asyncHandler(admin.deleteSupplement));
router.post('/trainers', asyncHandler(admin.createTrainer));
router.put('/trainers/:id', asyncHandler(admin.updateTrainer));
router.delete('/trainers/:id', asyncHandler(admin.deleteTrainer));
router.post('/machines', asyncHandler(admin.createMachine));
router.put('/machines/:id', asyncHandler(admin.updateMachine));
router.delete('/machines/:id', asyncHandler(admin.deleteMachine));
router.post('/plans', asyncHandler(admin.createPlan));
router.put('/plans/:id', asyncHandler(admin.updatePlan));
router.delete('/plans/:id', asyncHandler(admin.deletePlan));

module.exports = router;
