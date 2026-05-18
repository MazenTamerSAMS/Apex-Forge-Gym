const router = require('express').Router();
const { listMachines } = require('../controllers/machineController');
const asyncHandler = require('../utils/asyncHandler');

router.get('/', asyncHandler(listMachines));

module.exports = router;
