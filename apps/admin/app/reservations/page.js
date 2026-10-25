'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../lib/auth-context';
import { useToast } from '../../lib/toast-context';
import { api } from '../../lib/api';
import Modal from '../../components/Modal';
import {
  CalendarDays,
  Search,
  CheckCircle,
  XCircle,
  CheckCheck,
  Eye,
  AlertTriangle,
  Clock,
  Users
} from 'lucide-react';
import '../../styles/admin-reservations.css';

export default function AdminReservationsPage() {
  const router = useRouter();
  const { adminUser, loading: authLoading } = useAdminAuth();
  const { showToast } = useToast();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedRes, setSelectedRes] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      let query = '?';
      if (statusFilter !== 'all') query += `status=${statusFilter}&`;
      if (dateFilter) query += `date=${dateFilter}&`;

      const res = await api.get(`/reservations/admin/all${query}`);
      if (res.success && Array.isArray(res.data)) {
        setReservations(res.data);
      }
    } catch (err) {
      showToast('Failed to load reservations', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, dateFilter, showToast]);

  useEffect(() => {
    if (!authLoading && !adminUser) {
      router.push('/login');
      return;
    }
    if (adminUser) {
      fetchReservations();
    }
  }, [adminUser, authLoading, router, fetchReservations]);

  const handleUpdateStatus = async (id, status, reason = '') => {
    try {
      setActionLoading(true);
      const res = await api.put(`/reservations/${id}/status`, {
        status,
        cancellationReason: reason
      });

      if (res.success) {
        showToast(`Reservation marked as ${status}`, 'success');
        setCancelModalOpen(false);
        fetchReservations();
      }
    } catch (err) {
      showToast(err.message || 'Status update failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenCancel = (res) => {
    setSelectedRes(res);
    setCancellationReason('Administrative schedule modification or maintenance');
    setCancelModalOpen(true);
  };

  const handleOpenDetails = (res) => {
    setSelectedRes(res);
    setDetailsModalOpen(true);
  };

  const filteredReservations = reservations.filter(r => {
    const q = searchQuery.trim().toLowerCase();
    return !q ||
      r.bookingId.toLowerCase().includes(q) ||
      r.serviceName.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      r.customerEmail.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="admin-res-header">
        <h1 className="admin-res-title">Enterprise Reservation Register</h1>
        <p className="admin-res-sub">Audit, confirm, reschedule, or cancel customer bookings with real-time JSON storage</p>
      </div>

      {/* CONTROLS */}
      <div className="admin-res-controls-bar">
        <div className="admin-res-search-wrapper">
          <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--slate-400)' }} />
          <input
            type="text"
            className="admin-res-search-input"
            placeholder="Search by Booking ID, customer name, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="date-filter-box">
          <input
            type="date"
            className="date-filter-input"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              style={{ background: 'none', border: 'none', fontSize: '12px', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}
            >
              Clear Date
            </button>
          )}
        </div>

        <div className="res-pills-filter">
          {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map(st => (
            <button
              key={st}
              className={`res-pill-btn ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="admin-res-table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--slate-500)' }}>
            Loading enterprise reservations...
          </div>
        ) : filteredReservations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--slate-400)' }}>
            No reservations found matching active filters.
          </div>
        ) : (
          <div className="admin-res-table-responsive">
            <table className="admin-res-table">
              <thead>
                <tr>
                  <th>Booking Ref</th>
                  <th>Customer</th>
                  <th>Amenity</th>
                  <th>Date & Slot</th>
                  <th>Qty</th>
                  <th>Total (₹)</th>
                  <th>Pay Status</th>
                  <th>Status</th>
                  <th>Management Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map(res => (
                  <tr key={res.id}>
                    <td><strong>{res.bookingId}</strong></td>

                    <td>
                      <div>
                        <strong>{res.customerName}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--slate-500)' }}>{res.customerEmail}</div>
                      </div>
                    </td>

                    <td>{res.serviceName}</td>

                    <td>
                      <div>
                        <strong>{res.date}</strong>
                        <div style={{ fontSize: '11px', color: 'var(--slate-500)' }}>{res.timeSlot}</div>
                      </div>
                    </td>

                    <td>{res.quantity}</td>

                    <td><strong>₹{Number(res.totalPrice).toLocaleString('en-IN')}</strong></td>

                    <td>
                      <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: res.paymentStatus === 'paid' ? 'var(--success-dark)' : 'var(--warning-dark)' }}>
                        {res.paymentStatus}
                      </span>
                    </td>

                    <td>
                      <span className={`status-badge-cell ${res.status}`}>
                        {res.status}
                      </span>
                    </td>

                    <td>
                      <div className="admin-actions-cell">
                        <button
                          className="btn-table-action"
                          onClick={() => handleOpenDetails(res)}
                          title="View Details"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>

                        {res.status === 'pending' && (
                          <button
                            className="btn-table-action confirm"
                            onClick={() => handleUpdateStatus(res.id, 'confirmed')}
                            title="Confirm Booking"
                          >
                            <CheckCircle size={13} />
                            <span>Confirm</span>
                          </button>
                        )}

                        {res.status === 'confirmed' && (
                          <button
                            className="btn-table-action complete"
                            onClick={() => handleUpdateStatus(res.id, 'completed')}
                            title="Mark as Completed"
                          >
                            <CheckCheck size={13} />
                            <span>Complete</span>
                          </button>
                        )}

                        {res.status !== 'cancelled' && (
                          <button
                            className="btn-table-action cancel"
                            onClick={() => handleOpenCancel(res)}
                            title="Cancel Booking"
                          >
                            <XCircle size={13} />
                            <span>Cancel</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAILS MODAL */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Comprehensive Reservation Inspection"
      >
        {selectedRes && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', background: 'var(--slate-50)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: 700 }}>Reference ID</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--primary)' }}>{selectedRes.bookingId}</div>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: 700 }}>Current Status</span>
                <div><span className={`status-badge-cell ${selectedRes.status}`}>{selectedRes.status}</span></div>
              </div>
            </div>

            <div><strong>Customer:</strong> {selectedRes.customerName} ({selectedRes.customerEmail})</div>
            <div><strong>Contact Phone:</strong> {selectedRes.customerPhone || 'N/A'}</div>
            <div><strong>Amenity:</strong> {selectedRes.serviceName} ({selectedRes.serviceCategory})</div>
            <div><strong>Date & Time Slot:</strong> {selectedRes.date} at {selectedRes.timeSlot}</div>
            <div><strong>Quantity / Seats:</strong> {selectedRes.quantity}</div>
            <div><strong>Financial Breakdown:</strong> Base ₹{Number(selectedRes.subtotal).toLocaleString('en-IN')} + Tax ₹{Number(selectedRes.taxAmount).toLocaleString('en-IN')} = <strong>₹{Number(selectedRes.totalPrice).toLocaleString('en-IN')}</strong></div>
            <div><strong>Payment Status:</strong> {selectedRes.paymentStatus.toUpperCase()}</div>

            {selectedRes.specialInstructions && (
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                <strong>Customer Notes:</strong>
                <p style={{ marginTop: '4px', color: 'var(--slate-600)' }}>{selectedRes.specialInstructions}</p>
              </div>
            )}

            {selectedRes.cancellationReason && (
              <div style={{ background: 'var(--danger-light)', padding: '12px', borderRadius: 'var(--radius-md)', color: 'var(--danger-dark)' }}>
                <strong>Recorded Cancellation Reason:</strong> {selectedRes.cancellationReason}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* CANCEL MODAL WITH REASON */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Admin Cancellation Authority"
        footer={
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-table-action" onClick={() => setCancelModalOpen(false)}>
              Abort
            </button>
            <button
              className="btn-table-action cancel"
              onClick={() => handleUpdateStatus(selectedRes.id, 'cancelled', cancellationReason)}
              disabled={actionLoading}
            >
              {actionLoading ? 'Cancelling...' : 'Execute Cancellation'}
            </button>
          </div>
        }
      >
        {selectedRes && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger-dark)', background: 'var(--danger-light)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <AlertTriangle size={18} />
              <span>Confirm administrative cancellation for <strong>{selectedRes.bookingId}</strong> ({selectedRes.customerName})</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600 }}>Administrative Reason (Audited)</label>
              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="admin-res-search-input"
                rows={3}
                required
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
