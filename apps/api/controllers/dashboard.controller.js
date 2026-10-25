const db = require('../services/db.service');

exports.getCustomerDashboard = async (req, res, next) => {
  try {
    const customerId = req.user.id;
    const reservations = await db.find('reservations', r => r.customerId === customerId);
    const payments = await db.find('payments', p => p.customerId === customerId);

    const todayStr = new Date().toISOString().split('T')[0];

    const totalBookings = reservations.length;
    const upcomingBookings = reservations.filter(r => r.date >= todayStr && r.status !== 'cancelled' && r.status !== 'completed').length;
    const completedBookings = reservations.filter(r => r.status === 'completed' || (r.date < todayStr && r.status !== 'cancelled')).length;
    const cancelledBookings = reservations.filter(r => r.status === 'cancelled').length;
    const totalSpent = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    // Recent 5 reservations sorted by creation
    const recentActivity = [...reservations]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalBookings,
          upcomingBookings,
          completedBookings,
          cancelledBookings,
          totalSpent
        },
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getAdminDashboard = async (req, res, next) => {
  try {
    const users = await db.getAll('users');
    const customers = users.filter(u => u.role === 'customer');
    const reservations = await db.getAll('reservations');
    const payments = await db.getAll('payments');
    const services = await db.getAll('services');
    const auditLogs = await db.getAll('auditLogs');

    const todayStr = new Date().toISOString().split('T')[0];

    // Stats
    const totalCustomers = customers.length;
    const totalReservations = reservations.length;
    const todayBookings = reservations.filter(r => r.date === todayStr && r.status !== 'cancelled').length;
    const upcomingBookings = reservations.filter(r => r.date > todayStr && r.status !== 'cancelled').length;
    const cancelledBookings = reservations.filter(r => r.status === 'cancelled').length;

    const paidPayments = payments.filter(p => p.status === 'paid');
    const paidPaymentCount = paidPayments.length;
    const totalRevenue = paidPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    // Reservation status distribution for chart
    const statusDistribution = {
      confirmed: reservations.filter(r => r.status === 'confirmed').length,
      pending: reservations.filter(r => r.status === 'pending').length,
      completed: reservations.filter(r => r.status === 'completed').length,
      cancelled: cancelledBookings
    };

    // Category breakdown
    const categoryStats = {};
    for (const res of reservations) {
      const cat = res.serviceCategory || 'Other';
      categoryStats[cat] = (categoryStats[cat] || 0) + 1;
    }

    // Monthly booking trends (last 6 months)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrends = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mLabel = `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`;
      const yyyyMm = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      const count = reservations.filter(r => r.date && r.date.startsWith(yyyyMm)).length;
      const rev = paidPayments
        .filter(p => p.paidAt && p.paidAt.startsWith(yyyyMm))
        .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

      monthlyTrends.push({
        month: mLabel,
        bookings: count,
        revenue: rev
      });
    }

    // Recent 6 bookings
    const recentReservations = [...reservations]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);

    // Recent audit logs
    const recentLogs = auditLogs.slice(0, 8);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalCustomers,
          totalReservations,
          todayBookings,
          upcomingBookings,
          cancelledBookings,
          paidPaymentCount,
          totalRevenue,
          totalServices: services.length
        },
        statusDistribution,
        categoryStats,
        monthlyTrends,
        recentReservations,
        recentLogs
      }
    });
  } catch (error) {
    next(error);
  }
};
