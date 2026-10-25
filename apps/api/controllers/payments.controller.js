const db = require('../services/db.service');

// Generate short random unique payment reference
const generatePaymentId = () => {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `PAY-${num}`;
};

const generateTxnRef = () => {
  const chars = '0123456789ABCDEF';
  let ref = 'TXN-';
  for (let i = 0; i < 8; i++) {
    ref += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return ref;
};

exports.processDemoPayment = async (req, res, next) => {
  try {
    const { reservationId, paymentMethod = 'UPI', simulateFailure = false } = req.body;

    if (!reservationId) {
      return res.status(400).json({
        success: false,
        message: 'reservationId is required.'
      });
    }

    const reservation = await db.getById('reservations', reservationId) ||
      await db.findOne('reservations', r => r.bookingId === reservationId);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found.'
      });
    }

    // Permission check
    if (req.user.role !== 'admin' && reservation.customerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only pay for your own reservations.'
      });
    }

    if (reservation.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot pay for a cancelled reservation.'
      });
    }

    if (reservation.paymentStatus === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'This reservation is already paid in full.'
      });
    }

    const paymentId = generatePaymentId();
    const transactionRef = generateTxnRef();

    // Check if simulate failure requested
    if (simulateFailure) {
      const failedPayment = await db.create('payments', {
        id: paymentId,
        reservationId: reservation.id,
        bookingId: reservation.bookingId,
        customerId: req.user.id,
        customerName: req.user.name,
        customerEmail: req.user.email,
        amount: reservation.totalPrice,
        currency: reservation.currency || 'INR',
        paymentMethod,
        transactionRef,
        status: 'failed',
        failureReason: 'Demo transaction declined by simulated bank gateway.',
        isDemo: true
      });

      return res.status(400).json({
        success: false,
        message: 'Simulated payment failed as requested for testing.',
        data: failedPayment
      });
    }

    // Successful Demo Payment
    const payment = await db.create('payments', {
      id: paymentId,
      reservationId: reservation.id,
      bookingId: reservation.bookingId,
      customerId: req.user.id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      amount: reservation.totalPrice,
      currency: reservation.currency || 'INR',
      paymentMethod,
      transactionRef,
      status: 'paid',
      paidAt: new Date().toISOString(),
      isDemo: true,
      notes: `Demo Payment processed via ${paymentMethod}`
    });

    // Update reservation status
    await db.update('reservations', reservation.id, {
      paymentStatus: 'paid',
      paymentId: payment.id,
      status: reservation.status === 'pending' ? 'confirmed' : reservation.status
    });

    await db.logAudit({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'PROCESS_PAYMENT',
      details: `Payment ${payment.id} of ₹${payment.amount} recorded for booking ${reservation.bookingId}`
    });

    return res.status(200).json({
      success: true,
      message: 'Demo payment completed successfully!',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyPayments = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let payments = await db.find('payments', p => p.customerId === req.user.id);

    if (status && status !== 'all') {
      payments = payments.filter(p => p.status.toLowerCase() === status.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      payments = payments.filter(p =>
        p.id.toLowerCase().includes(q) ||
        p.transactionRef.toLowerCase().includes(q) ||
        p.bookingId.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllPayments = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let payments = await db.getAll('payments');

    if (status && status !== 'all') {
      payments = payments.filter(p => p.status.toLowerCase() === status.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      payments = payments.filter(p =>
        p.id.toLowerCase().includes(q) ||
        p.transactionRef.toLowerCase().includes(q) ||
        p.bookingId.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.customerEmail.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    next(error);
  }
};

exports.getPaymentReceipt = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payment = await db.getById('payments', id) ||
      await db.findOne('payments', p => p.transactionRef === id || p.bookingId === id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found.'
      });
    }

    // Role check: customer can only access their own receipt
    if (req.user.role !== 'admin' && payment.customerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own payment receipts.'
      });
    }

    const reservation = await db.getById('reservations', payment.reservationId);
    const settings = await db.getSettings();

    return res.status(200).json({
      success: true,
      data: {
        payment,
        reservation,
        settings
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.refundPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { refundReason = 'Admin initiated refund' } = req.body;

    const payment = await db.getById('payments', id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found.'
      });
    }

    if (payment.status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: `Cannot refund payment with status: ${payment.status}.`
      });
    }

    const updatedPayment = await db.update('payments', id, {
      status: 'refunded',
      refundedAt: new Date().toISOString(),
      refundReason
    });

    // Update reservation payment status
    if (payment.reservationId) {
      await db.update('reservations', payment.reservationId, {
        paymentStatus: 'refunded'
      });
    }

    await db.logAudit({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'REFUND_PAYMENT',
      details: `Refunded payment ${payment.id} for booking ${payment.bookingId}. Reason: ${refundReason}`
    });

    return res.status(200).json({
      success: true,
      message: 'Payment refunded successfully.',
      data: updatedPayment
    });
  } catch (error) {
    next(error);
  }
};
