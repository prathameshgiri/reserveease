const db = require('../services/db.service');

exports.getAllServices = async (req, res, next) => {
  try {
    const { category, search, includeInactive } = req.query;
    let services = await db.getAll('services');

    // Customer should only see active services unless admin requested includeInactive
    if (!includeInactive || includeInactive === 'false') {
      services = services.filter(s => s.status === 'active');
    }

    if (category && category !== 'All') {
      services = services.filter(s => s.category.toLowerCase() === category.toLowerCase());
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      services = services.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    next(error);
  }
};

exports.getServiceById = async (req, res, next) => {
  try {
    const service = await db.getById('services', req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

exports.createService = async (req, res, next) => {
  try {
    const {
      name,
      category,
      description,
      price,
      durationMinutes,
      capacityPerSlot,
      availableSlots,
      imageUrl,
      status
    } = req.body;

    if (!name || !price || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, category, and price are required.'
      });
    }

    const defaultSlots = [
      '09:00 - 10:00',
      '10:30 - 11:30',
      '12:00 - 13:00',
      '14:00 - 15:00',
      '15:30 - 16:30',
      '17:00 - 18:00'
    ];

    const newService = await db.create('services', {
      id: `SRV-${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      category: category.trim(),
      description: description ? description.trim() : '',
      price: Number(price),
      durationMinutes: Number(durationMinutes) || 60,
      capacityPerSlot: Number(capacityPerSlot) || 4,
      availableSlots: Array.isArray(availableSlots) && availableSlots.length ? availableSlots : defaultSlots,
      blockedDates: [],
      imageUrl: imageUrl || '/images/default-service.jpg',
      status: status || 'active'
    });

    await db.logAudit({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'CREATE_SERVICE',
      details: `Created new service: "${newService.name}" (ID: ${newService.id})`
    });

    return res.status(201).json({
      success: true,
      message: 'Service created successfully.',
      data: newService
    });
  } catch (error) {
    next(error);
  }
};

exports.updateService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await db.getById('services', id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.'
      });
    }

    const updates = { ...req.body };
    if (updates.price !== undefined) updates.price = Number(updates.price);
    if (updates.capacityPerSlot !== undefined) updates.capacityPerSlot = Number(updates.capacityPerSlot);
    if (updates.durationMinutes !== undefined) updates.durationMinutes = Number(updates.durationMinutes);

    const updated = await db.update('services', id, updates);

    await db.logAudit({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'UPDATE_SERVICE',
      details: `Updated service: "${updated.name}" (ID: ${updated.id})`
    });

    return res.status(200).json({
      success: true,
      message: 'Service updated successfully.',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteService = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await db.getById('services', id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Service not found.'
      });
    }

    // Toggle status or soft-delete
    const newStatus = existing.status === 'active' ? 'inactive' : 'active';
    const updated = await db.update('services', id, { status: newStatus });

    await db.logAudit({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'TOGGLE_SERVICE_STATUS',
      details: `Toggled service status "${existing.name}" to ${newStatus}`
    });

    return res.status(200).json({
      success: true,
      message: `Service status changed to ${newStatus}.`,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};
