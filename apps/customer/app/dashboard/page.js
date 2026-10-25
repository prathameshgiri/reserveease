'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { api } from '../../lib/api';
import {
  CalendarDays,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  CreditCard,
  User,
  ArrowRight,
  PlusCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import '../../styles/customer-dashboard.css';

export default function CustomerDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    async function loadDashboard() {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/customer');
        if (res.success && res.data) {
          setDashboardData(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      loadDashboard();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px', textAlign: 'center', color: 'var(--slate-500)' }}>
        Loading your reservation dashboard...
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    totalSpent: 0
  };

  const recentActivity = dashboardData?.recentActivity || [];

  return (
    <div className="cust-dashboard-container">
      {/* WELCOME BANNER */}
      <div className="dashboard-hero-banner">
        <div>
          <h1 className="banner-welcome-title">
            Welcome back, {user?.name || 'Customer'}!
          </h1>
          <p className="banner-welcome-sub">
            Manage your booked slots, track appointment status, or explore new services.
          </p>
        </div>
        <Link href="/booking" className="btn-new-booking-cta">
          <PlusCircle size={18} />
          <span>New Reservation</span>
        </Link>
      </div>

      {/* STATS CARDS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-wrapper blue">
            <CalendarDays size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Total Bookings</span>
            <span className="stat-value">{stats.totalBookings}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper green">
            <CalendarCheck size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Upcoming Slots</span>
            <span className="stat-value">{stats.upcomingBookings}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper purple">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{stats.completedBookings}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrapper red">
            <XCircle size={24} />
          </div>
          <div className="stat-info">
            <span className="stat-label">Cancelled</span>
            <span className="stat-value">{stats.cancelledBookings}</span>
          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN CONTENT */}
      <div className="dashboard-content-grid">
        {/* RECENT ACTIVITY */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h2 className="panel-title">Recent Reservations</h2>
            <Link href="/reservations" className="panel-link">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--slate-400)' }}>
              No reservation activity recorded yet.
            </div>
          ) : (
            <div className="recent-list">
              {recentActivity.map(booking => (
                <div key={booking.id} className="activity-item">
                  <div className="activity-left">
                    <div className="activity-icon-box">
                      <Clock size={20} />
                    </div>
                    <div className="activity-details">
                      <span className="activity-title">{booking.serviceName}</span>
                      <span className="activity-meta">
                        {booking.date} • {booking.timeSlot} (Ref: {booking.bookingId})
                      </span>
                    </div>
                  </div>

                  <div className="activity-right">
                    <span className={`status-badge ${booking.status}`}>
                      {booking.status}
                    </span>
                    <span className="activity-price">
                      ₹{Number(booking.totalPrice).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QUICK ACTIONS & ACCOUNT SUMMARY */}
        <div className="dashboard-panel">
          <div className="panel-header">
            <h2 className="panel-title">Quick Actions</h2>
          </div>

          <div className="quick-actions-list">
            <Link href="/services" className="quick-action-btn">
              <div className="quick-action-left">
                <Sparkles size={18} color="var(--primary)" />
                <span>Explore Services</span>
              </div>
              <ArrowRight size={16} />
            </Link>

            <Link href="/booking" className="quick-action-btn">
              <div className="quick-action-left">
                <CalendarCheck size={18} color="var(--primary)" />
                <span>Book a Time Slot</span>
              </div>
              <ArrowRight size={16} />
            </Link>

            <Link href="/reservations" className="quick-action-btn">
              <div className="quick-action-left">
                <CalendarDays size={18} color="var(--primary)" />
                <span>Manage Reservations</span>
              </div>
              <ArrowRight size={16} />
            </Link>

            <Link href="/payments" className="quick-action-btn">
              <div className="quick-action-left">
                <CreditCard size={18} color="var(--primary)" />
                <span>Payment & Receipts</span>
              </div>
              <ArrowRight size={16} />
            </Link>

            <Link href="/profile" className="quick-action-btn">
              <div className="quick-action-left">
                <User size={18} color="var(--primary)" />
                <span>Account Profile</span>
              </div>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
