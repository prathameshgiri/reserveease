'use client';
import React from 'react';
import Link from 'next/link';
import { Menu, ExternalLink, ShieldCheck } from 'lucide-react';
import '../styles/navbar.css';

export default function AdminNavbar({ onToggleSidebar, title = 'Administration Console' }) {
  return (
    <header className="admin-top-navbar">
      <div className="top-navbar-left">
        <button
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Sidebar"
        >
          <Menu size={20} />
        </button>
        <h2 className="top-navbar-title">{title}</h2>
      </div>

      <div className="top-navbar-right">
        <div className="badge-live-env">
          <span className="live-green-dot" />
          <span>API Connected (Port 5000)</span>
        </div>

        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          className="top-customer-portal-link"
        >
          <span>Customer Site</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </header>
  );
}
