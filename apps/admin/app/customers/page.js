'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../lib/auth-context';
import { useToast } from '../../lib/toast-context';
import { api } from '../../lib/api';
import Modal from '../../components/Modal';
import {
  Users,
  Search,
  Eye,
  UserCheck,
  UserX,
  Phone,
  Mail,
  MapPin,
  CalendarDays,
  CreditCard
} from 'lucide-react';
import '../../styles/customers.css';

export default function AdminCustomersPage() {
  const router = useRouter();
  const { adminUser, loading: authLoading } = useAdminAuth();
  const { showToast } = useToast();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Customer details modal
  const [selectedCust, setSelectedCust] = useState(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [custDetailsLoading, setCustDetailsLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const query = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const res = await api.get(`/customers${query}`);
      if (res.success && Array.isArray(res.data)) {
        setCustomers(res.data);
      }
    } catch (err) {
      showToast('Failed to load customers', 'error');
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
      fetchCustomers();
    }
  }, [adminUser, authLoading, router, fetchCustomers]);

  const handleToggleStatus = async (customer) => {
    try {
      const res = await api.put(`/customers/${customer.id}/status`, {});
      if (res.success) {
        showToast(res.message, 'success');
        fetchCustomers();
      }
    } catch (err) {
      showToast(err.message || 'Status toggle failed', 'error');
    }
  };

  const handleOpenDetails = async (customer) => {
    try {
      setCustDetailsLoading(true);
      setDetailsModalOpen(true);
      const res = await api.get(`/customers/${customer.id}`);
      if (res.success && res.data) {
        setSelectedCust(res.data);
      }
    } catch (err) {
      showToast('Failed to load customer profile history', 'error');
    } finally {
      setCustDetailsLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.trim().toLowerCase();
    return !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q));
  });

  return (
    <div>
      <div className="customers-page-header">
        <h1 className="customers-title">Customer Accounts Directory</h1>
        <p className="customers-subtitle">Manage customer profiles, access states, and transaction histories</p>
      </div>

      {/* CONTROLS */}
      <div className="customers-controls-bar">
        <div className="cust-search-wrapper">
          <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--slate-400)' }} />
          <input
            type="text"
            className="cust-search-input"
            placeholder="Search by name, email, or mobile number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="cust-filter-pills">
          {['all', 'active', 'inactive'].map(st => (
            <button
              key={st}
              className={`cust-pill-btn ${statusFilter === st ? 'active' : ''}`}
              onClick={() => setStatusFilter(st)}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="customers-table-card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--slate-500)' }}>
            Loading customer accounts...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--slate-400)' }}>
            No customer accounts found.
          </div>
        ) : (
          <div className="cust-table-responsive">
            <table className="cust-data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact Info</th>
                  <th>City / Address</th>
                  <th>Total Bookings</th>
                  <th>Total Spent (₹)</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map(cust => (
                  <tr key={cust.id}>
                    <td>
                      <div className="cust-avatar-cell">
                        <div className="cust-circle-avatar">
                          {cust.name ? cust.name.charAt(0).toUpperCase() : 'C'}
                        </div>
                        <div>
                          <div className="cust-name-cell">{cust.name}</div>
                          <div style={{ fontSize: '11px', color: 'var(--slate-400)' }}>ID: {cust.id}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '13px' }}>
                        <span>{cust.email}</span>
                        <span style={{ color: 'var(--slate-500)', fontSize: '12px' }}>{cust.phone}</span>
                      </div>
                    </td>

                    <td style={{ fontSize: '13px', color: 'var(--slate-600)' }}>
                      {cust.address}
                    </td>

                    <td><strong>{cust.totalBookings}</strong></td>

                    <td><strong>₹{Number(cust.totalSpent || 0).toLocaleString('en-IN')}</strong></td>

                    <td>
                      <span className={`cust-status-badge ${cust.status}`}>
                        {cust.status}
                      </span>
                    </td>

                    <td>
                      <div className="cust-actions-group">
                        <button
                          className="btn-cust-action"
                          onClick={() => handleOpenDetails(cust)}
                          title="View Details & History"
                        >
                          <Eye size={14} />
                          <span>History</span>
                        </button>

                        <button
                          className={`btn-cust-action ${cust.status === 'active' ? 'deactivate' : 'activate'}`}
                          onClick={() => handleToggleStatus(cust)}
                        >
                          {cust.status === 'active' ? (
                            <>
                              <UserX size={14} />
                              <span>Deactivate</span>
                            </>
                          ) : (
                            <>
                              <UserCheck size={14} />
                              <span>Activate</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CUSTOMER DETAILS MODAL */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Customer Details & Reservation Record"
        maxWidth="680px"
      >
        {custDetailsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--slate-500)' }}>
            Loading customer history...
          </div>
        ) : selectedCust && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--slate-50)', padding: '16px', borderRadius: 'var(--radius-lg)' }}>
              <div className="cust-circle-avatar" style={{ width: '48px', height: '48px', fontSize: '18px' }}>
                {selectedCust.name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--navy-900)' }}>{selectedCust.name}</div>
                <div style={{ color: 'var(--slate-500)', fontSize: '13px' }}>{selectedCust.email} • {selectedCust.phone}</div>
                <div style={{ color: 'var(--slate-400)', fontSize: '12px', marginTop: '2px' }}>Address: {selectedCust.address}</div>
              </div>
              <span className={`cust-status-badge ${selectedCust.status}`}>
                {selectedCust.status}
              </span>
            </div>

            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '10px' }}>
                Booking History ({selectedCust.reservations?.length || 0})
              </h4>

              {(!selectedCust.reservations || selectedCust.reservations.length === 0) ? (
                <div style={{ color: 'var(--slate-400)', fontStyle: 'italic', padding: '10px 0' }}>
                  No bookings found for this customer.
                </div>
              ) : (
                <div style={{ maxHeight: '240px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedCust.reservations.map(res => (
                    <div key={res.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--slate-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--slate-200)', fontSize: '13px' }}>
                      <div>
                        <strong>{res.serviceName}</strong> (Ref: {res.bookingId})
                        <div style={{ color: 'var(--slate-500)', fontSize: '12px' }}>
                          {res.date} • {res.timeSlot}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div><strong>₹{Number(res.totalPrice).toLocaleString('en-IN')}</strong></div>
                        <span style={{ fontSize: '11px', textTransform: 'capitalize', color: res.status === 'confirmed' ? 'var(--success-dark)' : 'var(--slate-500)' }}>
                          {res.status} ({res.paymentStatus})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
