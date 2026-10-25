'use client';
import React from 'react';
import Modal from './Modal';
import { Printer, CheckCircle2, AlertCircle } from 'lucide-react';
import '../styles/receipt.css';

export default function ReceiptModal({ isOpen, onClose, reservation, payment }) {
  if (!reservation) return null;

  const handlePrint = () => {
    window.print();
  };

  const isPaid = reservation.paymentStatus === 'paid' || (payment && payment.status === 'paid');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Booking & Payment Receipt"
      maxWidth="680px"
      footer={
        <div className="receipt-actions">
          <button className="btn-print" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print Receipt</span>
          </button>
        </div>
      }
    >
      <div className="receipt-container">
        <div className="receipt-card">
          <div className="receipt-header">
            <div>
              <div className="receipt-brand-title">ReserveEase Receipt</div>
              <div className="receipt-brand-sub">Enterprise Reservation Confirmation</div>
            </div>
            <div className={`receipt-badge-status ${isPaid ? 'paid' : 'unpaid'}`}>
              {isPaid ? 'PAID IN FULL' : 'PAYMENT PENDING'}
            </div>
          </div>

          <div className="receipt-grid">
            <div className="receipt-field-group">
              <span className="receipt-label">Booking Reference</span>
              <span className="receipt-value" style={{ color: 'var(--primary)', letterSpacing: '0.5px' }}>
                {reservation.bookingId}
              </span>
            </div>
            <div className="receipt-field-group">
              <span className="receipt-label">Issue Date</span>
              <span className="receipt-value">
                {new Date(reservation.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
            <div className="receipt-field-group">
              <span className="receipt-label">Billed To</span>
              <span className="receipt-value">{reservation.customerName}</span>
              <span style={{ fontSize: '13px', color: 'var(--slate-500)' }}>{reservation.customerEmail}</span>
            </div>
            <div className="receipt-field-group">
              <span className="receipt-label">Scheduled Slot</span>
              <span className="receipt-value">{reservation.date}</span>
              <span style={{ fontSize: '13px', color: 'var(--slate-500)' }}>{reservation.timeSlot}</span>
            </div>
          </div>

          <div className="receipt-table-wrapper">
            <table className="receipt-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Rate (₹)</th>
                  <th style={{ textAlign: 'right' }}>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>{reservation.serviceName}</strong>
                    <div style={{ fontSize: '12px', color: 'var(--slate-500)' }}>
                      Category: {reservation.serviceCategory}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>{reservation.quantity}</td>
                  <td style={{ textAlign: 'right' }}>₹{Number(reservation.unitPrice).toLocaleString('en-IN')}</td>
                  <td style={{ textAlign: 'right' }}>₹{Number(reservation.subtotal).toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="receipt-summary-box">
            <div className="receipt-summary-row">
              <span>Subtotal:</span>
              <span>₹{Number(reservation.subtotal).toLocaleString('en-IN')}</span>
            </div>
            <div className="receipt-summary-row">
              <span>GST / Taxes (18%):</span>
              <span>₹{Number(reservation.taxAmount).toLocaleString('en-IN')}</span>
            </div>
            <div className="receipt-summary-row total">
              <span>Grand Total:</span>
              <span>₹{Number(reservation.totalPrice).toLocaleString('en-IN')}</span>
            </div>
          </div>

          {payment && (
            <div style={{ marginTop: '20px', padding: '12px 16px', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', fontSize: '13px', display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong>Payment Ref:</strong> {payment.transactionRef || payment.id} ({payment.paymentMethod})
              </div>
              <div style={{ color: 'var(--success-dark)', fontWeight: 600 }}>
                Verified Electronic Transaction
              </div>
            </div>
          )}

          <div className="receipt-footer-note">
            Thank you for choosing ReserveEase. Please present this confirmation slip upon arrival.
            For modifications, call +91 22 4589 1200 or visit your dashboard.
          </div>
        </div>
      </div>
    </Modal>
  );
}
