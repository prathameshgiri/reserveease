const db = require('../services/db.service');

// Generate short random unique booking reference
const generateBookingId = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BK-${code}`;
};

exports.createReservation = async (req, res, next) => {
  try {
    const { serviceId, date, timeSlot, quantity = 1, specialInstructions = '' } = req.body;

    if (!serviceId || !date || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Service, date, and time slot are required.'
      });
    }

    const service = await db.getById('services', serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Selected service was not found.'
      });
    }

    if (service.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This service is currently unavailable.'
      });
    }

    // Check if date is in the past
    const todayStr = new Date().toISOString().split('T')[0];
    if (date < todayStr) {
      return res.status(400).json({
        success: false,
        message: 'Cannot make reservations for a past date.'
      });
    }

    // Check if date is blocked
    if ((service.blockedDates || []).includes(date)) {
      return res.status(400).json({
        success: false,
        message: 'The selected date is blocked for bookings.'
      });
    }

    // Verify time slot is offered
    if (!(service.availableSlots || []).includes(timeSlot)) {
      return res.status(400).json({
        success: false,
        message: 'The selected time slot is not available for this service.'
      });
    }

    const reqQty = Number(quantity) || 1;
    if (reqQty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be at least 1.'
      });
    }

    // Capacity verification: serialized check
    const existingBookings = await db.find('reservations', r =>
      r.serviceId === serviceId &&
      r.date === date &&
      r.timeSlot === timeSlot &&
      r.status !== 'cancelled'
    );

    const alreadyBooked = existingBookings.reduce((sum, r) => sum + (Number(r.quantity) || 1), 0);
    const capacity = Number(service.capacityPerSlot) || 1;

    if (alreadyBooked + reqQty > capacity) {
      const remaining = Math.max(0, capacity - alreadyBooked);
      return res.status(409).json({
        success: false,
        message: `Capacity exceeded. Only ${remaining} slot(s) remaining for ${timeSlot}.`
      });
    }

    // Get system settings for tax rate
    const settings = await db.getSettings();
    const taxRate = Number(settings.taxRatePercent) || 18;

    const unitPrice = Number(service.price);
    const subtotal = unitPrice * reqQty;
    const taxAmount = Math.round((subtotal * taxRate) / 100);
    const totalPrice = subtotal + taxAmount;

    // Check daily booking limit for this customer
    const customerBookingsToday = await db.find('reservations', r =>
      r.customerId === req.user.id &&
      r.date === date &&
      r.status !== 'cancelled'
    );

    const maxDaily = Number(settings.maxBookingsPerCustomerPerDay) || 5;
    if (customerBookingsToday.length >= maxDaily) {
      return res.status(400).json({
        success: false,
        message: `You have reached the maximum allowed limit of ${maxDaily} reservations for this date.`
      });
    }

    const bookingId = generateBookingId();
    const newReservation = await db.create('reservations', {
      id: `RES-${Date.now().toString().slice(-6)}`,
      bookingId,
      customerId: req.user.id,
      customerName: req.user.name,
      customerEmail: req.user.email,
      customerPhone: req.user.phone || '',
      serviceId: service.id,
      serviceName: service.name,
      serviceCategory: service.category,
      date,
      timeSlot,
      quantity: reqQty,
      unitPrice,
      subtotal,
      taxAmount,
      totalPrice,
      currency: settings.currency || 'INR',
      status: settings.allowInstantConfirmation ? 'confirmed' : 'pending',
      cancellationReason: '',
      paymentStatus: 'unpaid',
      paymentId: null,
      specialInstructions: specialInstructions ? specialInstructions.trim() : ''
    });

    await db.logAudit({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'CREATE_RESERVATION',
      details: `Created reservation ${newReservation.bookingId} for "${service.name}" on ${date} (${timeSlot})`
    });

    return res.status(201).json({
      success: true,
      message: 'Reservation created successfully!',
      data: newReservation
    });
  } catch (error) {
    next(error);
  }
};

exports.getMyReservations = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let reservations = await db.find('reservations', r => r.customerId === req.user.id);

    if (status && status !== 'all') {
      reservations = reservations.filter(r => r.status.toLowerCase() === status.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      reservations = reservations.filter(r =>
        r.bookingId.toLowerCase().includes(q) ||
        r.serviceName.toLowerCase().includes(q) ||
        r.date.includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    next(error);
  }
};

exports.getAllReservations = async (req, res, next) => {
  try {
    const { status, date, search, customerId } = req.query;
    let reservations = await db.getAll('reservations');

    if (status && status !== 'all') {
      reservations = reservations.filter(r => r.status.toLowerCase() === status.toLowerCase());
    }

    if (date) {
      reservations = reservations.filter(r => r.date === date);
    }

    if (customerId) {
      reservations = reservations.filter(r => r.customerId === customerId);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      reservations = reservations.filter(r =>
        r.bookingId.toLowerCase().includes(q) ||
        r.serviceName.toLowerCase().includes(q) ||
        r.customerName.toLowerCase().includes(q) ||
        r.customerEmail.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations
    });
  } catch (error) {
    next(error);
  }
};

exports.getReservationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reservation = await db.getById('reservations', id) ||
      await db.findOne('reservations', r => r.bookingId === id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found.'
      });
    }

    // Role check: customer can only access their own reservation
    if (req.user.role !== 'admin' && reservation.customerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own reservations.'
      });
    }

    return res.status(200).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    next(error);
  }
};

exports.modifyReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, timeSlot, specialInstructions } = req.body;

    const reservation = await db.getById('reservations', id);
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
        message: 'You cannot modify this reservation.'
      });
    }

    // Check if reservation is eligible for modification
    if (reservation.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cancelled reservations cannot be modified.'
      });
    }

    if (reservation.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Completed reservations cannot be modified.'
      });
    }

    const updates = {};
    if (specialInstructions !== undefined) {
      updates.specialInstructions = specialInstructions.trim();
    }

    // If changing date or slot, recheck availability
    if ((date && date !== reservation.date) || (timeSlot && timeSlot !== reservation.timeSlot)) {
      const targetDate = date || reservation.date;
      const targetSlot = timeSlot || reservation.timeSlot;

      const service = await db.getById('services', reservation.serviceId);
      if (!service) {
        return res.status(404).json({ success: false, message: 'Service not found.' });
      }

      if ((service.blockedDates || []).includes(targetDate)) {
        return res.status(400).json({
          success: false,
          message: 'The selected new date is blocked.'
        });
      }

      if (!(service.availableSlots || []).includes(targetSlot)) {
        return res.status(400).json({
          success: false,
          message: 'The selected slot is not offered for this service.'
        });
      }

      // Check slot capacity excluding current reservation
      const otherBookings = await db.find('reservations', r =>
        r.id !== reservation.id &&
        r.serviceId === reservation.serviceId &&
        r.date === targetDate &&
        r.timeSlot === targetSlot &&
        r.status !== 'cancelled'
      );

      const alreadyBooked = otherBookings.reduce((sum, r) => sum + (Number(r.quantity) || 1), 0);
      const capacity = Number(service.capacityPerSlot) || 1;

      if (alreadyBooked + Number(reservation.quantity) > capacity) {
        return res.status(409).json({
          success: false,
          message: `The selected slot on ${targetDate} does not have sufficient capacity.`
        });
      }

      updates.date = targetDate;
      updates.timeSlot = targetSlot;
    }

    const updated = await db.update('reservations', id, updates);

    await db.logAudit({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'MODIFY_RESERVATION',
      details: `Modified reservation ${reservation.bookingId}`
    });

    return res.status(200).json({
      success: true,
      message: 'Reservation updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

exports.cancelReservation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Cancelled by user' } = req.body;

    const reservation = await db.getById('reservations', id);
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
        message: 'You cannot cancel this reservation.'
      });
    }

    if (reservation.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This reservation is already cancelled.'
      });
    }

    if (reservation.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Past completed reservations cannot be cancelled.'
      });
    }

    const updated = await db.update('reservations', id, {
      status: 'cancelled',
      cancellationReason: reason.trim()
    });

    await db.logAudit({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'CANCEL_RESERVATION',
      details: `Cancelled reservation ${reservation.bookingId}. Reason: ${reason}`
    });

    return res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

exports.updateReservationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, cancellationReason } = req.body;

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const reservation = await db.getById('reservations', id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found.'
      });
    }

    const updates = { status };
    if (status === 'cancelled' && cancellationReason) {
      updates.cancellationReason = cancellationReason;
    }

    const updated = await db.update('reservations', id, updates);

    await db.logAudit({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'UPDATE_RESERVATION_STATUS',
      details: `Admin changed reservation ${reservation.bookingId} status to ${status}`
    });

    return res.status(200).json({
      success: true,
      message: `Reservation status updated to ${status}.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};
