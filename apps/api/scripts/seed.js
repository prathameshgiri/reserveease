const bcrypt = require('bcryptjs');
const db = require('../services/db.service');

async function seedDatabase() {
  console.log('🌱 Starting ReserveEase database seeding...');

  try {
    // 1. Seed Users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('Admin@123', salt);
    const customerPassword = await bcrypt.hash('Customer@123', salt);

    const users = [
      {
        id: 'USR-ADM001',
        name: 'System Administrator',
        email: 'admin@reserveease.com',
        password: adminPassword,
        role: 'admin',
        phone: '+91 98765 43210',
        address: 'ReserveEase Headquarters, Mumbai',
        status: 'active',
        createdAt: '2026-01-01T08:00:00.000Z',
        updatedAt: '2026-01-01T08:00:00.000Z'
      },
      {
        id: 'USR-CUST01',
        name: 'Rohit Sharma',
        email: 'rohit@example.com',
        password: customerPassword,
        role: 'customer',
        phone: '+91 98220 12345',
        address: '42 Marine Drive, Nariman Point, Mumbai',
        status: 'active',
        createdAt: '2026-01-10T09:30:00.000Z',
        updatedAt: '2026-01-10T09:30:00.000Z'
      },
      {
        id: 'USR-CUST02',
        name: 'Priya Patel',
        email: 'priya@example.com',
        password: customerPassword,
        role: 'customer',
        phone: '+91 99301 67890',
        address: '15 Residency Road, Bangalore',
        status: 'active',
        createdAt: '2026-01-12T11:15:00.000Z',
        updatedAt: '2026-01-12T11:15:00.000Z'
      }
    ];

    await db.write('users', users);
    console.log(`✅ Seeded ${users.length} users (Admin & Demo Customers).`);

    // 2. Seed Services
    const services = [
      {
        id: 'SRV-101',
        name: 'Executive Boardroom Suite',
        category: 'Workspace & Meeting',
        description: 'Ultra-modern 14-seat executive boardroom equipped with 4K UHD video conferencing, digital smart whiteboard, surround audio, and high-speed enterprise WiFi.',
        price: 2500,
        durationMinutes: 60,
        capacityPerSlot: 3,
        availableSlots: [
          '09:00 - 10:00',
          '10:30 - 11:30',
          '12:00 - 13:00',
          '14:00 - 15:00',
          '15:30 - 16:30',
          '17:00 - 18:00'
        ],
        blockedDates: [],
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
        status: 'active',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'SRV-102',
        name: 'Luxury Rejuvenation Spa & Massage',
        category: 'Health & Wellness',
        description: 'Holistic full-body Swedish massage, essential aromatherapy oil therapy, hot stone relaxation, and steam bath by licensed aesthetic therapists.',
        price: 3200,
        durationMinutes: 90,
        capacityPerSlot: 4,
        availableSlots: [
          '10:00 - 11:30',
          '12:00 - 13:30',
          '14:00 - 15:30',
          '16:00 - 17:30',
          '18:00 - 19:30'
        ],
        blockedDates: [],
        imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
        status: 'active',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'SRV-103',
        name: "Chef's Table Private Gastronomy",
        category: 'Dining & Hospitality',
        description: 'An exclusive 5-course curated tasting menu crafted live by our Master Executive Chef, featuring premium farm-to-table ingredients with private lounge terrace.',
        price: 4500,
        durationMinutes: 120,
        capacityPerSlot: 2,
        availableSlots: [
          '12:30 - 14:30',
          '19:00 - 21:00',
          '21:30 - 23:30'
        ],
        blockedDates: [],
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
        status: 'active',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'SRV-104',
        name: 'Grand Acoustic Banquet & Event Hall',
        category: 'Workspace & Meeting',
        description: 'Spacious hall with professional lighting grid, line-array audio, projector screens, and staging, suitable for corporate seminars, galas, and keynotes up to 100 people.',
        price: 15000,
        durationMinutes: 240,
        capacityPerSlot: 1,
        availableSlots: [
          '09:00 - 13:00',
          '14:00 - 18:00',
          '18:30 - 22:30'
        ],
        blockedDates: [],
        imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=800&q=80',
        status: 'active',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'SRV-105',
        name: 'Dedicated Ergonomic Co-Working Desk',
        category: 'Workspace & Meeting',
        description: 'Single full-day hot desk featuring Herman Miller seating, dual 27-inch 4K monitors, unlimited specialty roast espresso, and quiet booth access.',
        price: 600,
        durationMinutes: 480,
        capacityPerSlot: 8,
        availableSlots: [
          '09:00 - 17:00',
          '10:00 - 18:00'
        ],
        blockedDates: [],
        imageUrl: 'https://images.unsplash.com/photo-1527192491265-7e15c55b1ed2?auto=format&fit=crop&w=800&q=80',
        status: 'active',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z'
      },
      {
        id: 'SRV-106',
        name: 'Creative Cyclorama Photography Studio',
        category: 'Creative Studio',
        description: 'Full white cyclorama infinity wall, Profoto D2 flash heads, green screen backdrops, motorized overhead truss, private makeup dressing vanity, and tethering station.',
        price: 3800,
        durationMinutes: 180,
        capacityPerSlot: 2,
        availableSlots: [
          '09:00 - 12:00',
          '13:00 - 16:00',
          '16:30 - 19:30'
        ],
        blockedDates: [],
        imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=800&q=80',
        status: 'active',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z'
      }
    ];

    await db.write('services', services);
    console.log(`✅ Seeded ${services.length} services.`);

    // 3. Seed Settings
    const settings = {
      appName: 'ReserveEase',
      tagline: 'Customer Reservation & Booking Management System',
      currency: 'INR',
      currencySymbol: '₹',
      taxRatePercent: 18,
      contactEmail: 'support@reserveease.com',
      contactPhone: '+91 22 4589 1200',
      address: '401 Tech Park, Bandra Kurla Complex, Mumbai, Maharashtra 400051',
      cancellationMinHours: 24,
      maxBookingsPerCustomerPerDay: 4,
      paymentMethods: [
        'UPI',
        'Credit/Debit Card',
        'Net Banking'
      ],
      allowInstantConfirmation: true,
      operatingHours: {
        open: '08:00',
        close: '22:00'
      }
    };
    await db.write('settings', settings);
    console.log('✅ Seeded system settings.');

    // Calculate dates for sample reservations
    const now = new Date();
    const futureDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const pastDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const todayStr = now.toISOString().split('T')[0];

    // 4. Seed Reservations
    const reservations = [
      {
        id: 'RES-8001',
        bookingId: 'BK-78412',
        customerId: 'USR-CUST01',
        customerName: 'Rohit Sharma',
        customerEmail: 'rohit@example.com',
        customerPhone: '+91 98220 12345',
        serviceId: 'SRV-101',
        serviceName: 'Executive Boardroom Suite',
        serviceCategory: 'Workspace & Meeting',
        date: futureDate,
        timeSlot: '10:30 - 11:30',
        quantity: 1,
        unitPrice: 2500,
        subtotal: 2500,
        taxAmount: 450,
        totalPrice: 2950,
        currency: 'INR',
        status: 'confirmed',
        cancellationReason: '',
        paymentStatus: 'paid',
        paymentId: 'PAY-3001',
        specialInstructions: 'Please configure projection system with Apple AirPlay and have markers ready.',
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'RES-8002',
        bookingId: 'BK-55291',
        customerId: 'USR-CUST01',
        customerName: 'Rohit Sharma',
        customerEmail: 'rohit@example.com',
        customerPhone: '+91 98220 12345',
        serviceId: 'SRV-102',
        serviceName: 'Luxury Rejuvenation Spa & Massage',
        serviceCategory: 'Health & Wellness',
        date: pastDate,
        timeSlot: '14:00 - 15:30',
        quantity: 1,
        unitPrice: 3200,
        subtotal: 3200,
        taxAmount: 576,
        totalPrice: 3776,
        currency: 'INR',
        status: 'completed',
        cancellationReason: '',
        paymentStatus: 'paid',
        paymentId: 'PAY-3002',
        specialInstructions: 'Lavender essential oil preferred.',
        createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'RES-8003',
        bookingId: 'BK-99120',
        customerId: 'USR-CUST02',
        customerName: 'Priya Patel',
        customerEmail: 'priya@example.com',
        customerPhone: '+91 99301 67890',
        serviceId: 'SRV-103',
        serviceName: "Chef's Table Private Gastronomy",
        serviceCategory: 'Dining & Hospitality',
        date: todayStr,
        timeSlot: '19:00 - 21:00',
        quantity: 2,
        unitPrice: 4500,
        subtotal: 9000,
        taxAmount: 1620,
        totalPrice: 10620,
        currency: 'INR',
        status: 'confirmed',
        cancellationReason: '',
        paymentStatus: 'unpaid',
        paymentId: null,
        specialInstructions: 'Vegetarian tasting menu for 1 guest, Jain preparation for the other.',
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    await db.write('reservations', reservations);
    console.log(`✅ Seeded ${reservations.length} sample reservations.`);

    // 5. Seed Payments
    const payments = [
      {
        id: 'PAY-3001',
        reservationId: 'RES-8001',
        bookingId: 'BK-78412',
        customerId: 'USR-CUST01',
        customerName: 'Rohit Sharma',
        customerEmail: 'rohit@example.com',
        amount: 2950,
        currency: 'INR',
        paymentMethod: 'UPI',
        transactionRef: 'TXN-49B28A1C',
        status: 'paid',
        paidAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        isDemo: true,
        notes: 'Demo Payment completed via UPI (Google Pay)'
      },
      {
        id: 'PAY-3002',
        reservationId: 'RES-8002',
        bookingId: 'BK-55291',
        customerId: 'USR-CUST01',
        customerName: 'Rohit Sharma',
        customerEmail: 'rohit@example.com',
        amount: 3776,
        currency: 'INR',
        paymentMethod: 'Credit/Debit Card',
        transactionRef: 'TXN-7A99F04D',
        status: 'paid',
        paidAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        isDemo: true,
        notes: 'Demo Payment completed via HDFC Visa Card'
      }
    ];

    await db.write('payments', payments);
    console.log(`✅ Seeded ${payments.length} sample payments.`);

    // 6. Seed Audit Logs
    const auditLogs = [
      {
        id: 'LOG-001',
        actorId: 'USR-ADM001',
        actorName: 'System Administrator',
        actorRole: 'admin',
        action: 'SYSTEM_INITIALIZATION',
        details: 'Initial database seeding and environment configuration completed.',
        meta: {},
        timestamp: new Date().toISOString()
      },
      {
        id: 'LOG-002',
        actorId: 'USR-CUST01',
        actorName: 'Rohit Sharma',
        actorRole: 'customer',
        action: 'CREATE_RESERVATION',
        details: 'Created reservation BK-78412 for Executive Boardroom Suite',
        meta: {},
        timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'LOG-003',
        actorId: 'USR-CUST01',
        actorName: 'Rohit Sharma',
        actorRole: 'customer',
        action: 'PROCESS_PAYMENT',
        details: 'Payment PAY-3001 of ₹2950 recorded for booking BK-78412',
        meta: {},
        timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    await db.write('auditLogs', auditLogs);
    console.log(`✅ Seeded ${auditLogs.length} audit logs.`);

    console.log('====================================================');
    console.log('🎉 Database seeding completed successfully!');
    console.log('Credentials:');
    console.log('  Admin Portal:    admin@reserveease.com / Admin@123');
    console.log('  Customer Portal: rohit@example.com / Customer@123');
    console.log('====================================================');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seedDatabase();
