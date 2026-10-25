'use client';
import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '../../lib/api';
import {
  Search,
  Users,
  Clock,
  CalendarCheck,
  Sparkles,
  Inbox
} from 'lucide-react';
import '../../styles/services.css';

function ServicesContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams ? (searchParams.get('category') || 'All') : 'All';

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  const categories = [
    'All',
    'Workspace & Meeting',
    'Health & Wellness',
    'Dining & Hospitality',
    'Creative Studio'
  ];

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true);
        const res = await api.get('/services');
        if (res.success && Array.isArray(res.data)) {
          setServices(res.data);
        }
      } catch (err) {
        console.error('Failed to load services:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter(service => {
      const matchCategory =
        selectedCategory === 'All' ||
        service.category.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        service.name.toLowerCase().includes(q) ||
        service.description.toLowerCase().includes(q) ||
        service.category.toLowerCase().includes(q);

      return matchCategory && matchSearch;
    });
  }, [services, selectedCategory, searchQuery]);

  return (
    <div className="services-page-container">
      <div className="services-header-box">
        <span className="services-header-tag">Available Amenities</span>
        <h1 className="services-header-title">Explore Curated Experiences</h1>
        <p className="services-header-subtitle">
          Select from our premium portfolio of workspaces, gastronomy dinners, wellness suites, and creative photography spaces.
        </p>
      </div>

      <div className="filter-search-bar">
        <div className="search-input-group">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by amenity name, keywords, or features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-pills-row">
          {categories.map(cat => (
            <button
              key={cat}
              className={`category-pill ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--slate-500)' }}>
          Loading service catalog...
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="empty-services-state">
          <div className="empty-icon-circle">
            <Inbox size={32} />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--navy-900)' }}>
            No matching services found
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--slate-500)', marginTop: '8px' }}>
            Try adjusting your search criteria or select another category.
          </p>
          <button
            className="category-pill active"
            style={{ marginTop: '20px', display: 'inline-block' }}
            onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="services-catalog-grid">
          {filteredServices.map(service => (
            <div key={service.id} className="catalog-card">
              <div className="catalog-img-wrapper">
                <img
                  src={service.imageUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80'}
                  alt={service.name}
                  className="catalog-img"
                />
                <span className="catalog-tag">{service.category}</span>
              </div>

              <div className="catalog-body">
                <h3 className="catalog-title">{service.name}</h3>
                <p className="catalog-desc">{service.description}</p>

                <div className="catalog-specs-row">
                  <div className="catalog-spec-item">
                    <Clock size={16} color="var(--primary)" />
                    <span>{service.durationMinutes} Minutes</span>
                  </div>
                  <div className="catalog-spec-item">
                    <Users size={16} color="var(--primary)" />
                    <span>Cap: {service.capacityPerSlot} per slot</span>
                  </div>
                </div>

                <div className="catalog-footer">
                  <div className="catalog-price-box">
                    <span className="catalog-price-label">Price / slot</span>
                    <span className="catalog-price-val">₹{Number(service.price).toLocaleString('en-IN')}</span>
                  </div>

                  <Link href={`/booking?serviceId=${service.id}`} className="btn-catalog-book">
                    <CalendarCheck size={16} />
                    <span>Reserve</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--slate-500)' }}>Loading services...</div>}>
      <ServicesContent />
    </Suspense>
  );
}
