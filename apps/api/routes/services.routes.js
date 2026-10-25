const express = require('express');
const router = express.Router();
const servicesController = require('../controllers/services.controller');
const authenticate = require('../middleware/auth.middleware');
const requireAdmin = require('../middleware/admin.middleware');

// Public / Customer read access
router.get('/', servicesController.getAllServices);
router.get('/:id', servicesController.getServiceById);

// Admin-only management endpoints
router.post('/', authenticate, requireAdmin, servicesController.createService);
router.put('/:id', authenticate, requireAdmin, servicesController.updateService);
router.delete('/:id', authenticate, requireAdmin, servicesController.deleteService);

module.exports = router;
