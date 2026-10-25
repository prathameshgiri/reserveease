'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../lib/auth-context';
import { useToast } from '../../lib/toast-context';
import { api } from '../../lib/api';
import {
  Clock,
  Calendar,
  ShieldAlert,
  ShieldCheck,
  Users,
  CheckCircle2,
  X,
  AlertTriangle,
  Lock,
  Unlock
} from 'lucide-react';
import '../../styles/availability.css';

export default function AdminAvailabilityPage() {
  const router = useRouter();
  const { adminUser, loading: authLoading } = useAdminAuth();
  const { showToast } = useToast();

  const [services, setServices] = useState([]);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [availabilityData, setAvailabilityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [blocking, setBlocking] = useState(false);

  // Load services
  useEffect(() => {
    if (!authLoading && !adminUser) {
      router.push('/login');
      return;
    }

    async function loadServices() {
      try {
        const res = await api.get('/services');
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setServices(res.data);
          setSelectedServiceId(res.data[0].id);
        }
      } catch (err) {
        showToast('Failed to load services', 'error');
      }
    }

    if (adminUser) {
      loadServices();
    }
  }, [adminUser, authLoading, router, showToast]);

  // Load availability for selected service and date
  const loadAvailability = useCallback(async () => {
    if (!selectedServiceId || !selectedDate) return;

    try {
      setLoading(true);
      const res = await api.get(`/availability/check?serviceId=${selectedServiceId}&date=${selectedDate}`);
      if (res.success) {
        setAvailabilityData(res);
      }
    } catch (err) {
      showToast('Failed to calculate slot availability', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedServiceId, selectedDate, showToast]);

  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

  const selectedService = services.find(s => s.id === selectedServiceId);

  // Toggle Block/Unblock Date
  const handleToggleBlockDate = async (shouldBlock) => {
    try {
      setBlocking(true);
      const endpoint = shouldBlock ? '/availability/block' : '/availability/unblock';
      const res = await api.post(endpoint, {
        serviceId: selectedServiceId,
        date: selectedDate
      });

      if (res.success) {
        showToast(res.message, shouldBlock ? 'warning' : 'success');
        // Refresh local service blocked dates
        setServices(prev => prev.map(s => {
          if (s.id === selectedServiceId) {
            const blocked = new Set(s.blockedDates || []);
            if (shouldBlock) blocked.add(selectedDate);
            else blocked.delete(selectedDate);
            return { ...s, blockedDates: Array.from(blocked) };
          }
          return s;
        }));
        loadAvailability();
      }
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setBlocking(false);
    }
  };

  const handleUnblockSpecificDate = async (dateToUnblock) => {
    try {
      const res = await api.post('/availability/unblock', {
        serviceId: selectedServiceId,
        date: dateToUnblock
      });

      if (res.success) {
        showToast(res.message, 'success');
        setServices(prev => prev.map(s => {
          if (s.id === selectedServiceId) {
            return {
              ...s,
              blockedDates: (s.blockedDates || []).filter(d => d !== dateToUnblock)
            };
          }
          return s;
        }));
        if (dateToUnblock === selectedDate) {
          loadAvailability();
        }
      }
    } catch (err) {
      showToast('Failed to unblock date', 'error');
    }
  };

  const isCurrentDateBlocked = availabilityData?.isDateBlocked || false;
  const slots = availabilityData?.slots || [];
  const blockedDatesList = selectedService?.blockedDates || [];

  return (
    <div>
      <div className="avail-header">
        <h1 className="avail-title">Availability & Capacity Command</h1>
        <p className="avail-sub">Monitor live slot bookings, configure capacity boundaries, and lock unavailable dates</p>
      </div>

      {/* CONTROLS BAR */}
      <div className="avail-controls-bar">
        <div className="avail-select-group">
          <label className="avail-label">Amenity / Service</label>
          <select
            className="avail-select"
            value={selectedServiceId}
            onChange={(e) => setSelectedServiceId(e.target.value)}
          >
            {services.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} (Cap: {s.capacityPerSlot} per slot)
              </option>
            ))}
          </select>
        </div>

        <div className="avail-select-group">
          <label className="avail-label">Target Audit Date</label>
          <input
            type="date"
            className="avail-input"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      {/* STATUS BANNER */}
      <div className={`date-status-banner ${isCurrentDateBlocked ? 'blocked' : 'open'}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {isCurrentDateBlocked ? <Lock size={22} /> : <Unlock size={22} />}
          <div>
            <strong>{selectedDate} is {isCurrentDateBlocked ? 'BLOCKED' : 'OPEN FOR BOOKINGS'}</strong>
            <div style={{ fontSize: '13px', marginTop: '2px' }}>
              {isCurrentDateBlocked
                ? 'Customers cannot make reservations for this date across any time slots.'
                : 'Customers can book available slots based on remaining seat capacity.'}
            </div>
          </div>
        </div>

        <button
          className={`btn-toggle-block ${isCurrentDateBlocked ? 'unblock' : 'block'}`}
          onClick={() => handleToggleBlockDate(!isCurrentDateBlocked)}
          disabled={blocking}
        >
          {blocking
            ? 'Processing...'
            : isCurrentDateBlocked
            ? 'Unlock / Open Date'
            : 'Lock / Block Date'}
        </button>
      </div>

      {/* SLOTS CAPACITY GRID */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--slate-500)' }}>
          Auditing time slot capacities...
        </div>
      ) : isCurrentDateBlocked ? (
        <div style={{ padding: '40px', background: 'var(--white)', border: '1px dashed var(--slate-300)', borderRadius: 'var(--radius-xl)', textAlign: 'center', color: 'var(--slate-500)', marginBottom: '36px' }}>
          Date is currently locked. No active time slots are taking reservations.
        </div>
      ) : (
        <div className="slots-monitoring-grid">
          {slots.map(slotItem => {
            const booked = slotItem.bookedCount || 0;
            const total = slotItem.totalCapacity || 1;
            const percent = Math.min(100, Math.round((booked / total) * 100));
            const isFull = slotItem.remainingCapacity <= 0;

            return (
              <div key={slotItem.slot} className="slot-monitor-card">
                <div className="slot-time-header">
                  <span className="slot-time-title">{slotItem.slot}</span>
                  <span className={`slot-occupancy-pill ${isFull ? 'full' : 'available'}`}>
                    {isFull ? 'Sold Out' : 'Available'}
                  </span>
                </div>

                <div className="capacity-progress-bar-track">
                  <div
                    className={`capacity-progress-bar-fill ${isFull ? 'full' : ''}`}
                    style={{ width: `${percent}%` }}
                  />
                </div>

                <div className="slot-stats-text">
                  <span>Occupancy: {booked} / {total} seats</span>
                  <span>{slotItem.remainingCapacity} Left</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* BLOCKED DATES SUMMARY */}
      <div className="blocked-dates-panel">
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--navy-900)' }}>
          Blocked Dates for {selectedService?.name || 'Selected Amenity'}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--slate-500)', marginTop: '2px' }}>
          Dates where bookings are prohibited due to scheduled maintenance or exclusive corporate reservations:
        </p>

        {blockedDatesList.length === 0 ? (
          <div style={{ fontSize: '13px', color: 'var(--slate-400)', fontStyle: 'italic', marginTop: '12px' }}>
            No dates are currently blocked for this amenity.
          </div>
        ) : (
          <div className="blocked-dates-list">
            {blockedDatesList.map(bDate => (
              <div key={bDate} className="blocked-date-tag">
                <Calendar size={14} color="var(--primary)" />
                <span>{bDate}</span>
                <button
                  className="btn-remove-blocked-date"
                  onClick={() => handleUnblockSpecificDate(bDate)}
                  title="Unblock date"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
