const http = require('http');

function request(options, data) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
        }
      });
    });
    req.on('error', reject);
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting End-to-End System Verification Tests...');
  let passCount = 0;
  let failCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passCount++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failCount++;
    }
  }

  try {
    // 1. Health check
    const health = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/health',
      method: 'GET'
    });
    assert(health.status === 200 && health.data.status === 'healthy', 'Health check endpoint returns healthy');

    // 2. Customer Login
    const custLogin = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'rohit@example.com', password: 'Customer@123' });
    assert(custLogin.status === 200 && custLogin.data.success, 'Customer login succeeded for rohit@example.com');
    const custToken = custLogin.data.token;
    assert(custToken && custLogin.data.user.role === 'customer', 'Customer token and user role verified');

    // 3. Customer Auth Me
    const custMe = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/me',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${custToken}` }
    });
    assert(custMe.status === 200 && custMe.data.user.email === 'rohit@example.com', 'Customer GET /auth/me authenticated successfully');

    // 4. Services List
    const services = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/services',
      method: 'GET'
    });
    assert(services.status === 200 && Array.isArray(services.data.data) && services.data.count >= 6, `Fetched ${services.data.count} services`);
    const testService = services.data.data[0];

    // 5. Availability Check
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    const testDate = tomorrow.toISOString().split('T')[0];

    const avail = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/availability/check?serviceId=${testService.id}&date=${testDate}`,
      method: 'GET'
    });
    assert(avail.status === 200 && Array.isArray(avail.data.slots), 'Availability check returned slot analysis');
    const availableSlot = avail.data.slots.find(s => s.isAvailable)?.slot || avail.data.slots[0].slot;

    // 6. Create Booking
    const booking = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/reservations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${custToken}`
      }
    }, {
      serviceId: testService.id,
      date: testDate,
      timeSlot: availableSlot,
      quantity: 1,
      specialInstructions: 'E2E Automated Verification Test Booking'
    });
    assert(booking.status === 201 && booking.data.data.bookingId, `Created reservation with Booking ID: ${booking.data.data?.bookingId}`);
    const newReservation = booking.data.data;

    // 7. Verify My Reservations
    const myReservations = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/reservations/my',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${custToken}` }
    });
    const foundBooking = myReservations.data.data.find(r => r.id === newReservation.id);
    assert(foundBooking !== undefined, 'Newly created reservation is present in customer reservations list');

    // 8. Process Demo Payment
    const payment = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/payments/demo-pay',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${custToken}`
      }
    }, {
      reservationId: newReservation.id,
      paymentMethod: 'UPI'
    });
    assert(payment.status === 200 && payment.data.data.status === 'paid', `Demo payment processed successfully: ${payment.data.data?.id} (${payment.data.data?.transactionRef})`);

    // 9. Customer Dashboard
    const custDashboard = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/dashboard/customer',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${custToken}` }
    });
    assert(custDashboard.status === 200 && custDashboard.data.data.stats.totalBookings > 0, 'Customer dashboard returns real statistics');

    // 10. Admin Login
    const adminLogin = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/admin-login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'admin@reserveease.com', password: 'Admin@123' });
    assert(adminLogin.status === 200 && adminLogin.data.user.role === 'admin', 'Admin login succeeded for admin@reserveease.com');
    const adminToken = adminLogin.data.token;

    // 11. Security Test: Customer accounts must be rejected from Admin Login
    const customerOnAdminLogin = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/admin-login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'rohit@example.com', password: 'Customer@123' });
    assert(customerOnAdminLogin.status === 403, 'Customer account is strictly rejected from Admin Login (HTTP 403)');

    // 12. Security Test: Customer token rejected from Admin routes
    const customerOnAdminRoute = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/dashboard/admin',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${custToken}` }
    });
    assert(customerOnAdminRoute.status === 403, 'Customer token rejected from Admin Dashboard route (HTTP 403)');

    // 13. Admin Dashboard
    const adminDashboard = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/dashboard/admin',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(adminDashboard.status === 200 && adminDashboard.data.data.stats.totalRevenue > 0, `Admin dashboard returns revenue metrics: ₹${adminDashboard.data.data.stats.totalRevenue}`);

    // 14. Admin Customers Directory
    const adminCustomers = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/customers',
      method: 'GET',
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    assert(adminCustomers.status === 200 && adminCustomers.data.count >= 2, `Admin customers API listed ${adminCustomers.data.count} customer accounts`);

    // 15. Admin Availability Block & Unblock Date
    const blockDateRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/availability/block',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { serviceId: testService.id, date: '2026-12-25' });
    assert(blockDateRes.status === 200, 'Admin blocked date 2026-12-25');

    const unblockDateRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/availability/unblock',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { serviceId: testService.id, date: '2026-12-25' });
    assert(unblockDateRes.status === 200, 'Admin unblocked date 2026-12-25');

    // 16. Admin Settings Update
    const settingsUpdate = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/settings',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      }
    }, { appName: 'ReserveEase' });
    assert(settingsUpdate.status === 200 && settingsUpdate.data.data.appName === 'ReserveEase', 'Admin settings updated in settings.json');

    console.log('====================================================');
    console.log(`🏁 Verification Results: ${passCount} Passed, ${failCount} Failed.`);
    console.log('====================================================');
  } catch (err) {
    console.error('Fatal test error:', err);
  }
}

runTests();
