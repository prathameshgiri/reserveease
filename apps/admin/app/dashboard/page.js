'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../lib/auth-context';
import { useToast } from '../../lib/toast-context';
import { api } from '../../lib/api';
import {
  Users,
  CalendarDays,
  CalendarCheck,
  XCircle,
  CreditCard,
  IndianRupee,
  TrendingUp,
  Activity,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import '../../styles/admin-dashboard.css';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { adminUser, loading: authLoading } = useAdminAuth();
  const { showToast } = useToast();

  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !adminUser) {
      router.push('/login');
      return;
    }

    async function fetchDashboard() {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/admin');
        if (res.success && res.data) {
          setDashData(res.data);
        }
      } catch (err) {
        showToast('Failed to load admin analytics', 'error');
      } finally {
        setLoading(false);
      }
    }

    if (adminUser) {
      fetchDashboard();
    }
  }, [adminUser, authLoading, router, showToast]);

  if (authLoading || loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--slate-500)' }}>
        Gathering enterprise operational metrics...
      </div>
    );
  }

  const stats = dashData?.stats || {};
  const statusDist = dashData?.statusDistribution || {};
  const monthlyTrends = dashData?.monthlyTrends || [];
  const recentReservations = dashData?.recentReservations || [];
  const recentLogs = dashData?.recentLogs || [];

  const totalStatusCount = (statusDist.confirmed || 0) +
    (statusDist.pending || 0) +
    (statusDist.completed || 0) +
    (statusDist.cancelled || 0) || 1;

  // Find max monthly bookings for chart normalization
  const maxMonthlyBookings = Math.max(...monthlyTrends.map(m => m.bookings), 5);

  return (
    <div>
      <div className="admin-dash-header">
        <h1 className="admin-dash-title">Operations & Revenue Dashboard</h1>
        <p className="admin-dash-sub">Real-time system telemetry, booking distribution, and customer metrics</p>
      </div>

      {/* KPI STATS GRID */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon-box blue">
            <Users size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Customers</span>
            <span className="kpi-value">{stats.totalCustomers || 0}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box navy">
            <CalendarDays size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Reservations</span>
            <span className="kpi-value">{stats.totalReservations || 0}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box green">
            <CalendarCheck size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Today's Bookings</span>
            <span className="kpi-value">{stats.todayBookings || 0}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box purple">
            <TrendingUp size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Upcoming Slots</span>
            <span className="kpi-value">{stats.upcomingBookings || 0}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box red">
            <XCircle size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Cancelled</span>
            <span className="kpi-value">{stats.cancelledBookings || 0}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon-box amber">
            <CreditCard size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Paid Transactions</span>
            <span className="kpi-value">{stats.paidPaymentCount || 0}</span>
          </div>
        </div>

        <div className="kpi-card" style={{ gridColumn: 'span 2' }}>
          <div className="kpi-icon-box green">
            <IndianRupee size={22} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Recorded Gross Revenue</span>
            <span className="kpi-value" style={{ color: 'var(--success-dark)' }}>
              ₹{Number(stats.totalRevenue || 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="charts-grid">
        {/* MONTHLY TRENDS */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Monthly Booking Velocity (Last 6 Months)</h3>
            <span style={{ fontSize: '12px', color: 'var(--slate-500)', fontWeight: 600 }}>
              Live from reservations.json
            </span>
          </div>

          <div className="bar-chart-container">
            {monthlyTrends.map((trend, idx) => {
              const heightPercent = Math.max(12, Math.round((trend.bookings / maxMonthlyBookings) * 100));

              return (
                <div key={idx} className="bar-column">
                  <span className="bar-val-hint">{trend.bookings} bks</span>
                  <div className="bar-pill" style={{ height: `${heightPercent}%` }} />
                  <span className="bar-label">{trend.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* STATUS DISTRIBUTION */}
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Reservation Status Share</h3>
          </div>

          <div className="status-bars-list">
            <div className="status-bar-row">
              <div className="status-bar-header">
                <span style={{ color: 'var(--success-dark)' }}>Confirmed</span>
                <span>{statusDist.confirmed || 0} ({Math.round(((statusDist.confirmed || 0) / totalStatusCount) * 100)}%)</span>
              </div>
              <div className="status-bar-track">
                <div className="status-bar-fill confirmed" style={{ width: `${((statusDist.confirmed || 0) / totalStatusCount) * 100}%` }} />
              </div>
            </div>

            <div className="status-bar-row">
              <div className="status-bar-header">
                <span style={{ color: 'var(--warning-dark)' }}>Pending</span>
                <span>{statusDist.pending || 0} ({Math.round(((statusDist.pending || 0) / totalStatusCount) * 100)}%)</span>
              </div>
              <div className="status-bar-track">
                <div className="status-bar-fill pending" style={{ width: `${((statusDist.pending || 0) / totalStatusCount) * 100}%` }} />
              </div>
            </div>

            <div className="status-bar-row">
              <div className="status-bar-header">
                <span style={{ color: 'var(--primary)' }}>Completed</span>
                <span>{statusDist.completed || 0} ({Math.round(((statusDist.completed || 0) / totalStatusCount) * 100)}%)</span>
              </div>
              <div className="status-bar-track">
                <div className="status-bar-fill completed" style={{ width: `${((statusDist.completed || 0) / totalStatusCount) * 100}%` }} />
              </div>
            </div>

            <div className="status-bar-row">
              <div className="status-bar-header">
                <span style={{ color: 'var(--danger-dark)' }}>Cancelled</span>
                <span>{statusDist.cancelled || 0} ({Math.round(((statusDist.cancelled || 0) / totalStatusCount) * 100)}%)</span>
              </div>
              <div className="status-bar-track">
                <div className="status-bar-fill cancelled" style={{ width: `${((statusDist.cancelled || 0) / totalStatusCount) * 100}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TWO COLUMN: RECENT BOOKINGS & AUDIT LOGS */}
      <div className="dash-tables-row">
        {/* RECENT RESERVATIONS TABLE */}
        <div className="table-card">
          <div className="chart-header">
            <h3 className="chart-title">Recent Customer Bookings</h3>
            <Link href="/reservations" style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>Manage All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="table-responsive">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Date & Slot</th>
                  <th>Total (₹)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentReservations.map(res => (
                  <tr key={res.id}>
                    <td><strong>{res.bookingId}</strong></td>
                    <td>{res.customerName}</td>
                    <td>{res.serviceName}</td>
                    <td style={{ fontSize: '12px' }}>{res.date} ({res.timeSlot})</td>
                    <td><strong>₹{Number(res.totalPrice).toLocaleString('en-IN')}</strong></td>
                    <td>
                      <span style={{ padding: '3px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 700, textTransform: 'capitalize', background: res.status === 'confirmed' ? 'var(--success-light)' : res.status === 'cancelled' ? 'var(--danger-light)' : 'var(--warning-light)', color: res.status === 'confirmed' ? 'var(--success-dark)' : res.status === 'cancelled' ? 'var(--danger-dark)' : 'var(--warning-dark)' }}>
                        {res.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AUDIT LOGS */}
        <div className="table-card">
          <div className="chart-header">
            <h3 className="chart-title">Live Audit Trail</h3>
            <span style={{ fontSize: '12px', color: 'var(--slate-400)' }}>Audit Logs</span>
          </div>

          <div className="logs-widget-list">
            {recentLogs.map(log => (
              <div key={log.id} className="log-entry">
                <span className="log-action-text">{log.action}</span>
                <span className="log-details-text">{log.details}</span>
                <span className="log-time-text">
                  {new Date(log.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • {log.actorName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
