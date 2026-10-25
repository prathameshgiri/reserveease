'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '../../lib/auth-context';
import { useToast } from '../../lib/toast-context';
import { ShieldCheck, Mail, Lock, ArrowRight, ShieldAlert } from 'lucide-react';
import '../../styles/admin-login.css';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAdminAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    email: 'admin@reserveease.com',
    password: 'Admin@123'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      showToast('Admin email and password required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await login(formData.email, formData.password);
      showToast('Welcome, Administrator. Access granted.', 'success');
      router.push('/dashboard');
    } catch (err) {
      showToast(err.message || 'Authentication failed. Administrator access only.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-shield-icon">
            <ShieldCheck size={32} />
          </div>
          <h1 className="admin-login-title">Administrator Portal</h1>
          <p className="admin-login-sub">Authorized Operations & Reservation Control Center</p>
        </div>

        <div className="admin-demo-creds">
          <strong>Default Seed Admin Credentials:</strong><br />
          Email: <code>admin@reserveease.com</code><br />
          Password: <code>Admin@123</code>
        </div>

        <form className="admin-login-form" onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label className="admin-form-label">Administrator Email</label>
            <div className="admin-input-wrapper">
              <Mail size={17} className="admin-input-icon" />
              <input
                type="email"
                className="admin-form-input"
                placeholder="admin@reserveease.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Security Password</label>
            <div className="admin-input-wrapper">
              <Lock size={17} className="admin-input-icon" />
              <input
                type="password"
                className="admin-form-input"
                placeholder="Enter admin password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-admin-submit" disabled={submitting}>
            {submitting ? (
              <span>Verifying Admin Authorization...</span>
            ) : (
              <>
                <span>Access Management Console</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p className="admin-security-note">
          🔒 Restricted Area. All administrative actions and logins are logged to audit logs.
        </p>
      </div>
    </div>
  );
}
