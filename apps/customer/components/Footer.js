'use client';
import React from 'react';
import Link from 'next/link';
import { Sparkles, Mail, Phone, MapPin } from 'lucide-react';
import '../styles/footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div className="footer-brand-col">
            <div className="footer-brand">
              <div className="footer-logo-icon">
                <Sparkles size={20} />
              </div>
              <span>ReserveEase</span>
            </div>
            <p className="footer-brand-desc">
              Premium enterprise reservation and slot booking system designed for high-end workspace suites, hospitality dining, and wellness retreats.
            </p>
            <span className="footer-badge-mca">MCA College Project 2026</span>
          </div>

          <div>
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link href="/" className="footer-link">Home</Link></li>
              <li><Link href="/services" className="footer-link">Explore Services</Link></li>
              <li><Link href="/booking" className="footer-link">Book a Slot</Link></li>
              <li><Link href="/dashboard" className="footer-link">Customer Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Customer Portal</h4>
            <ul className="footer-links">
              <li><Link href="/reservations" className="footer-link">My Bookings</Link></li>
              <li><Link href="/payments" className="footer-link">Payment Records</Link></li>
              <li><Link href="/profile" className="footer-link">Profile & Security</Link></li>
              <li><Link href="/login" className="footer-link">Sign In</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-heading">Contact & Support</h4>
            <div className="footer-contact-info">
              <div className="contact-item">
                <Mail size={16} style={{ marginTop: '3px', flexShrink: 0, color: '#60a5fa' }} />
                <span>support@reserveease.com</span>
              </div>
              <div className="contact-item">
                <Phone size={16} style={{ marginTop: '3px', flexShrink: 0, color: '#60a5fa' }} />
                <span>+91 22 4589 1200</span>
              </div>
              <div className="contact-item">
                <MapPin size={16} style={{ marginTop: '3px', flexShrink: 0, color: '#60a5fa' }} />
                <span>401 Tech Park, Bandra Kurla Complex, Mumbai</span>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} ReserveEase Management System. All rights reserved.</p>
          <p>Built with Next.js, Node.js, Express & Local JSON Database</p>
        </div>
      </div>
    </footer>
  );
}
