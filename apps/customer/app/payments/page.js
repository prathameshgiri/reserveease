'use client';
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { useToast } from '../../lib/toast-context';
import { api } from '../../lib/api';
import Modal from '../../components/Modal';
import ReceiptModal from '../../components/ReceiptModal';
import {
  CreditCard,
  QrCode,
  Building,
  Printer,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Lock,
  Zap,
  Check,
  Smartphone,
  User,
  CalendarDays
} from 'lucide-react';
import '../../styles/payments.css';

function PaymentsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const directReservationId = searchParams ? searchParams.get('reservationId') : null;

  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [payments, setPayments] = useState([]);
  const [unpaidReservations, setUnpaidReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Pay modal state
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedResForPayment, setSelectedResForPayment] = useState(null);
  const [activeTab, setActiveTab] = useState('card'); // 'card' | 'upi' | 'netbanking'
  const [processing, setProcessing] = useState(false);

  // Card form state for live realistic card visual
  const [cardNumber, setCardNumber] = useState('4532 8920 1145 9238');
  const [cardHolder, setCardHolder] = useState('ROHIT SHARMA');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('742');

  // UPI state
  const [upiId, setUpiId] = useState('rohit@okhdfcbank');

  // Net banking state
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Receipt modal state
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState(null);
  const [associatedReservation, setAssociatedReservation] = useState(null);

  const getCustomerName = useCallback(() => {
    if (user?.name && !user.name.toLowerCase().includes('admin')) {
      return user.name.toUpperCase();
    }
    return 'ROHIT SHARMA';
  }, [user]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [paymentsRes, reservationsRes] = await Promise.all([
        api.get('/payments/my'),
        api.get('/reservations/my')
      ]);

      if (paymentsRes.success && Array.isArray(paymentsRes.data)) {
        setPayments(paymentsRes.data);
      }

      if (reservationsRes.success && Array.isArray(reservationsRes.data)) {
        const unpaid = reservationsRes.data.filter(
          r => r.paymentStatus === 'unpaid' && r.status !== 'cancelled'
        );
        setUnpaidReservations(unpaid);

        if (directReservationId) {
          const target = reservationsRes.data.find(r => r.id === directReservationId || r.bookingId === directReservationId);
          if (target && target.paymentStatus === 'unpaid') {
            setSelectedResForPayment(target);
            setPayModalOpen(true);
          }
        }
      }
    } catch (err) {
      showToast('Failed to load transaction history', 'error');
    } finally {
      setLoading(false);
    }
  }, [directReservationId, showToast]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      setCardHolder(getCustomerName());
      if (user.email && !user.email.toLowerCase().includes('admin')) {
        setUpiId(`${user.email.split('@')[0]}@okaxis`);
      }
      loadData();
    }
  }, [user, authLoading, router, loadData, getCustomerName]);

  const handleOpenPay = (reservation) => {
    setSelectedResForPayment(reservation);
    setPayModalOpen(true);
  };

  const handleCardNumberChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted || '•••• •••• •••• ••••');
  };

  const handleExpiryChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2, 4)}`;
    }
    setCardExpiry(raw || 'MM/YY');
  };

  const handleProcessPayment = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedResForPayment) return;

    try {
      setProcessing(true);
      let selectedMethod = 'Credit/Debit Card';
      if (activeTab === 'upi') selectedMethod = 'UPI';
      if (activeTab === 'netbanking') selectedMethod = `Net Banking (${selectedBank})`;

      const res = await api.post('/payments/demo-pay', {
        reservationId: selectedResForPayment.id,
        paymentMethod: selectedMethod,
        simulateFailure: false
      });

      if (res.success && res.data) {
        showToast('Payment authorized and confirmed successfully!', 'success');
        setPayModalOpen(false);
        loadData();
        setSelectedPaymentForReceipt(res.data);
        setAssociatedReservation(selectedResForPayment);
        setReceiptModalOpen(true);
      }
    } catch (err) {
      showToast(err.message || 'Payment authorization failed', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleViewReceipt = async (payment) => {
    try {
      const res = await api.get(`/payments/${payment.id}/receipt`);
      if (res.success && res.data) {
        setSelectedPaymentForReceipt(res.data.payment);
        setAssociatedReservation(res.data.reservation);
        setReceiptModalOpen(true);
      }
    } catch (err) {
      showToast('Failed to load official receipt', 'error');
    }
  };

  const banks = [
    'HDFC Bank',
    'ICICI Bank',
    'State Bank of India',
    'Axis Bank',
    'Kotak Mahindra Bank',
    'Punjab National Bank'
  ];

  return (
    <div className="payments-page-container">
      {/* PAGE HEADER */}
      <div className="payments-header">
        <h1 className="payments-title">Billing & Payment Center</h1>
        <p className="payments-subtitle">
          Manage outstanding invoices, complete PCI-DSS encrypted checkouts, and print official tax receipts.
        </p>
      </div>

      {/* SECURITY ASSURANCE BANNER */}
      <div className="security-trust-bar">
        <div className="security-trust-info">
          <div className="security-icon-circle">
            <ShieldCheck size={26} />
          </div>
          <div>
            <div className="security-heading">
              Bank-Grade 256-Bit SSL Encrypted Checkout
            </div>
            <div className="security-subtext">
              ReserveEase guarantees end-to-end encryption compliant with RBI and PCI-DSS Level-1 standards.
            </div>
          </div>
        </div>

        <div className="security-badges-row">
          <span className="sec-pill">
            <Lock size={12} />
            <span>256-Bit SSL</span>
          </span>
          <span className="sec-pill">
            <CheckCircle2 size={12} />
            <span>PCI-DSS Level 1</span>
          </span>
          <span className="sec-pill">
            <Zap size={12} />
            <span>NPCI UPI Verified</span>
          </span>
        </div>
      </div>

      {/* OUTSTANDING INVOICES SECTION */}
      {unpaidReservations.length > 0 && (
        <div className="unpaid-section">
          <h2 className="unpaid-section-title">
            <Clock size={20} color="#ea580c" />
            <span>Outstanding Invoices Awaiting Settlement</span>
            <span className="unpaid-badge-count">{unpaidReservations.length} Pending</span>
          </h2>

          <div className="unpaid-grid">
            {unpaidReservations.map(res => (
              <div key={res.id} className="unpaid-card">
                <div className="unpaid-details">
                  <span className="unpaid-service-name">{res.serviceName}</span>
                  <span className="unpaid-meta">
                    Invoice: <strong>{res.bookingId}</strong> • {res.date} ({res.timeSlot})
                  </span>
                  <span className="unpaid-price">
                    Total Due: ₹{Number(res.totalPrice).toLocaleString('en-IN')}
                  </span>
                </div>

                <button
                  className="btn-pay-now"
                  onClick={() => handleOpenPay(res)}
                >
                  <Lock size={14} />
                  <span>Pay Now</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VERIFIED TRANSACTIONS HISTORY TABLE */}
      <div className="transactions-panel">
        <div className="transactions-panel-header">
          <div>
            <h2 className="panel-heading">Financial Transactions & Receipts</h2>
            <p style={{ fontSize: '13px', color: 'var(--slate-500)', marginTop: '2px' }}>
              Official records of all settled and processed reservations
            </p>
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--slate-600)' }}>
            Showing {payments.length} verified records
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--slate-500)' }}>
            Loading verified transactions...
          </div>
        ) : payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '70px 0', color: 'var(--slate-400)' }}>
            No recorded transactions found. Outstanding reservations will appear above for settlement.
          </div>
        ) : (
          <div className="payments-table-wrapper">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Payment ID</th>
                  <th>Booking Ref</th>
                  <th>Payment Rail</th>
                  <th>Amount (₹)</th>
                  <th>Bank Transaction Ref</th>
                  <th>Settlement Date</th>
                  <th>Status</th>
                  <th>Official Invoice</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(pay => (
                  <tr key={pay.id}>
                    <td className="pay-ref-text">{pay.id}</td>
                    <td><strong>{pay.bookingId}</strong></td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 }}>
                        {pay.paymentMethod.includes('UPI') ? <Smartphone size={15} color="var(--primary)" /> : <CreditCard size={15} color="var(--primary)" />}
                        {pay.paymentMethod}
                      </span>
                    </td>
                    <td><strong style={{ fontSize: '15px' }}>₹{Number(pay.amount).toLocaleString('en-IN')}</strong></td>
                    <td style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--slate-600)' }}>
                      {pay.transactionRef}
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--slate-600)' }}>
                      {pay.paidAt ? new Date(pay.paidAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) : 'N/A'}
                    </td>
                    <td>
                      <span className={`pay-badge ${pay.status}`}>
                        {pay.status === 'paid' && <Check size={11} />}
                        {pay.status}
                      </span>
                    </td>
                    <td>
                      {pay.status === 'paid' && (
                        <button
                          className="btn-action"
                          onClick={() => handleViewReceipt(pay)}
                          style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Printer size={13} />
                          <span>Receipt</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECURE CHECKOUT PORTAL MODAL */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Lock size={18} color="var(--primary)" />
            <span>ReserveEase Secure Checkout</span>
            <span className="modal-sec-badge">
              <ShieldCheck size={13} />
              <span>256-Bit SSL Protected</span>
            </span>
          </div>
        }
        maxWidth="920px"
        footer={null}
      >
        {selectedResForPayment && (
          <div className="checkout-portal-layout">
            {/* LEFT SIDE: PAYMENT INSTRUMENTS & CARD SIMULATOR */}
            <div>
              {/* PAYMENT INSTRUMENT TABS */}
              <div className="checkout-method-tabs">
                <button
                  type="button"
                  className={`checkout-tab-btn ${activeTab === 'card' ? 'active' : ''}`}
                  onClick={() => setActiveTab('card')}
                >
                  <CreditCard size={16} />
                  <span>Cards</span>
                </button>
                <button
                  type="button"
                  className={`checkout-tab-btn ${activeTab === 'upi' ? 'active' : ''}`}
                  onClick={() => setActiveTab('upi')}
                >
                  <QrCode size={16} />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  className={`checkout-tab-btn ${activeTab === 'netbanking' ? 'active' : ''}`}
                  onClick={() => setActiveTab('netbanking')}
                >
                  <Building size={16} />
                  <span>Net Banking</span>
                </button>
              </div>

              {/* CARD PAYMENT TAB */}
              {activeTab === 'card' && (
                <div>
                  {/* REALISTIC 3D CREDIT/DEBIT CARD VISUAL */}
                  <div className="realistic-card-wrapper">
                    <div className="realistic-card">
                      <div className="card-top-row">
                        <div className="card-chip" />
                        <div className="card-contactless">
                          <span>PLATINUM DEBIT</span>
                          <Lock size={12} />
                        </div>
                      </div>

                      <div className="card-number-display">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </div>

                      <div className="card-bottom-row">
                        <div>
                          <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Card Holder</div>
                          <div className="card-holder-name">{cardHolder || 'ROHIT SHARMA'}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '9px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Expires</div>
                          <div className="card-expiry-val">{cardExpiry || 'MM/YY'}</div>
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 900, fontStyle: 'italic', letterSpacing: '1px' }}>
                          VISA
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* CARD FORM INPUTS */}
                  <div className="card-form-grid">
                    <div className="form-group-field">
                      <label>Card Number</label>
                      <div className="input-with-icon">
                        <CreditCard size={15} className="input-icon-prefix" />
                        <input
                          type="text"
                          className="form-input-styled"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          placeholder="16-digit card number"
                          maxLength={19}
                        />
                      </div>
                    </div>

                    <div className="form-group-field">
                      <label>Cardholder Name</label>
                      <div className="input-with-icon">
                        <User size={15} className="input-icon-prefix" />
                        <input
                          type="text"
                          className="form-input-styled"
                          value={cardHolder}
                          onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                          placeholder="Full name as printed on card"
                        />
                      </div>
                    </div>

                    <div className="form-row-dual">
                      <div className="form-group-field">
                        <label>Expiry Date</label>
                        <div className="input-with-icon">
                          <CalendarDays size={15} className="input-icon-prefix" />
                          <input
                            type="text"
                            className="form-input-styled"
                            value={cardExpiry}
                            onChange={handleExpiryChange}
                            placeholder="MM/YY"
                            maxLength={5}
                          />
                        </div>
                      </div>
                      <div className="form-group-field">
                        <label>CVV / CVC</label>
                        <div className="input-with-icon">
                          <Lock size={15} className="input-icon-prefix" />
                          <input
                            type="password"
                            className="form-input-styled"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.slice(0, 4))}
                            placeholder="3 digits"
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* UPI PAYMENT TAB */}
              {activeTab === 'upi' && (
                <div className="upi-checkout-box">
                  <div className="upi-timer-badge">
                    <Clock size={14} />
                    <span>Dynamic QR Code Valid for 04:58 mins</span>
                  </div>

                  <div className="upi-qr-display">
                    <svg width="150" height="150" viewBox="0 0 100 100" fill="none">
                      <rect width="100" height="100" fill="white" />
                      <rect x="10" y="10" width="25" height="25" fill="#0f172a" rx="4" />
                      <rect x="14" y="14" width="17" height="17" fill="white" rx="2" />
                      <rect x="18" y="18" width="9" height="9" fill="#2563eb" rx="1" />

                      <rect x="65" y="10" width="25" height="25" fill="#0f172a" rx="4" />
                      <rect x="69" y="14" width="17" height="17" fill="white" rx="2" />
                      <rect x="73" y="18" width="9" height="9" fill="#2563eb" rx="1" />

                      <rect x="10" y="65" width="25" height="25" fill="#0f172a" rx="4" />
                      <rect x="14" y="69" width="17" height="17" fill="white" rx="2" />
                      <rect x="18" y="73" width="9" height="9" fill="#2563eb" rx="1" />

                      <rect x="42" y="15" width="6" height="6" fill="#0f172a" />
                      <rect x="52" y="20" width="6" height="6" fill="#0f172a" />
                      <rect x="42" y="35" width="6" height="6" fill="#0f172a" />
                      <rect x="52" y="45" width="8" height="8" fill="#2563eb" />
                      <rect x="35" y="55" width="6" height="6" fill="#0f172a" />
                      <rect x="65" y="45" width="6" height="6" fill="#0f172a" />
                      <rect x="75" y="65" width="6" height="6" fill="#0f172a" />
                      <rect x="45" y="75" width="6" height="6" fill="#0f172a" />
                      <rect x="65" y="75" width="15" height="15" fill="#0f172a" rx="2" />
                    </svg>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy-900)' }}>
                    Scan with any UPI App to Authorize Instant Settlement
                  </div>

                  <div className="upi-apps-row">
                    <span className="upi-app-badge">Google Pay</span>
                    <span className="upi-app-badge">PhonePe</span>
                    <span className="upi-app-badge">Paytm</span>
                    <span className="upi-app-badge">BHIM UPI</span>
                  </div>

                  <div style={{ width: '100%', marginTop: '6px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--slate-500)', marginBottom: '6px' }}>
                      Or enter your Virtual Payment Address (VPA)
                    </div>
                    <input
                      type="text"
                      className="form-input-styled"
                      style={{ width: '100%', textAlign: 'center', paddingLeft: '14px' }}
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@bank"
                    />
                  </div>
                </div>
              )}

              {/* NET BANKING TAB */}
              {activeTab === 'netbanking' && (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '12px' }}>
                    Select Your Preferred Bank
                  </div>
                  <div className="netbanking-grid">
                    {banks.map((bank) => (
                      <div
                        key={bank}
                        className={`bank-option-card ${selectedBank === bank ? 'selected' : ''}`}
                        onClick={() => setSelectedBank(bank)}
                      >
                        <Building size={18} color={selectedBank === bank ? 'var(--primary)' : 'var(--slate-500)'} />
                        <span>{bank}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT SIDE: ORDER BREAKDOWN & SECURE SUBMISSION */}
            <div className="order-summary-panel">
              <div>
                <div className="summary-header-title">
                  <span>Order Summary</span>
                  <span className="summary-booking-id">
                    {selectedResForPayment.bookingId}
                  </span>
                </div>

                <div className="summary-service-card">
                  <div className="summary-service-name">
                    {selectedResForPayment.serviceName}
                  </div>
                  <div className="summary-service-meta">
                    <CalendarDays size={14} color="var(--primary)" />
                    <span>{selectedResForPayment.date} • {selectedResForPayment.timeSlot}</span>
                  </div>
                </div>

                <div className="summary-items-list">
                  <div className="summary-row">
                    <span>Base Reservation Fee</span>
                    <span style={{ fontWeight: 600 }}>₹{Number(selectedResForPayment.totalPrice).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="summary-row">
                    <span>GST & Taxes (18% Inclusive)</span>
                    <span style={{ color: '#059669', fontWeight: 700 }}>Included</span>
                  </div>
                  <div className="summary-row">
                    <span>Payment Gateway Fee</span>
                    <span style={{ color: '#059669', fontWeight: 700 }}>₹0.00 (Waived)</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total Payable</span>
                    <span className="amount-highlight">
                      ₹{Number(selectedResForPayment.totalPrice).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div className="summary-guarantee-box">
                  <Lock size={16} color="#15803d" style={{ flexShrink: 0 }} />
                  <span>256-bit SSL encrypted. Immediate booking confirmation & computerized tax receipt.</span>
                </div>

                <button
                  type="button"
                  className="btn-submit-pay"
                  style={{ marginTop: '14px' }}
                  onClick={handleProcessPayment}
                  disabled={processing}
                >
                  <Lock size={16} />
                  <span>
                    {processing
                      ? 'Authorizing Secure Payment...'
                      : `Pay ₹${Number(selectedResForPayment.totalPrice).toLocaleString('en-IN')} Securely`}
                  </span>
                </button>

                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setPayModalOpen(false)}
                    style={{ background: 'none', border: 'none', fontSize: '12.5px', color: 'var(--slate-500)', cursor: 'pointer', padding: '4px' }}
                  >
                    Cancel and Return
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* OFFICIAL RECEIPT MODAL */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        reservation={associatedReservation}
        payment={selectedPaymentForReceipt}
      />
    </div>
  );
}

export default function CustomerPaymentsPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--slate-500)' }}>Loading payment portal...</div>}>
      <PaymentsContent />
    </Suspense>
  );
}
