'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../lib/auth-context';
import { useToast } from '../../lib/toast-context';
import { api } from '../../lib/api';
import Modal from '../../components/Modal';
import {
  Briefcase,
  PlusCircle,
  Edit,
  Power,
  Users,
  Clock,
  IndianRupee,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import '../../styles/admin-services.css';

export default function AdminServicesPage() {
  const router = useRouter();
  const { adminUser, loading: authLoading } = useAdminAuth();
  const { showToast } = useToast();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentServiceId, setCurrentServiceId] = useState(null);

  const initialForm = {
    name: '',
    category: 'Workspace & Meeting',
    description: '',
    price: '',
    durationMinutes: 60,
    capacityPerSlot: 4,
    imageUrl: '',
    status: 'active',
    availableSlotsText: '09:00 - 10:00, 10:30 - 11:30, 12:00 - 13:00, 14:00 - 15:00, 15:30 - 16:30, 17:00 - 18:00'
  };

  const [formData, setFormData] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/services?includeInactive=true');
      if (res.success && Array.isArray(res.data)) {
        setServices(res.data);
      }
    } catch (err) {
      showToast('Failed to load services', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (!authLoading && !adminUser) {
      router.push('/login');
      return;
    }
    if (adminUser) {
      fetchServices();
    }
  }, [adminUser, authLoading, router, fetchServices]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentServiceId(null);
    setFormData(initialForm);
    setModalOpen(true);
  };

  const handleOpenEdit = (service) => {
    setIsEditing(true);
    setCurrentServiceId(service.id);
    setFormData({
      name: service.name,
      category: service.category,
      description: service.description,
      price: service.price,
      durationMinutes: service.durationMinutes,
      capacityPerSlot: service.capacityPerSlot,
      imageUrl: service.imageUrl || '',
      status: service.status || 'active',
      availableSlotsText: (service.availableSlots || []).join(', ')
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      showToast('Name and price are required', 'error');
      return;
    }

    const availableSlots = formData.availableSlotsText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      name: formData.name,
      category: formData.category,
      description: formData.description,
      price: Number(formData.price),
      durationMinutes: Number(formData.durationMinutes),
      capacityPerSlot: Number(formData.capacityPerSlot),
      imageUrl: formData.imageUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      status: formData.status,
      availableSlots
    };

    try {
      setSubmitting(true);
      if (isEditing) {
        await api.put(`/services/${currentServiceId}`, payload);
        showToast('Service updated successfully!', 'success');
      } else {
        await api.post('/services', payload);
        showToast('New service created successfully!', 'success');
      }
      setModalOpen(false);
      fetchServices();
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (service) => {
    try {
      const res = await api.delete(`/services/${service.id}`);
      if (res.success) {
        showToast(res.message, 'info');
        fetchServices();
      }
    } catch (err) {
      showToast('Failed to toggle service status', 'error');
    }
  };

  return (
    <div>
      <div className="admin-services-header">
        <div>
          <h1 className="admin-services-title">Services & Amenity Catalogue</h1>
          <p className="admin-services-sub">Add, modify, and configure capacity and available slots for all bookable amenities</p>
        </div>

        <button className="btn-add-service-cta" onClick={handleOpenAdd}>
          <PlusCircle size={18} />
          <span>Add New Service</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--slate-500)' }}>
          Loading services catalogue...
        </div>
      ) : (
        <div className="admin-services-grid">
          {services.map(srv => (
            <div key={srv.id} className={`admin-srv-card ${srv.status === 'inactive' ? 'inactive' : ''}`}>
              <div className="admin-srv-img-wrapper">
                <img
                  src={srv.imageUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80'}
                  alt={srv.name}
                  className="admin-srv-img"
                />
                <span className="admin-srv-badge">{srv.category}</span>
                <span className={`admin-srv-status-tag ${srv.status}`}>
                  {srv.status}
                </span>
              </div>

              <div className="admin-srv-body">
                <h3 className="admin-srv-name">{srv.name}</h3>
                <p className="admin-srv-desc">{srv.description}</p>

                <div className="admin-srv-stats-row">
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: 600 }}>Rate</span>
                    <div className="admin-srv-price">₹{Number(srv.price).toLocaleString('en-IN')}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: 600 }}>Capacity</span>
                    <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{srv.capacityPerSlot} per slot</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '11px', color: 'var(--slate-400)', textTransform: 'uppercase', fontWeight: 600 }}>Duration</span>
                    <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{srv.durationMinutes} min</div>
                  </div>
                </div>

                <div className="admin-srv-actions">
                  <span style={{ fontSize: '12px', color: 'var(--slate-500)' }}>
                    {srv.availableSlots?.length || 0} time slots
                  </span>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      className="btn-srv-icon-btn"
                      onClick={() => handleOpenEdit(srv)}
                    >
                      <Edit size={14} />
                      <span>Edit</span>
                    </button>

                    <button
                      className={`btn-srv-icon-btn ${srv.status === 'active' ? 'toggle' : ''}`}
                      onClick={() => handleToggleStatus(srv)}
                    >
                      <Power size={14} />
                      <span>{srv.status === 'active' ? 'Deactivate' : 'Activate'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Amenity Details' : 'Add New Amenity to Directory'}
        maxWidth="650px"
        footer={
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-srv-icon-btn" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button
              className="btn-add-service-cta"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? 'Saving Service...' : (isEditing ? 'Save Changes' : 'Create Amenity')}
            </button>
          </div>
        }
      >
        <form className="service-form" onSubmit={handleSubmit}>
          <div className="srv-input-group">
            <label className="srv-label">Service / Amenity Name</label>
            <input
              type="text"
              className="srv-input"
              placeholder="e.g. Executive Boardroom Suite"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-grid-2col">
            <div className="srv-input-group">
              <label className="srv-label">Category</label>
              <select
                className="srv-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Workspace & Meeting">Workspace & Meeting</option>
                <option value="Health & Wellness">Health & Wellness</option>
                <option value="Dining & Hospitality">Dining & Hospitality</option>
                <option value="Creative Studio">Creative Studio</option>
              </select>
            </div>

            <div className="srv-input-group">
              <label className="srv-label">Base Price (₹ per slot)</label>
              <input
                type="number"
                min="0"
                className="srv-input"
                placeholder="2500"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-grid-2col">
            <div className="srv-input-group">
              <label className="srv-label">Slot Capacity (Max guests per slot)</label>
              <input
                type="number"
                min="1"
                className="srv-input"
                value={formData.capacityPerSlot}
                onChange={(e) => setFormData({ ...formData, capacityPerSlot: e.target.value })}
                required
              />
            </div>

            <div className="srv-input-group">
              <label className="srv-label">Duration (Minutes)</label>
              <input
                type="number"
                min="15"
                step="15"
                className="srv-input"
                value={formData.durationMinutes}
                onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="srv-input-group">
            <label className="srv-label">Description</label>
            <textarea
              className="srv-textarea"
              rows={3}
              placeholder="Detailed description of features, amenities, and setup..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="srv-input-group">
            <label className="srv-label">Image URL</label>
            <input
              type="url"
              className="srv-input"
              placeholder="https://images.unsplash.com/..."
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          </div>

          <div className="srv-input-group">
            <label className="srv-label">Available Time Slots (Comma-separated)</label>
            <input
              type="text"
              className="srv-input"
              placeholder="09:00 - 10:00, 10:30 - 11:30, 14:00 - 15:00"
              value={formData.availableSlotsText}
              onChange={(e) => setFormData({ ...formData, availableSlotsText: e.target.value })}
            />
          </div>

          <div className="srv-input-group">
            <label className="srv-label">Initial Status</label>
            <select
              className="srv-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="active">Active (Visible to customers)</option>
              <option value="inactive">Inactive (Hidden from customers)</option>
            </select>
          </div>
        </form>
      </Modal>
    </div>
  );
}
