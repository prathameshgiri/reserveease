'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { useToast } from '../lib/toast-context';
import {
  CalendarDays,
  User,
  LayoutDashboard,
  CreditCard,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Compass,
  Building2
} from 'lucide-react';
import '../styles/navbar.css';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Logged out successfully', 'info');
      setDropdownOpen(false);
      router.push('/login');
    } catch (err) {
      showToast('Logout failed', 'error');
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-brand">
          <div className="navbar-logo-icon">
            <Sparkles size={22} />
          </div>
          <span>Reserve<span className="navbar-brand-accent">Ease</span></span>
        </Link>

        {/* Mobile menu toggle */}
        <button
          className="mobile-nav-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Navigation links with pill container */}
        <nav className={`navbar-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <Link
            href="/"
            className={`nav-link ${pathname === '/' ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Sparkles size={14} />
            <span>Home</span>
          </Link>
          <Link
            href="/services"
            className={`nav-link ${pathname === '/services' ? 'active' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Compass size={14} />
            <span>Amenities</span>
          </Link>
          {user && (
            <>
              <Link
                href="/dashboard"
                className={`nav-link ${pathname === '/dashboard' ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard size={14} />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/reservations"
                className={`nav-link ${pathname === '/reservations' ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <CalendarDays size={14} />
                <span>My Bookings</span>
              </Link>
              <Link
                href="/payments"
                className={`nav-link ${pathname === '/payments' ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <CreditCard size={14} />
                <span>Billing</span>
              </Link>
            </>
          )}
        </nav>

        {/* Live booking indicator on desktop */}
        <div className="nav-live-status" style={{ display: mobileMenuOpen ? 'none' : 'flex' }}>
          <span className="nav-pulse-dot" />
          <span>Live Slot Engine</span>
        </div>

        {/* Actions */}
        <div className="navbar-actions">
          {user ? (
            <div className="user-dropdown">
              <button
                className="user-badge"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                aria-expanded={dropdownOpen}
              >
                <div className="user-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="user-name">{user.name || user.email}</span>
                <ChevronDown size={14} style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              {dropdownOpen && (
                <div className="dropdown-menu">
                  <Link
                    href="/dashboard"
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    href="/reservations"
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <CalendarDays size={16} />
                    <span>My Bookings</span>
                  </Link>
                  <Link
                    href="/payments"
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <CreditCard size={16} />
                    <span>Invoices & Billing</span>
                  </Link>
                  <Link
                    href="/profile"
                    className="dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User size={16} />
                    <span>Account Profile</span>
                  </Link>
                  <div className="dropdown-divider" />
                  <button
                    className="dropdown-item danger"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link href="/login" className="btn-nav-login">
                Sign In
              </Link>
              <Link href="/booking" className="btn-nav-primary">
                <span>Book Now</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
