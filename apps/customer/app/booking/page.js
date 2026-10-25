'use client';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { useToast } from '../../lib/toast-context';
import { api } from '../../lib/api';
import {
  CalendarCheck,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  CalendarDays,
  FileText,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import '../../styles/booking.css';

function BookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialServiceId = searchParams ? (searchParams.get('serviceId') || '') : '';

  const { user } = useAuth();
  const { showToast } = useToast();

  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState(initialServiceId);
  const [selectedDate, setSelectedDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const [slotsAvailability, setSlotsAvailability] = useState([]);
  const [checkingSlots, setCheckingSlots] = useState(false);
  const [isDateBlocked, setIsDateBlocked] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);

  // Load services
  useEffect(() => {
    async function loadServices() {
      try {
        const res = await api.get('/services');
        if (res.success && Array.isArray(res.data)) {
          setServices(res.data);
          if (!selectedServiceId && res.data.length > 0) {
            setSelectedServiceId(res.data[0].id);
          }
        }
      } catch (err) {
        showToast('Failed to load services', 'error');
      }
    }
    loadServices();
  }, [selectedServiceId, showToast]);

  const selectedService = services.find(s => s.id === selectedServiceId);

  // Fetch slot availability whenever serviceId, date, or quantity changes
  useEffect(() => {
    if (!selectedServiceId || !selectedDate) return;

    let isMounted = true;
    async function checkAvailability() {
      try {
        setCheckingSlots(true);
        const res = await api.get(`/availability/check?serviceId=${selectedServiceId}&date=${selectedDate}&quantity=${quantity}`);
        if (!isMounted) return;

        if (res.isDateBlocked) {
          setIsDateBlocked(true);
          setSlotsAvailability([]);
          setSelectedSlot('');
        } else {
          setIsDateBlocked(false);
          setSlotsAvailability(res.slots || []);
          const currentSlotValid = res.slots?.find(s => s.slot === selectedSlot && s.isAvailable);
          if (!currentSlotValid) {
            const firstAvailable = res.slots?.find(s => s.isAvailable);
            setSelectedSlot(firstAvailable ? firstAvailable.slot : '');
          }
        }
      } catch (err) {
        if (isMounted) {
          setIsDateBlocked(false);
          setSlotsAvailability([]);
        }
      } finally {
        if (isMounted) setCheckingSlots(false);
      }
    }

    checkAvailability();
    return () => { isMounted = false; };
  }, [selectedServiceId, selectedDate, quantity, selectedSlot]);

  // Price calculations
  const unitPrice = selectedService ? Number(selectedService.price) : 0;
  const subtotal = unitPrice * Number(quantity);
  const taxRate = 18;
  const taxAmount = Math.round((subtotal * taxRate) / 100);
  const totalPrice = subtotal + taxAmount;

  // Handle booking form submission
  const handleBookingSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      showToast('Please log in to complete your reservation', 'warning');
      router.push(`/login?redirect=/booking?serviceId=${selectedServiceId}`);
      return;
    }

    if (!selectedServiceId || !selectedDate || !selectedSlot) {
      showToast('Please select a service, date, and available time slot', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/reservations', {
        serviceId: selectedServiceId,
        date: selectedDate,
        timeSlot: selectedSlot,
        quantity: Number(quantity),
        specialInstructions
      });

      if (res.success && res.data) {
        setCreatedBooking(res.data);
        showToast('Reservation confirmed successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Booking failed. Capacity might be full.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  if (createdBooking) {
    return (
      <div className="booking-page-container">
        <div className="booking-success-box">
          <div className="success-icon-badge">
            <CheckCircle2 size={36} />
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--navy-900)' }}>
            Reservation Confirmed!
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--slate-500)', marginTop: '8px' }}>
            Your slot has been reserved in our system. An official reference has been generated:
          </p>

          <div className="success-booking-id">
            Booking ID: {createdBooking.bookingId}
          </div>

          <div style={{ textAlign: 'left', background: 'var(--slate-50)', padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '28px', border: '1px solid var(--slate-200)', fontSize: '14px', lineHeight: 1.6 }}>
            <div><strong>Amenity:</strong> {createdBooking.serviceName}</div>
            <div><strong>Scheduled:</strong> {createdBooking.date} ({createdBooking.timeSlot})</div>
            <div><strong>Guests / Quantity:</strong> {createdBooking.quantity}</div>
            <div><strong>Amount Due:</strong> ₹{Number(createdBooking.totalPrice).toLocaleString('en-IN')} ({createdBooking.paymentStatus.toUpperCase()})</div>
          </div>

          <div className="success-actions">
            <Link
              href={`/payments?reservationId=${createdBooking.id}`}
              className="btn-confirm-booking"
              style={{ textDecoration: 'none' }}
            >
              <CreditCard size={18} />
              <span>Complete Demo Payment</span>
            </Link>

            <Link
              href="/reservations"
              className="btn-hero-secondary"
              style={{ background: 'var(--slate-100)', color: 'var(--navy-900)', border: '1px solid var(--slate-300)' }}
            >
              <CalendarDays size={18} />
              <span>View in My Reservations</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page-container">
      <div className="booking-page-header">
        <span className="booking-header-tag">Live Slot Booking</span>
        <h1 className="booking-header-title">Reserve Your Time Slot</h1>
        <p className="booking-header-sub">
          Verify real-time capacity and secure your appointment with immediate confirmation.
        </p>
      </div>

      <div className="booking-layout-grid">
        <form className="booking-form-card" onSubmit={handleBookingSubmit}>
          <div className="form-section-title">
            <div className="step-indicator">1</div>
            <span>Select Amenity or Service</span>
          </div>

          <div className="booking-field-group">
            <label className="booking-label">Choose Service</label>
            <select
              className="booking-select"
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              required
            >
              {services.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} — ₹{Number(s.price).toLocaleString('en-IN')} / slot ({s.category})
                </option>
              ))}
            </select>
          </div>

          <div className="form-section-title">
            <div className="step-indicator">2</div>
            <span>Select Date & Quantity</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="booking-field-group">
              <label className="booking-label">Reservation Date</label>
              <input
                type="date"
                className="booking-input"
                min={todayStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                required
              />
            </div>

            <div className="booking-field-group">
              <label className="booking-label">Quantity / Guests</label>
              <input
                type="number"
                min="1"
                max={selectedService?.capacityPerSlot || 10}
                className="booking-input"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                required
              />
            </div>
          </div>

          <div className="form-section-title">
            <div className="step-indicator">3</div>
            <span>Choose Available Slot</span>
          </div>

          <div className="booking-field-group">
            <label className="booking-label">
              Time Slots for {selectedDate}
              {checkingSlots && <span style={{ color: 'var(--slate-400)', fontWeight: 400, marginLeft: '8px' }}>(Checking capacity...)</span>}
            </label>

            {isDateBlocked ? (
              <div style={{ padding: '16px', background: 'var(--danger-light)', color: 'var(--danger-dark)', borderRadius: 'var(--radius-md)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertCircle size={18} />
                <span>This date is completely blocked by administration. Please select another date.</span>
              </div>
            ) : slotsAvailability.length === 0 ? (
              <div style={{ padding: '16px', background: 'var(--slate-50)', color: 'var(--slate-500)', borderRadius: 'var(--radius-md)', fontSize: '14px' }}>
                No time slots available for this service on this date.
              </div>
            ) : (
              <div className="slots-container">
                {slotsAvailability.map(item => {
                  const isSelected = selectedSlot === item.slot;
                  const isAvailable = item.isAvailable;

                  return (
                    <button
                      key={item.slot}
                      type="button"
                      className={`slot-btn ${isSelected ? 'selected' : ''}`}
                      disabled={!isAvailable}
                      onClick={() => setSelectedSlot(item.slot)}
                    >
                      <div className="slot-time">{item.slot}</div>
                      <div className={`slot-capacity-status ${isAvailable ? 'available' : 'full'}`}>
                        {isAvailable ? `${item.remainingCapacity} seat(s) remaining` : 'Fully Booked'}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="form-section-title">
            <div className="step-indicator">4</div>
            <span>Optional Instructions</span>
          </div>

          <div className="booking-field-group">
            <label className="booking-label">Special Requests or Setup Notes</label>
            <textarea
              className="booking-textarea"
              placeholder="e.g., Apple Airplay required, extra mineral water, projector arrangement..."
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="btn-confirm-booking"
            disabled={submitting || isDateBlocked || !selectedSlot}
          >
            {submitting ? (
              <span>Securing your slot...</span>
            ) : (
              <>
                <CalendarCheck size={18} />
                <span>Confirm & Lock Reservation</span>
              </>
            )}
          </button>
        </form>

        <div className="booking-summary-card">
          <h3 className="summary-title">Booking Summary</h3>

          {selectedService && (
            <div className="selected-service-preview">
              <img
                src={selectedService.imageUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=80'}
                alt={selectedService.name}
                className="preview-thumbnail"
              />
              <div className="preview-info">
                <span className="preview-name">{selectedService.name}</span>
                <span className="preview-category">{selectedService.category}</span>
                <span style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 700, marginTop: '4px' }}>
                  ₹{Number(selectedService.price).toLocaleString('en-IN')} / slot
                </span>
              </div>
            </div>
          )}

          <div className="summary-rows-group">
            <div className="summary-row">
              <span>Date:</span>
              <strong>{selectedDate || 'Select a date'}</strong>
            </div>

            <div className="summary-row">
              <span>Time Slot:</span>
              <strong>{selectedSlot || 'Select slot'}</strong>
            </div>

            <div className="summary-row">
              <span>Quantity:</span>
              <strong>{quantity}</strong>
            </div>

            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>

            <div className="summary-row">
              <span>GST Taxes (18%):</span>
              <span>₹{taxAmount.toLocaleString('en-IN')}</span>
            </div>

            <div className="summary-row total">
              <span>Total Price:</span>
              <span>₹{totalPrice.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <p className="guarantee-note">
            🔒 Live capacity verified before booking. Zero double-booking guarantee.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--slate-500)' }}>Loading booking console...</div>}>
      <BookingContent />
    </Suspense>
  );
}
