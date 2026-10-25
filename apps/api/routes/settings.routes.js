const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const authenticate = require('../middleware/auth.middleware');
const requireAdmin = require('../middleware/admin.middleware');

// Public settings access (appName, currency, contact, etc.)
router.get('/', settingsController.getSettings);

// Admin-only updates & audit logs
router.put('/', authenticate, requireAdmin, settingsController.updateSettings);
router.get('/audit-logs', authenticate, requireAdmin, settingsController.getAuditLogs);

module.exports = router;
