'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { useToast } from '../../lib/toast-context';
import { api } from '../../lib/api';
import Modal from '../../components/Modal';
import ReceiptModal from '../../components/ReceiptModal';
import {
  CalendarDays,
  Search,
  PlusCircle,
  Clock,
  Users,
  CreditCard,
  Printer,
  Edit,
  XCircle,
  Eye,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import '../../styles/reservations.css';

export default function ReservationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedRes, setSelectedRes] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [modifyModalOpen, setModifyModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  // Modify form state
  const [modifyDate, setModifyDate] = useState('');
  const [modifySlot, setModifySlot] = useState('');
  const [modifyNotes, setModifyNotes] = useState('');
  const [modifying, setModifying] = useState(false);

  // Cancel form state
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await api.get(`/reservations/my${query}`);
      if (res.success && Array.isArray(res.data)) {
        setReservations(res.data);
      }
    } catch (err) {
      showToast('Failed to load reservations', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, showToast]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      fetchReservations();
    }
  }, [user, authLoading, router, fetchReservations]);

  // Open Details Modal
  const handleView = (res) => {
    setSelectedRes(res);
    setViewModalOpen(true);
  };

  // Open Receipt Modal
  const handleReceipt = (res) => {
    setSelectedRes(res);
    setReceiptModalOpen(true);
  };

  // Open Modify Modal
  const handleOpenModify = (res) => {
    setSelectedRes(res);
    setModifyDate(res.date);
    setModifySlot(res.timeSlot);
    setModifyNotes(res.specialInstructions || '');
    setModifyModalOpen(true);
  };

  // Submit Modification
  const handleModifySubmit = async (e) => {
    e.preventDefault();
    if (!selectedRes) return;

    try {
      setModifying(true);
      const res = await api.put(`/reservations/${selectedRes.id}/modify`, {
        date: modifyDate,
        timeSlot: modifySlot,
        specialInstructions: modifyNotes
      });

      if (res.success) {
        showToast('Reservation updated successfully!', 'success');
        setModifyModalOpen(false);
        fetchReservations();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update reservation', 'error');
    } finally {
      setModifying(false);
    }
  };

  // Open Cancel Modal
  const handleOpenCancel = (res) => {
    setSelectedRes(res);
    setCancelReason('Change of plans');
    setCancelModalOpen(true);
  };

  // Submit Cancellation
  const handleCancelSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRes) return;

    try {
      setCancelling(true);
      const res = await api.post(`/reservations/${selectedRes.id}/cancel`, {
        reason: cancelReason
      });

      if (res.success) {
        showToast('Reservation cancelled successfully', 'info');
        setCancelModalOpen(false);
        fetchReservations();
      }
    } catch (err) {
      showToast(err.message || 'Failed to cancel reservation', 'error');
    } finally {
      setCancelling(false);
    }
  };

  const filteredReservations = reservations.filter(r => {
    const q = searchQuery.trim().toLowerCase();
    return !q ||
      r.bookingId.toLowerCase().includes(q) ||
      r.serviceName.toLowerCase().includes(q) ||
      r.date.includes(q);
  });

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="reservations-page-container">
      <div className="reservations-header">
        <div className="reservations-title-box">
          <h1 className="reservations-title">My Reservations</h1>
          <p className="reservations-subtitle">View, reschedule, cancel, or print official receipts for your bookings</p>
        </div>

        <Link href="/booking" className="btn-book-new">
          <PlusCircle size={18} />
          <span>New Reservation</span>
        </Link>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="reservations-filter-bar">
        <div className="search-field-wrapper">
          <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--slate-400)' }} />
          <input
            type="text"
            className="search-field-input"
            placeholder="Search by Booking ID, amenity, date..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="status-filter-pills">
          {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map(st => (
            <button
              key={st}
              className={`status-pill-btn ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* RESERVATIONS LIST */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--slate-500)' }}>
          Loading your reservations...
        </div>
      ) : filteredReservations.length === 0 ? (
        <div className="empty-reservations-box">
          <div style={{ width: '56px', height: '56px', background: 'var(--slate-100)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--slate-400)' }}>
            <CalendarDays size={28} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--navy-900)' }}>
            No reservations found
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--slate-500)', marginTop: '6px' }}>
            {searchQuery || statusFilter !== 'all' ? 'Try changing your filter settings.' : "You haven't made any bookings yet."}
          </p>
          <Link href="/services" className="btn-book-new" style={{ display: 'inline-flex', marginTop: '20px' }}>
            <span>Browse Services to Book</span>
          </Link>
        </div>
      ) : (
        <div className="reservations-list">
          {filteredReservations.map(res => {
            const isEligibleToModify = res.status !== 'cancelled' && res.status !== 'completed' && res.date >= todayStr;
            const isEligibleToCancel = res.status !== 'cancelled' && res.status !== 'completed';

            return (
              <div key={res.id} className="res-card">
                <div className="res-card-left">
                  <div className="res-booking-id-box">
                    <span className="res-booking-label">Ref ID</span>
                    <span>{res.bookingId}</span>
                  </div>

                  <div className="res-info">
                    <h3 className="res-service-name">{res.serviceName}</h3>
                    <div className="res-schedule-meta">
                      <div className="res-meta-item">
                        <CalendarDays size={15} color="var(--primary)" />
                        <span>{res.date}</span>
                      </div>
                      <div className="res-meta-item">
                        <Clock size={15} color="var(--primary)" />
                        <span>{res.timeSlot}</span>
                      </div>
                      <div className="res-meta-item">
                        <Users size={15} color="var(--slate-500)" />
                        <span>{res.quantity} Guest(s)</span>
                      </div>
                      <span className={`status-badge ${res.status}`}>
                        {res.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="res-card-right">
                  <div className="res-price-block">
                    <div className="res-price-val">₹{Number(res.totalPrice).toLocaleString('en-IN')}</div>
                    <div className={`res-pay-status ${res.paymentStatus}`}>
                      {res.paymentStatus}
                    </div>
                  </div>

                  <div className="res-actions-group">
                    <button
                      className="btn-action"
                      onClick={() => handleView(res)}
                      title="View Details"
                    >
                      <Eye size={15} />
                      <span>Details</span>
                    </button>

                    <button
                      className="btn-action"
                      onClick={() => handleReceipt(res)}
                      title="Print Official Slip"
                    >
                      <Printer size={15} />
                      <span>Receipt</span>
                    </button>

                    {res.paymentStatus === 'unpaid' && res.status !== 'cancelled' && (
                      <Link
                        href={`/payments?reservationId=${res.id}`}
                        className="btn-action primary"
                      >
                        <CreditCard size={15} />
                        <span>Pay</span>
                      </Link>
                    )}

                    {isEligibleToModify && (
                      <button
                        className="btn-action"
                        onClick={() => handleOpenModify(res)}
                        title="Reschedule"
                      >
                        <Edit size={15} />
                        <span>Reschedule</span>
                      </button>
                    )}

                    {isEligibleToCancel && (
                      <button
                        className="btn-action danger"
                        onClick={() => handleOpenCancel(res)}
                        title="Cancel Booking"
                      >
                        <XCircle size={15} />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW DETAILS MODAL */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Reservation Details"
      >
        {selectedRes && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: 'var(--slate-50)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--slate-500)', fontWeight: 600 }}>BOOKING REFERENCE</span>
                <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary)' }}>{selectedRes.bookingId}</div>
              </div>
              <div>
                <span style={{ fontSize: '12px', color: 'var(--slate-500)', fontWeight: 600 }}>STATUS</span>
                <div><span className={`status-badge ${selectedRes.status}`}>{selectedRes.status}</span></div>
              </div>
            </div>

            <div>
              <strong>Amenity / Service:</strong> {selectedRes.serviceName} ({selectedRes.serviceCategory})
            </div>
            <div>
              <strong>Date & Time Slot:</strong> {selectedRes.date} at {selectedRes.timeSlot}
            </div>
            <div>
              <strong>Number of Seats/Guests:</strong> {selectedRes.quantity}
            </div>
            <div>
              <strong>Price Calculation:</strong> ₹{Number(selectedRes.subtotal).toLocaleString('en-IN')} + ₹{Number(selectedRes.taxAmount).toLocaleString('en-IN')} (GST 18%) = <strong>₹{Number(selectedRes.totalPrice).toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <strong>Payment Status:</strong> <span className={`res-pay-status ${selectedRes.paymentStatus}`}>{selectedRes.paymentStatus.toUpperCase()}</span>
            </div>

            {selectedRes.specialInstructions && (
              <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)' }}>
                <strong>Special Instructions:</strong>
                <p style={{ marginTop: '4px', color: 'var(--slate-600)' }}>{selectedRes.specialInstructions}</p>
              </div>
            )}

            {selectedRes.status === 'cancelled' && selectedRes.cancellationReason && (
              <div style={{ background: 'var(--danger-light)', padding: '12px', borderRadius: 'var(--radius-md)', color: 'var(--danger-dark)' }}>
                <strong>Cancellation Reason:</strong> {selectedRes.cancellationReason}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* MODIFY RESERVATION MODAL */}
      <Modal
        isOpen={modifyModalOpen}
        onClose={() => setModifyModalOpen(false)}
        title="Reschedule Reservation"
        footer={
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-action" onClick={() => setModifyModalOpen(false)}>
              Cancel
            </button>
            <button
              className="btn-action primary"
              onClick={handleModifySubmit}
              disabled={modifying}
            >
              {modifying ? 'Updating...' : 'Save Changes'}
            </button>
          </div>
        }
      >
        {selectedRes && (
          <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} onSubmit={handleModifySubmit}>
            <p style={{ fontSize: '14px', color: 'var(--slate-600)' }}>
              Adjust date or slot for <strong>{selectedRes.serviceName}</strong> (Ref: {selectedRes.bookingId}):
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600 }}>New Date</label>
              <input
                type="date"
                min={todayStr}
                value={modifyDate}
                onChange={(e) => setModifyDate(e.target.value)}
                className="search-field-input"
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600 }}>New Time Slot</label>
              <input
                type="text"
                placeholder="e.g. 10:30 - 11:30"
                value={modifySlot}
                onChange={(e) => setModifySlot(e.target.value)}
                className="search-field-input"
                required
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600 }}>Updated Instructions</label>
              <textarea
                value={modifyNotes}
                onChange={(e) => setModifyNotes(e.target.value)}
                className="search-field-input"
                rows={3}
              />
            </div>
          </form>
        )}
      </Modal>

      {/* CANCEL RESERVATION MODAL */}
      <Modal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        title="Confirm Cancellation"
        footer={
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-action" onClick={() => setCancelModalOpen(false)}>
              Keep Reservation
            </button>
            <button
              className="btn-action danger"
              onClick={handleCancelSubmit}
              disabled={cancelling}
            >
              {cancelling ? 'Cancelling...' : 'Confirm Cancel'}
            </button>
          </div>
        }
      >
        {selectedRes && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--danger-dark)', background: 'var(--danger-light)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <AlertTriangle size={20} />
              <span>Are you sure you want to cancel booking <strong>{selectedRes.bookingId}</strong>?</span>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--slate-600)' }}>
              Service: {selectedRes.serviceName} on {selectedRes.date} ({selectedRes.timeSlot}).
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600 }}>Reason for Cancellation</label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="search-field-input"
                rows={3}
                placeholder="Please state why you are cancelling..."
                required
              />
            </div>
          </div>
        )}
      </Modal>

      {/* PRINT RECEIPT MODAL */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        reservation={selectedRes}
      />
    </div>
  );
}
