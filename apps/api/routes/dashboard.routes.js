const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const authenticate = require('../middleware/auth.middleware');
const requireAdmin = require('../middleware/admin.middleware');

router.get('/customer', authenticate, dashboardController.getCustomerDashboard);
router.get('/admin', authenticate, requireAdmin, dashboardController.getAdminDashboard);

module.exports = router;
