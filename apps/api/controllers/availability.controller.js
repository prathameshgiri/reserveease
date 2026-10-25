const db = require('../services/db.service');

exports.checkAvailability = async (req, res, next) => {
  try {
    const { serviceId, date, quantity = 1 } = req.query;

    if (!serviceId || !date) {
      return res.status(400).json({
        success: false,
        message: 'serviceId and date (YYYY-MM-DD) are required.'
      });
    }

    const service = await db.getById('services', serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.'
      });
    }

    if (service.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This service is currently unavailable.'
      });
    }

    // Check if entire date is blocked
    const blockedDates = service.blockedDates || [];
    const isDateBlocked = blockedDates.includes(date);

    if (isDateBlocked) {
      return res.status(200).json({
        success: true,
        date,
        isDateBlocked: true,
        availableSlots: [],
        message: 'This date is completely blocked for bookings.'
      });
    }

    // Get active reservations on this date for this service
    const reservations = await db.find('reservations', r =>
      r.serviceId === serviceId &&
      r.date === date &&
      r.status !== 'cancelled'
    );

    const reqQty = Number(quantity) || 1;
    const capacityPerSlot = Number(service.capacityPerSlot) || 1;

    // Calculate remaining capacity per slot
    const slotAnalysis = (service.availableSlots || []).map(slot => {
      const bookedInSlot = reservations
        .filter(r => r.timeSlot === slot)
        .reduce((sum, r) => sum + (Number(r.quantity) || 1), 0);

      const remainingCapacity = Math.max(0, capacityPerSlot - bookedInSlot);
      const isAvailable = remainingCapacity >= reqQty;

      return {
        slot,
        totalCapacity: capacityPerSlot,
        bookedCount: bookedInSlot,
        remainingCapacity,
        isAvailable
      };
    });

    return res.status(200).json({
      success: true,
      serviceId,
      serviceName: service.name,
      date,
      isDateBlocked: false,
      capacityPerSlot,
      slots: slotAnalysis
    });
  } catch (error) {
    next(error);
  }
};

exports.blockDate = async (req, res, next) => {
  try {
    const { serviceId, date } = req.body;

    if (!serviceId || !date) {
      return res.status(400).json({
        success: false,
        message: 'serviceId and date are required.'
      });
    }

    const service = await db.getById('services', serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.'
      });
    }

    const blockedDates = new Set(service.blockedDates || []);
    blockedDates.add(date);

    const updated = await db.update('services', serviceId, {
      blockedDates: Array.from(blockedDates)
    });

    await db.logAudit({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'BLOCK_DATE',
      details: `Blocked date ${date} for service ${service.name}`
    });

    return res.status(200).json({
      success: true,
      message: `Date ${date} successfully blocked for ${service.name}.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

exports.unblockDate = async (req, res, next) => {
  try {
    const { serviceId, date } = req.body;

    if (!serviceId || !date) {
      return res.status(400).json({
        success: false,
        message: 'serviceId and date are required.'
      });
    }

    const service = await db.getById('services', serviceId);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.'
      });
    }

    const blockedDates = (service.blockedDates || []).filter(d => d !== date);

    const updated = await db.update('services', serviceId, {
      blockedDates
    });

    await db.logAudit({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'UNBLOCK_DATE',
      details: `Unblocked date ${date} for service ${service.name}`
    });

    return res.status(200).json({
      success: true,
      message: `Date ${date} unblocked for ${service.name}.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

exports.getServiceAvailabilitySummary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const service = await db.getById('services', id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.'
      });
    }

    // Get all upcoming reservations for this service
    const today = new Date().toISOString().split('T')[0];
    const upcomingReservations = await db.find('reservations', r =>
      r.serviceId === id &&
      r.date >= today &&
      r.status !== 'cancelled'
    );

    return res.status(200).json({
      success: true,
      serviceId: id,
      serviceName: service.name,
      capacityPerSlot: service.capacityPerSlot,
      availableSlots: service.availableSlots,
      blockedDates: service.blockedDates || [],
      upcomingBookingsCount: upcomingReservations.length
    });
  } catch (error) {
    next(error);
  }
};
