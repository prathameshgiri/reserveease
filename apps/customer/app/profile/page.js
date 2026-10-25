'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { useToast } from '../../lib/toast-context';
import { api } from '../../lib/api';
import {
  User,
  Shield,
  KeyRound,
  LogOut,
  Save,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import '../../styles/profile.css';

export default function CustomerProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, refreshUser } = useAuth();
  const { showToast } = useToast();

  // Profile form
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form
  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [changingPass, setChangingPass] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      setProfileData({
        name: user.name || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }, [user, authLoading, router]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileData.name.trim()) {
      showToast('Name is required', 'error');
      return;
    }

    try {
      setSavingProfile(true);
      const res = await api.put('/auth/profile', profileData);
      if (res.success) {
        showToast('Profile information updated successfully!', 'success');
        refreshUser();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!passData.currentPassword || !passData.newPassword) {
      showToast('Please fill all password fields', 'error');
      return;
    }

    if (passData.newPassword.length < 6) {
      showToast('New password must be at least 6 characters long', 'error');
      return;
    }

    if (passData.newPassword !== passData.confirmNewPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }

    try {
      setChangingPass(true);
      const res = await api.put('/auth/change-password', {
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword
      });

      if (res.success) {
        showToast('Password changed successfully!', 'success');
        setPassData({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: ''
        });
      }
    } catch (err) {
      showToast(err.message || 'Failed to change password. Check current password.', 'error');
    } finally {
      setChangingPass(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Logged out securely', 'info');
      router.push('/login');
    } catch (err) {
      showToast('Logout error', 'error');
    }
  };

  if (authLoading || !user) {
    return (
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '60px 24px', textAlign: 'center', color: 'var(--slate-500)' }}>
        Loading profile...
      </div>
    );
  }

  return (
    <div className="profile-page-container">
      <div className="profile-header">
        <h1 className="profile-title">Account & Security</h1>
        <p className="profile-subtitle">Manage personal information, contact credentials, and login security</p>
      </div>

      <div className="profile-layout-grid">
        {/* LEFT USER PROFILE SUMMARY CARD */}
        <div className="profile-user-card">
          <div className="profile-avatar-large">
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>

          <h2 className="profile-display-name">{user.name}</h2>
          <span className="profile-display-email">{user.email}</span>

          <span className="profile-role-badge">Verified Customer</span>

          <div className="profile-meta-list">
            <div className="profile-meta-item">
              <span>Account ID:</span>
              <strong>{user.id}</strong>
            </div>
            <div className="profile-meta-item">
              <span>Status:</span>
              <strong style={{ color: 'var(--success-dark)' }}>Active</strong>
            </div>
            <div className="profile-meta-item">
              <span>Role:</span>
              <strong>{user.role}</strong>
            </div>
          </div>

          <button className="btn-profile-logout" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Sign Out Securely</span>
          </button>
        </div>

        {/* RIGHT EDIT FORMS */}
        <div className="profile-forms-column">
          {/* PROFILE DETAILS */}
          <div className="form-panel-card">
            <h3 className="form-panel-title">
              <User size={18} color="var(--primary)" />
              <span>Personal Details</span>
            </h3>

            <form className="profile-form-grid" onSubmit={handleProfileSubmit}>
              <div className="profile-input-group">
                <label className="profile-label">Full Name</label>
                <input
                  type="text"
                  className="profile-input"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  required
                />
              </div>

              <div className="profile-input-group">
                <label className="profile-label">Email Address (Immutable)</label>
                <input
                  type="email"
                  className="profile-input"
                  value={user.email}
                  disabled
                />
              </div>

              <div className="profile-input-group">
                <label className="profile-label">Phone Number</label>
                <input
                  type="tel"
                  className="profile-input"
                  placeholder="+91 98220 12345"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                />
              </div>

              <div className="profile-input-group">
                <label className="profile-label">City / Address</label>
                <input
                  type="text"
                  className="profile-input"
                  placeholder="Street, City, State"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-save-profile" disabled={savingProfile}>
                <Save size={16} />
                <span>{savingProfile ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </form>
          </div>

          {/* CHANGE PASSWORD */}
          <div className="form-panel-card">
            <h3 className="form-panel-title">
              <KeyRound size={18} color="var(--primary)" />
              <span>Change Password</span>
            </h3>

            <form className="profile-form-grid" onSubmit={handlePasswordSubmit}>
              <div className="profile-input-group">
                <label className="profile-label">Current Password</label>
                <input
                  type="password"
                  className="profile-input"
                  placeholder="Enter current password"
                  value={passData.currentPassword}
                  onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                  required
                />
              </div>

              <div className="profile-input-group">
                <label className="profile-label">New Password (Min 6 characters)</label>
                <input
                  type="password"
                  className="profile-input"
                  placeholder="Enter new password"
                  value={passData.newPassword}
                  onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                  required
                />
              </div>

              <div className="profile-input-group">
                <label className="profile-label">Confirm New Password</label>
                <input
                  type="password"
                  className="profile-input"
                  placeholder="Re-enter new password"
                  value={passData.confirmNewPassword}
                  onChange={(e) => setPassData({ ...passData, confirmNewPassword: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn-save-profile" disabled={changingPass}>
                <Shield size={16} />
                <span>{changingPass ? 'Updating Password...' : 'Update Password'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
