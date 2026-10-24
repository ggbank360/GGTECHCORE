import React, { useState } from 'react';
import { Cpu, Terminal, Layers, Send, ShieldCheck, Menu, X, ArrowUpRight, Star } from 'lucide-react';
import logoImg from '../assets/logo.png';

export const Navbar = ({ currentView, setCurrentView, onOpenAdmin, onOpenBookingModal, onOpenReviewModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { id: 'home', label: 'Home', icon: Cpu },
    { id: 'projects', label: 'Projects Showcase', icon: Layers },
    { id: 'booking', label: 'Submit Project Idea', icon: Send },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'contact', label: 'Contact Us', icon: Terminal }
  ];

  const handleNavClick = (viewId) => {
    if (viewId === 'reviews') {
      setMobileMenuOpen(false);
      if (currentView === 'home') {
        const el = document.getElementById('reviews-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else {
        setCurrentView('home');
        setTimeout(() => {
          const el = document.getElementById('reviews-section');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      }
      return;
    }
    setCurrentView(viewId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: 'rgba(255, 255, 255, 0.98)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 2px 12px rgba(15, 23, 42, 0.06)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '92px'
      }}>
        {/* Brand Logo with Official Uploaded Image in Prominent Big Size */}
        <div 
          onClick={() => handleNavClick('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            userSelect: 'none',
            padding: '2px 0'
          }}
        >
          <img 
            src={logoImg} 
            alt="GG TECHCORE — Engineering Ideas Into Reality" 
            style={{
              height: '68px',
              maxHeight: '72px',
              width: 'auto',
              objectFit: 'contain',
              display: 'block',
              filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.08))'
            }}
          />
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }} className="desktop-nav">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.5rem 0.95rem',
                  fontFamily: 'var(--font-sub)',
                  fontSize: '0.94rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  color: isActive ? '#0284c7' : '#475569',
                  background: isActive ? '#e0f2fe' : 'transparent',
                  border: '1px solid',
                  borderColor: isActive ? '#bae6fd' : 'transparent',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={16} />
                <span>{link.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {/* Direct Review Us Option */}
          {onOpenReviewModal && (
            <button
              onClick={onOpenReviewModal}
              title="Leave a Review for GG TECHCORE"
              className="btn btn-outline btn-sm review-nav-cta"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.45rem 0.85rem',
                borderColor: '#fbbf24',
                color: '#b45309',
                background: '#fffbeb',
                fontWeight: 700,
                fontSize: '0.86rem'
              }}
            >
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <span>Review Us</span>
            </button>
          )}

          {/* Quick Submit Project Idea CTA */}
          <button 
            className="btn btn-primary btn-sm"
            onClick={() => {
              if (onOpenBookingModal) {
                onOpenBookingModal(null);
              } else {
                handleNavClick('booking');
              }
            }}
            style={{ display: 'none' }}
            id="nav-quick-book-btn"
          >
            <span>Submit Idea</span>
            <ArrowUpRight size={15} />
          </button>

          {/* Admin Dashboard Launcher */}
          <button
            onClick={onOpenAdmin}
            title="Admin Command Portal"
            className="btn btn-secondary btn-sm"
            style={{
              padding: '0.45rem 0.8rem',
              fontSize: '0.84rem'
            }}
          >
            <ShieldCheck size={16} color="#0284c7" />
            <span className="admin-btn-label">Admin</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer'
            }}
            className="mobile-toggle-btn"
            aria-label="Toggle navigation"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)'
        }}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = currentView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => handleNavClick(link.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  fontFamily: 'var(--font-sub)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: isActive ? '#0284c7' : '#1e293b',
                  background: isActive ? '#e0f2fe' : '#f8fafc',
                  border: '1px solid',
                  borderColor: isActive ? '#bae6fd' : '#e2e8f0',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <Icon size={18} color={isActive ? '#0284c7' : '#64748b'} />
                <span>{link.label}</span>
              </button>
            );
          })}

          {onOpenReviewModal && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenReviewModal();
              }}
              className="btn btn-outline"
              style={{
                width: '100%',
                borderColor: '#fbbf24',
                color: '#b45309',
                background: '#fffbeb',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Star size={16} fill="#f59e0b" color="#f59e0b" />
              <span>Leave A Review</span>
            </button>
          )}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (onOpenBookingModal) onOpenBookingModal(null);
            }}
            className="btn btn-primary"
            style={{ marginTop: '0.25rem', width: '100%' }}
          >
            <span>Submit Your Project Idea</span>
            <ArrowUpRight size={18} />
          </button>
        </div>
      )}

      {/* Responsive Inline CSS overrides */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          #nav-quick-book-btn { display: inline-flex !important; }
          .mobile-toggle-btn { display: none !important; }
        }
      `}</style>
    </header>
  );
};
