const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/payments.controller');
const authenticate = require('../middleware/auth.middleware');
const requireAdmin = require('../middleware/admin.middleware');

router.use(authenticate);

// Customer endpoints
router.post('/demo-pay', paymentsController.processDemoPayment);
router.get('/my', paymentsController.getMyPayments);
router.get('/:id/receipt', paymentsController.getPaymentReceipt);

// Admin-only endpoints
router.get('/admin/all', requireAdmin, paymentsController.getAllPayments);
router.post('/:id/refund', requireAdmin, paymentsController.refundPayment);

module.exports = router;
