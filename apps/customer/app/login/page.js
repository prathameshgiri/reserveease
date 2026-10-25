'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { useToast } from '../../lib/toast-context';
import { Mail, Lock, LogIn, ArrowRight, Sparkles } from 'lucide-react';
import '../../styles/login.css';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    email: 'rohit@example.com',
    password: 'Customer@123'
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await login(formData.email, formData.password);
      showToast('Welcome back! Login successful.', 'success');
      router.push('/dashboard');
    } catch (err) {
      showToast(err.message || 'Login failed. Please check credentials.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <LogIn size={26} />
          </div>
          <h1 className="auth-title">Customer Sign In</h1>
          <p className="auth-subtitle">Access your reservations, bookings, and payment receipts</p>
        </div>

        <div className="demo-account-hint">
          <strong>Pre-filled Demo Customer:</strong><br />
          Email: <code>rohit@example.com</code><br />
          Password: <code>Customer@123</code>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                className="form-input"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                className="form-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-auth-submit" disabled={submitting}>
            {submitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to ReserveEase</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account yet?
          <Link href="/register" className="auth-footer-link">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
