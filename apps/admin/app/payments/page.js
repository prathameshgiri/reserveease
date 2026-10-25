'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../lib/auth-context';
import { useToast } from '../../lib/toast-context';
import { api } from '../../lib/api';
import Modal from '../../components/Modal';
import {
  CreditCard,
  Search,
  RotateCcw,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import '../../styles/admin-payments.css';

export default function AdminPaymentsPage() {
  const router = useRouter();
  const { adminUser, loading: authLoading } = useAdminAuth();
  const { showToast } = useToast();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Refund modal state
  const [refundModalOpen, setRefundModalOpen] = useState(false);
  const [selectedPayForRefund, setSelectedPayForRefund] = useState(null);
  const [refundReason, setRefundReason] = useState('Customer requested schedule cancellation');
  const [refunding, setRefunding] = useState(false);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await api.get(`/payments/admin/all${query}`);
      if (res.success && Array.isArray(res.data)) {
        setPayments(res.data);
      }
    } catch (err) {
      showToast('Failed to load payment records', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, showToast]);

  useEffect(() => {
    if (!authLoading && !adminUser) {
      router.push('/login');
      return;
    }
    if (adminUser) {
      fetchPayments();
    }
  }, [adminUser, authLoading, router, fetchPayments]);

  const handleOpenRefund = (pay) => {
    setSelectedPayForRefund(pay);
    setRefundReason('Customer requested cancellation & authorized refund');
    setRefundModalOpen(true);
  };

  const handleExecuteRefund = async (e) => {
    e.preventDefault();
    if (!selectedPayForRefund) return;

    try {
      setRefunding(true);
      const res = await api.post(`/payments/${selectedPayForRefund.id}/refund`, {
        refundReason
      });

      if (res.success) {
        showToast('Payment refunded successfully!', 'success');
        setRefundModalOpen(false);
        fetchPayments();
      }
    } catch (err) {
      showToast(err.message || 'Refund processing failed', 'error');
    } finally {
      setRefunding(false);
    }
  };

  const filteredPayments = payments.filter(p => {
    const q = searchQuery.trim().toLowerCase();
    return !q ||
      p.id.toLowerCase().includes(q) ||
      p.transactionRef?.toLowerCase().includes(q) ||
      p.bookingId?.toLowerCase().includes(q) ||
      p.customerName?.toLowerCase().includes(q);
  });

  // Calculate gross, refunds, net
  const grossCollected = payments
    .filter(p => p.status === 'paid' || p.status === 'refunded')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const totalRefunded = payments
    .filter(p => p.status === 'refunded')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const netRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div>
      <div className="admin-pay-header">
        <h1 className="admin-pay-title">Financial Transactions & Settlements</h1>
        <p className="admin-pay-sub">Audit transaction IDs, monitor simulated payments, and record authorized refunds</p>
      </div>

      {/* SUMMARY STATS BAR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--white)', padding: '20px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Gross Processed</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--navy-900)', marginTop: '4px' }}>
            ₹{grossCollected.toLocaleString('en-IN')}
          </div>
        </div>

        <div style={{ background: 'var(--white)', padding: '20px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Refunded Adjustments</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--danger-dark)', marginTop: '4px' }}>
            ₹{totalRefunded.toLocaleString('en-IN')}
          </div>
        </div>

        <div style={{ background: 'var(--white)', padding: '20px', borderRadius: 'var(--radius-xl)', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-sm)' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--slate-500)', textTransform: 'uppercase' }}>Net Retained Revenue</span>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--success-dark)', marginTop: '4px' }}>
            ₹{netRevenue.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div className="admin-pay-controls">
        <div className="admin-pay-search-box">
          <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--slate-400)' }} />
          <input
            type="text"
            className="admin-pay-search-input"
            placeholder="Search by Payment ID, Transaction Ref, Booking ID, Customer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="admin-pay-pills">
          {['all', 'paid', 'refunded', 'failed'].map(st => (
            <button
              key={st}
              className={`admin-pay-pill ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="admin-pay-table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--slate-500)' }}>
            Loading ledger...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--slate-400)' }}>
            No payment records found.
          </div>
        ) : (
          <div className="admin-pay-table-responsive">
            <table className="admin-pay-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Customer</th>
                  <th>Booking Ref</th>
                  <th>Amount (₹)</th>
                  <th>Instrument</th>
                  <th>Transaction Ref</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map(pay => (
                  <tr key={pay.id}>
                    <td><strong style={{ color: 'var(--primary)' }}>{pay.id}</strong></td>
                    <td><strong>{pay.customerName}</strong></td>
                    <td>{pay.bookingId}</td>
                    <td><strong>₹{Number(pay.amount).toLocaleString('en-IN')}</strong></td>
                    <td>{pay.paymentMethod}</td>
                    <td style={{ fontSize: '12px', fontFamily: 'monospace' }}>{pay.transactionRef}</td>
                    <td style={{ fontSize: '13px', color: 'var(--slate-600)' }}>
                      {pay.paidAt ? new Date(pay.paidAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) : 'N/A'}
                    </td>
                    <td>
                      <span className={`pay-status-pill ${pay.status}`}>
                        {pay.status}
                      </span>
                    </td>
                    <td>
                      {pay.status === 'paid' && (
                        <button
                          className="btn-refund"
                          onClick={() => handleOpenRefund(pay)}
                        >
                          <RotateCcw size={12} />
                          <span>Refund</span>
                        </button>
                      )}
                      {pay.status === 'refunded' && (
                        <span style={{ fontSize: '11px', color: 'var(--slate-400)' }}>
                          {pay.refundReason || 'Refunded'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REFUND MODAL */}
      <Modal
        isOpen={refundModalOpen}
        onClose={() => setRefundModalOpen(false)}
        title="Authorize Customer Refund"
        footer={
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-table-action" onClick={() => setRefundModalOpen(false)}>
              Cancel
            </button>
            <button
              className="btn-refund"
              style={{ background: 'var(--danger)', color: 'var(--white)', padding: '8px 16px', fontSize: '13px' }}
              onClick={handleExecuteRefund}
              disabled={refunding}
            >
              {refunding ? 'Authorizing Refund...' : `Confirm Refund of ₹${Number(selectedPayForRefund?.amount || 0).toLocaleString('en-IN')}`}
            </button>
          </div>
        }
      >
        {selectedPayForRefund && (
          <form style={{ display: 'flex', flexDirection: 'column', gap: '14px' }} onSubmit={handleExecuteRefund}>
            <div style={{ background: 'var(--danger-light)', padding: '14px', borderRadius: 'var(--radius-md)', color: 'var(--danger-dark)', fontSize: '13px' }}>
              <strong>Refund Notice:</strong> You are about to record a refund of <strong>₹{Number(selectedPayForRefund.amount).toLocaleString('en-IN')}</strong> for booking <strong>{selectedPayForRefund.bookingId}</strong> ({selectedPayForRefund.customerName}).
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 600 }}>Refund Audit Reason</label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="admin-pay-search-input"
                rows={3}
                required
              />
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
