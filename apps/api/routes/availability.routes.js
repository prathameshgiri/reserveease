const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availability.controller');
const authenticate = require('../middleware/auth.middleware');
const requireAdmin = require('../middleware/admin.middleware');

// Public availability check
router.get('/check', availabilityController.checkAvailability);
router.get('/summary/:id', availabilityController.getServiceAvailabilitySummary);

// Admin availability actions
router.post('/block', authenticate, requireAdmin, availabilityController.blockDate);
router.post('/unblock', authenticate, requireAdmin, availabilityController.unblockDate);

module.exports = router;
