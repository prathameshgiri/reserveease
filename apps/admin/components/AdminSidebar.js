'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAdminAuth } from '../lib/auth-context';
import { useToast } from '../lib/toast-context';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CalendarDays,
  Clock,
  CreditCard,
  Settings,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import '../styles/sidebar.css';

export default function AdminSidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { adminUser, logout } = useAdminAuth();
  const { showToast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      showToast('Administrator logged out', 'info');
      router.push('/login');
    } catch (err) {
      showToast('Logout error', 'error');
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Services', href: '/services', icon: Briefcase },
    { name: 'Reservations', href: '/reservations', icon: CalendarDays },
    { name: 'Availability', href: '/availability', icon: Clock },
    { name: 'Payments', href: '/payments', icon: CreditCard },
    { name: 'Settings', href: '/settings', icon: Settings }
  ];

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-brand-box">
        <div className="sidebar-logo-icon">
          <ShieldCheck size={22} />
        </div>
        <div>
          <span className="sidebar-title">ReserveEase</span>
          <span className="sidebar-badge">Admin</span>
        </div>
      </div>

      <nav className="sidebar-menu-list">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        {adminUser && (
          <div className="sidebar-admin-info">
            <div className="admin-avatar">
              {adminUser.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="admin-text-details">
              <span className="admin-name-text">{adminUser.name}</span>
              <span className="admin-role-text">{adminUser.email}</span>
            </div>
          </div>
        )}

        <button className="btn-sidebar-logout" onClick={handleLogout}>
          <LogOut size={16} />
          <span>Exit Admin</span>
        </button>
      </div>
    </aside>
  );
}
