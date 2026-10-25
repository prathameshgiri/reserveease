'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '../lib/api';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CalendarCheck,
  Clock,
  Users,
  CheckCircle2,
  Building2,
  HeartPulse,
  UtensilsCrossed,
  Camera,
  ChevronDown,
  Star,
  Zap,
  Award,
  Headphones,
  Compass,
  CreditCard
} from 'lucide-react';
import '../styles/home.css';

export default function HomePage() {
  const [featuredServices, setFeaturedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    async function loadServices() {
      try {
        const res = await api.get('/services');
        if (res.success && Array.isArray(res.data)) {
          setFeaturedServices(res.data.slice(0, 6));
        }
      } catch (err) {
        console.error('Failed to load featured services:', err);
      } finally {
        setLoading(false);
      }
    }
    loadServices();
  }, []);

  const faqs = [
    {
      q: 'How does real-time capacity and slot locking prevent double-booking?',
      a: 'ReserveEase implements an atomic write-lock mutex mechanism. Whenever you select an available time slot and proceed to checkout, that slot is instantly checked and temporarily reserved against live database records. No two customers can ever reserve the same slot simultaneously.'
    },
    {
      q: 'Can I reschedule or cancel my reserved appointment?',
      a: 'Yes, absolutely. Customers can visit their "My Bookings" dashboard at any time to reschedule an upcoming slot or cancel a reservation. Real-time availability updates immediately, returning slot capacity to the public booking matrix.'
    },
    {
      q: 'What payment methods are supported on the checkout gateway?',
      a: 'Our secure gateway supports Indian UPI apps (Google Pay, PhonePe, Paytm, BHIM), major Credit & Debit cards (Visa, MasterCard, RuPay), and Direct Net Banking for all leading banks including HDFC, ICICI, SBI, and Axis Bank.'
    },
    {
      q: 'Do I get an official printable tax invoice for my booking?',
      a: 'Yes! Upon successful booking confirmation and payment settlement, an official computerized tax receipt is generated instantly with your unique Booking Reference (e.g. BK-XXXXX), itemized GST breakdown, and digital verification seal.'
    }
  ];

  return (
    <div>
      {/* HERO SECTION */}
      <section className="hero-section">
        <div className="hero-pattern" />
        <div className="hero-glow-orb-1" />
        <div className="hero-glow-orb-2" />

        <div className="hero-container">
          <div className="hero-content">
            <div className="hero-badge-pill">
              <Sparkles size={16} />
              <span>Real-Time Reservation Management</span>
            </div>

            <h1 className="hero-title">
              Effortless Booking for <br />
              <span className="hero-title-highlight">Premium Spaces & Services</span>
            </h1>

            <p className="hero-description">
              Reserve enterprise boardrooms, holistic wellness retreats, master chef culinary tables,
              and creative photography studios with instant availability confirmation and zero overbooking.
            </p>

            <div className="hero-actions-row">
              <Link href="/services" className="btn-hero-primary">
                <span>Explore Services</span>
                <ArrowRight size={18} />
              </Link>
              <Link href="/booking" className="btn-hero-secondary">
                <CalendarCheck size={18} />
                <span>Quick Booking</span>
              </Link>
            </div>

            <div className="hero-trust-row">
              <div className="trust-item">
                <span className="trust-num">100%</span>
                <span className="trust-label">Live Availability Sync</span>
              </div>
              <div className="trust-item">
                <span className="trust-num">0 Overlap</span>
                <span className="trust-label">Capacity Lock Protection</span>
              </div>
              <div className="trust-item">
                <span className="trust-num">Instant</span>
                <span className="trust-label">Receipt Generation</span>
              </div>
            </div>
          </div>

          {/* HERO VISUAL WITH ANIMATED FLOATING CARDS */}
          <div className="hero-visual-wrapper">
            <div className="hero-floating-glass-card">
              <div className="floating-card-header">
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--slate-300)' }}>
                  System Status
                </span>
                <div className="live-pulse-badge">
                  <span className="pulse-dot-green" />
                  <span>Live Reservation Engine</span>
                </div>
              </div>

              <div className="preview-item-row">
                <img
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=300&q=80"
                  alt="Boardroom"
                  className="preview-thumb-img"
                />
                <div className="preview-row-details">
                  <div className="preview-row-title">Executive Boardroom Suite</div>
                  <div className="preview-row-sub">Tomorrow • 10:30 AM - 11:30 AM</div>
                </div>
                <div className="preview-row-price">₹2,500 / hr</div>
              </div>

              <div className="preview-item-row">
                <img
                  src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=300&q=80"
                  alt="Spa"
                  className="preview-thumb-img"
                />
                <div className="preview-row-details">
                  <div className="preview-row-title">Luxury Rejuvenation Spa</div>
                  <div className="preview-row-sub">Aromatherapy & Herbal Steam</div>
                </div>
                <div className="preview-row-price">₹3,200</div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <Link href="/services" style={{ fontSize: '13px', color: '#93c5fd', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span>View all curated service suites</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* FLOATING MINI TRUST BADGE */}
            <div className="hero-mini-badge">
              <div className="mini-badge-icon">
                <ShieldCheck size={20} />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--navy-900)' }}>
                  Bank-Grade Protection
                </div>
                <div style={{ fontSize: '11px', color: 'var(--slate-500)' }}>
                  256-Bit SSL Encrypted Booking
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FLOATING METRICS STRIP */}
      <div className="metrics-strip">
        <div className="metrics-strip-card">
          <div className="metric-box">
            <div className="metric-icon-bubble">
              <Award size={22} />
            </div>
            <div>
              <div className="metric-value">12,500+</div>
              <div className="metric-label">Confirmed Bookings</div>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon-bubble">
              <Zap size={22} />
            </div>
            <div>
              <div className="metric-value">100%</div>
              <div className="metric-label">Live Slot Accuracy</div>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon-bubble">
              <Clock size={22} />
            </div>
            <div>
              <div className="metric-value">&lt; 45 Sec</div>
              <div className="metric-label">Average Booking Time</div>
            </div>
          </div>

          <div className="metric-box">
            <div className="metric-icon-bubble">
              <Headphones size={22} />
            </div>
            <div>
              <div className="metric-value">24 / 7</div>
              <div className="metric-label">Concierge Assistance</div>
            </div>
          </div>
        </div>
      </div>

      {/* SERVICE CATEGORIES SECTION */}
      <section className="section-wrapper">
        <div className="section-head-center">
          <span className="section-eyebrow">
            <Compass size={14} />
            <span>Curated Collections</span>
          </span>
          <h2 className="section-main-title">Tailored For Every Requirement</h2>
          <p className="section-sub-desc">
            From high-stakes corporate board meetings to rejuvenating wellness therapies, choose from our premium collections.
          </p>
        </div>

        <div className="category-cards-grid">
          <div className="cat-feature-card">
            <div className="cat-icon-box workspace">
              <Building2 size={28} />
            </div>
            <h3 className="cat-title-text">Workspace & Meeting</h3>
            <p className="cat-desc-text">
              State-of-the-art acoustic executive boardrooms, conference halls, and ergonomic co-working hot desks with 4K AV.
            </p>
            <Link href="/services?category=Workspace%20%26%20Meeting" className="cat-link-action">
              <span>Browse Workspaces</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="cat-feature-card">
            <div className="cat-icon-box wellness">
              <HeartPulse size={28} />
            </div>
            <h3 className="cat-title-text">Health & Wellness</h3>
            <p className="cat-desc-text">
              Holistic rejuvenating massages, essential aromatherapy, and thermal steam treatments with certified practitioners.
            </p>
            <Link href="/services?category=Health%20%26%20Wellness" className="cat-link-action">
              <span>Browse Wellness</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="cat-feature-card">
            <div className="cat-icon-box dining">
              <UtensilsCrossed size={28} />
            </div>
            <h3 className="cat-title-text">Dining & Hospitality</h3>
            <p className="cat-desc-text">
              Curated master-chef tasting menus, private rooftop banquets, and intimate luxury gastronomy experiences.
            </p>
            <Link href="/services?category=Dining%20%26%20Hospitality" className="cat-link-action">
              <span>Browse Dining</span>
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="cat-feature-card">
            <div className="cat-icon-box studio">
              <Camera size={28} />
            </div>
            <h3 className="cat-title-text">Creative Studios</h3>
            <p className="cat-desc-text">
              Equipped production facilities with cyclorama backdrops, high-CRI lighting, and audio recording soundstages.
            </p>
            <Link href="/services" className="cat-link-action">
              <span>Browse Studios</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURED SERVICES SHOWCASE */}
      <section style={{ background: '#f8fafc', padding: '80px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="section-wrapper" style={{ padding: '0 24px' }}>
          <div className="section-head-center">
            <span className="section-eyebrow">
              <Sparkles size={14} />
              <span>Verified Instant Availability</span>
            </span>
            <h2 className="section-main-title">Popular Bookings</h2>
            <p className="section-sub-desc">
              Handpicked amenities ready for instant online reservation with verified real-time slots.
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--slate-500)' }}>
              Loading available amenities...
            </div>
          ) : (
            <div className="showcase-grid">
              {featuredServices.map(service => (
                <div key={service.id} className="showcase-card">
                  <div className="showcase-img-box">
                    <img
                      src={service.imageUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80'}
                      alt={service.name}
                      className="showcase-img"
                    />
                    <span className="showcase-category-tag">{service.category}</span>
                  </div>

                  <div className="showcase-body">
                    <h3 className="showcase-title">{service.name}</h3>
                    <p className="showcase-description">{service.description}</p>

                    <div className="showcase-meta-bar">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={15} color="var(--primary)" />
                        <span>Max Cap: <strong>{service.capacityPerSlot}</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={15} color="var(--primary)" />
                        <span>Slot: <strong>{service.durationMinutes} mins</strong></span>
                      </div>
                    </div>

                    <div className="showcase-footer">
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600, display: 'block' }}>
                          Standard Rate
                        </span>
                        <span className="showcase-price-val">
                          ₹{Number(service.price).toLocaleString('en-IN')}
                        </span>
                      </div>

                      <Link href={`/booking?serviceId=${service.id}`} className="btn-showcase-book">
                        <CalendarCheck size={16} />
                        <span>Book Slot</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '48px' }}>
            <Link href="/services" className="btn-hero-primary" style={{ display: 'inline-flex' }}>
              <span>View All Available Services</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE RESERVE EASE */}
      <section className="section-wrapper">
        <div className="section-head-center">
          <span className="section-eyebrow">
            <ShieldCheck size={14} />
            <span>Why ReserveEase</span>
          </span>
          <h2 className="section-main-title">Engineered For Zero Friction</h2>
          <p className="section-sub-desc">
            Discover how our reservation engine protects your schedule with enterprise-grade reliability.
          </p>
        </div>

        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon-bubble">
              <Zap size={26} />
            </div>
            <h3 className="why-title">Atomic Capacity Locks</h3>
            <p className="why-desc">
              Proprietary booking lock prevents any possibility of double bookings across concurrent users.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon-bubble">
              <CalendarCheck size={26} />
            </div>
            <h3 className="why-title">Live Slot Matrix</h3>
            <p className="why-desc">
              Visual real-time calendar accurately reflects booked, blocked, and remaining capacities instantly.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon-bubble">
              <CreditCard size={26} />
            </div>
            <h3 className="why-title">Verified Invoicing</h3>
            <p className="why-desc">
              Instant tax invoice generation with booking reference ID, ready for download and print.
            </p>
          </div>

          <div className="why-card">
            <div className="why-icon-bubble">
              <ShieldCheck size={26} />
            </div>
            <h3 className="why-title">Role-Based Security</h3>
            <p className="why-desc">
              Separate administrative controls, customer privacy safeguards, and persistent audit logs.
            </p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS / REVIEWS */}
      <section style={{ background: '#f8fafc', padding: '80px 0', borderTop: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
        <div className="section-wrapper" style={{ padding: '0 24px' }}>
          <div className="section-head-center">
            <span className="section-eyebrow">
              <Star size={14} />
              <span>Guest Experiences</span>
            </span>
            <h2 className="section-main-title">Loved by Corporate Leaders & Guests</h2>
            <p className="section-sub-desc">
              Read how ReserveEase transforms booking coordination for executives and private parties.
            </p>
          </div>

          <div className="reviews-grid">
            <div className="review-card">
              <div className="star-rating-row">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p className="review-quote-text">
                "The boardroom suite booking was seamless. We had high-profile international clients visiting, and the instant confirmation and room amenities exceeded all expectations."
              </p>
              <div className="review-author-row">
                <div className="author-avatar">AK</div>
                <div>
                  <div className="author-name">Aditya Kapoor</div>
                  <div className="author-role">Managing Director, Nexus Capital</div>
                </div>
              </div>
            </div>

            <div className="review-card">
              <div className="star-rating-row">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p className="review-quote-text">
                "Finding open wellness slots during peak hours used to be chaotic. With ReserveEase, I selected my therapist and time in under a minute with zero waiting."
              </p>
              <div className="review-author-row">
                <div className="author-avatar" style={{ background: '#fef3c7', color: '#b45309' }}>PS</div>
                <div>
                  <div className="author-name">Priya Sharma</div>
                  <div className="author-role">Senior Partner, Khaitan Legal</div>
                </div>
              </div>
            </div>

            <div className="review-card">
              <div className="star-rating-row">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill="#f59e0b" color="#f59e0b" />
                ))}
              </div>
              <p className="review-quote-text">
                "The automated receipt generation and crystal-clear booking reference IDs make our company expense claims and audit compliance effortless."
              </p>
              <div className="review-author-row">
                <div className="author-avatar" style={{ background: '#ecfdf5', color: '#047857' }}>RV</div>
                <div>
                  <div className="author-name">Rahul Verma</div>
                  <div className="author-role">Head of Operations, FinEdge Tech</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <section className="section-wrapper">
        <div className="section-head-center">
          <span className="section-eyebrow">
            <CheckCircle2 size={14} />
            <span>Got Questions?</span>
          </span>
          <h2 className="section-main-title">Frequently Asked Questions</h2>
          <p className="section-sub-desc">
            Everything you need to know about our reservation scheduling, capacity locks, and payment rails.
          </p>
        </div>

        <div className="faq-list">
          {faqs.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div key={index} className="faq-item">
                <button
                  className="faq-question-btn"
                  onClick={() => setOpenFaq(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={20}
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                      color: isOpen ? 'var(--primary)' : 'var(--slate-400)',
                      flexShrink: 0
                    }}
                  />
                </button>
                {isOpen && (
                  <div className="faq-answer">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <div style={{ padding: '0 24px' }}>
        <div className="home-cta-banner">
          <div className="cta-glow-circle" />
          <div style={{ position: 'relative', zIndex: 2, maxWidth: '640px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '1px' }}>
              Reserve Your Slot Today
            </span>
            <h2 style={{ fontSize: '36px', fontWeight: 800, marginTop: '10px', lineHeight: 1.2 }}>
              Ready for a Seamless Executive Booking Experience?
            </h2>
            <p style={{ fontSize: '16px', color: '#cbd5e1', marginTop: '14px', lineHeight: 1.6 }}>
              Join thousands of corporate executives, guests, and organizers who rely on ReserveEase for instant, guaranteed reservations.
            </p>
          </div>

          <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <Link href="/services" className="btn-hero-primary" style={{ padding: '16px 36px', fontSize: '16px' }}>
              <span>Book An Amenity Now</span>
              <ArrowRight size={18} />
            </Link>
            <div style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
              Instant Confirmation • 256-Bit SSL Secured
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
