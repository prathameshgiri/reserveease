const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customers.controller');
const authenticate = require('../middleware/auth.middleware');
const requireAdmin = require('../middleware/admin.middleware');

// All customer management endpoints require Admin role
router.use(authenticate, requireAdmin);

router.get('/', customersController.getAllCustomers);
router.get('/:id', customersController.getCustomerById);
router.put('/:id/status', customersController.toggleCustomerStatus);

module.exports = router;
