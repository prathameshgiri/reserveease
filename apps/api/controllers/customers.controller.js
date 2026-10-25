const db = require('../services/db.service');

exports.getAllCustomers = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    let users = await db.find('users', u => u.role === 'customer');

    if (status && status !== 'all') {
      users = users.filter(u => u.status === status);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      users = users.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q))
      );
    }

    // Attach booking stats for each customer
    const reservations = await db.getAll('reservations');

    const customerList = users.map(u => {
      const userBookings = reservations.filter(r => r.customerId === u.id);
      const totalBookings = userBookings.length;
      const spentAmount = userBookings
        .filter(r => r.paymentStatus === 'paid')
        .reduce((sum, r) => sum + (Number(r.totalPrice) || 0), 0);

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone || 'N/A',
        address: u.address || 'N/A',
        status: u.status || 'active',
        createdAt: u.createdAt,
        totalBookings,
        totalSpent: spentAmount
      };
    });

    return res.status(200).json({
      success: true,
      count: customerList.length,
      data: customerList
    });
  } catch (error) {
    next(error);
  }
};

exports.getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await db.getById('users', id);

    if (!user || user.role !== 'customer') {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.'
      });
    }

    // Get reservation history
    const reservations = await db.find('reservations', r => r.customerId === id);
    const payments = await db.find('payments', p => p.customerId === id);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || 'N/A',
      address: user.address || 'N/A',
      status: user.status || 'active',
      createdAt: user.createdAt,
      reservations,
      payments
    };

    return res.status(200).json({
      success: true,
      data: safeUser
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleCustomerStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await db.getById('users', id);

    if (!user || user.role !== 'customer') {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.'
      });
    }

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const updated = await db.update('users', id, { status: newStatus });

    await db.logAudit({
      actorId: req.user.id,
      actorName: req.user.name,
      actorRole: req.user.role,
      action: 'TOGGLE_CUSTOMER_STATUS',
      details: `Changed status of customer ${user.email} to ${newStatus}`
    });

    return res.status(200).json({
      success: true,
      message: `Customer account ${newStatus === 'active' ? 'activated' : 'deactivated'}.`,
      data: {
        id: updated.id,
        status: updated.status
      }
    });
  } catch (error) {
    next(error);
  }
};
