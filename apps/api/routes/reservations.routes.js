const express = require('express');
const router = express.Router();
const reservationsController = require('../controllers/reservations.controller');
const authenticate = require('../middleware/auth.middleware');
const requireAdmin = require('../middleware/admin.middleware');

// All reservation endpoints require authentication
router.use(authenticate);

// Customer endpoints
router.post('/', reservationsController.createReservation);
router.get('/my', reservationsController.getMyReservations);
router.get('/:id', reservationsController.getReservationById);
router.put('/:id/modify', reservationsController.modifyReservation);
router.post('/:id/cancel', reservationsController.cancelReservation);

// Admin-only endpoints
router.get('/admin/all', requireAdmin, reservationsController.getAllReservations);
router.put('/:id/status', requireAdmin, reservationsController.updateReservationStatus);

module.exports = router;
