'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../lib/auth-context';
import { useToast } from '../../lib/toast-context';
import { api } from '../../lib/api';
import {
  Settings,
  Save,
  Shield,
  Clock,
  IndianRupee,
  Phone,
  Mail,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import '../../styles/settings.css';

export default function AdminSettingsPage() {
  const router = useRouter();
  const { adminUser, loading: authLoading } = useAdminAuth();
  const { showToast } = useToast();

  const [settings, setSettings] = useState({
    appName: 'ReserveEase',
    tagline: '',
    currency: 'INR',
    currencySymbol: '₹',
    taxRatePercent: 18,
    contactEmail: '',
    contactPhone: '',
    address: '',
    cancellationMinHours: 24,
    maxBookingsPerCustomerPerDay: 4,
    allowInstantConfirmation: true
  });

  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !adminUser) {
      router.push('/login');
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        const [settingsRes, logsRes] = await Promise.all([
          api.get('/settings'),
          api.get('/settings/audit-logs')
        ]);

        if (settingsRes.success && settingsRes.data) {
          setSettings(settingsRes.data);
        }
        if (logsRes.success && Array.isArray(logsRes.data)) {
          setAuditLogs(logsRes.data);
        }
      } catch (err) {
        showToast('Failed to load system settings', 'error');
      } finally {
        setLoading(false);
      }
    }

    if (adminUser) {
      loadData();
    }
  }, [adminUser, authLoading, router, showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      const res = await api.put('/settings', settings);
      if (res.success) {
        showToast('System configuration successfully updated and saved to settings.json!', 'success');
        // Refresh audit logs
        const logsRes = await api.get('/settings/audit-logs');
        if (logsRes.success && Array.isArray(logsRes.data)) {
          setAuditLogs(logsRes.data);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--slate-500)' }}>
        Loading system configuration parameters...
      </div>
    );
  }

  return (
    <div>
      <div className="settings-header">
        <h1 className="settings-title">System Configuration & Governance</h1>
        <p className="settings-sub">Tune booking limitations, fiscal tax rates, and review immutable audit logs</p>
      </div>

      <div className="settings-layout-grid">
        {/* CONFIG FORM */}
        <div className="settings-card">
          <h2 className="settings-card-title">
            <Settings size={20} color="var(--primary)" />
            <span>Operational System Parameters</span>
          </h2>

          <form className="settings-form" onSubmit={handleSubmit}>
            <div className="settings-row-2col">
              <div className="settings-field">
                <label className="settings-label">Application Name</label>
                <input
                  type="text"
                  className="settings-input"
                  value={settings.appName || ''}
                  onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                  required
                />
              </div>

              <div className="settings-field">
                <label className="settings-label">Currency Symbol / Code</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '8px' }}>
                  <input
                    type="text"
                    className="settings-input"
                    value={settings.currencySymbol || '₹'}
                    onChange={(e) => setSettings({ ...settings, currencySymbol: e.target.value })}
                    required
                  />
                  <input
                    type="text"
                    className="settings-input"
                    value={settings.currency || 'INR'}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="settings-row-2col">
              <div className="settings-field">
                <label className="settings-label">Goods & Services Tax (GST %)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  className="settings-input"
                  value={settings.taxRatePercent || 18}
                  onChange={(e) => setSettings({ ...settings, taxRatePercent: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="settings-field">
                <label className="settings-label">Min Hours Prior Notice to Cancel</label>
                <input
                  type="number"
                  min="0"
                  className="settings-input"
                  value={settings.cancellationMinHours || 24}
                  onChange={(e) => setSettings({ ...settings, cancellationMinHours: Number(e.target.value) })}
                  required
                />
              </div>
            </div>

            <div className="settings-row-2col">
              <div className="settings-field">
                <label className="settings-label">Max Bookings Per Customer Per Day</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  className="settings-input"
                  value={settings.maxBookingsPerCustomerPerDay || 4}
                  onChange={(e) => setSettings({ ...settings, maxBookingsPerCustomerPerDay: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="settings-field">
                <label className="settings-label">Contact Support Email</label>
                <input
                  type="email"
                  className="settings-input"
                  value={settings.contactEmail || ''}
                  onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="settings-row-2col">
              <div className="settings-field">
                <label className="settings-label">Contact Helpline Phone</label>
                <input
                  type="text"
                  className="settings-input"
                  value={settings.contactPhone || ''}
                  onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                />
              </div>

              <div className="settings-field">
                <label className="settings-label">Physical Facility Address</label>
                <input
                  type="text"
                  className="settings-input"
                  value={settings.address || ''}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                />
              </div>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="instantConf"
                checked={Boolean(settings.allowInstantConfirmation)}
                onChange={(e) => setSettings({ ...settings, allowInstantConfirmation: e.target.checked })}
              />
              <label htmlFor="instantConf" style={{ fontSize: '13px', fontWeight: 600, color: 'var(--navy-900)', cursor: 'pointer' }}>
                Allow Instant Booking Confirmation (If unchecked, new customer bookings require manual administrator approval)
              </label>
            </div>

            <button type="submit" className="btn-save-settings" disabled={saving}>
              <Save size={16} />
              <span>{saving ? 'Writing to settings.json...' : 'Save Configuration Changes'}</span>
            </button>
          </form>
        </div>

        {/* AUDIT LOGS INSPECTOR */}
        <div className="audit-logs-card">
          <h3 className="settings-card-title">
            <Shield size={18} color="var(--primary)" />
            <span>Audit Trail Log</span>
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--slate-500)' }}>
            Chronological record of system modifications stored in auditLogs.json:
          </p>

          <div className="logs-scroll-container">
            {auditLogs.map(log => (
              <div key={log.id} className="audit-item">
                <div className="audit-action-tag">
                  <span>{log.action}</span>
                  <span style={{ fontSize: '11px', color: 'var(--slate-400)' }}>{log.actorRole.toUpperCase()}</span>
                </div>
                <div className="audit-detail-text">{log.details}</div>
                <div className="audit-time-text">
                  {new Date(log.timestamp).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })} • By {log.actorName}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
