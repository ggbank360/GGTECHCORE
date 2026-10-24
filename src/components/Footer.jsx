import React from 'react';
import { ShieldCheck, ArrowUp, Phone, Mail } from 'lucide-react';
import logoImg from '../assets/logo.png';

export const Footer = ({ onNavigate, onOpenAdmin }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{
      background: '#ffffff',
      borderTop: '1px solid #e2e8f0',
      padding: '4rem 0 2rem 0',
      position: 'relative',
      color: '#334155'
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr 1fr 1.2fr',
          gap: '2.5rem',
          marginBottom: '3rem'
        }} className="footer-grid">
          {/* Brand Info */}
          <div>
            <div style={{ marginBottom: '1.25rem' }}>
              <img 
                src={logoImg} 
                alt="GG TECHCORE" 
                style={{
                  height: '72px',
                  maxHeight: '76px',
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </div>

            <p style={{
              fontSize: '0.9rem',
              color: '#475569',
              lineHeight: 1.6,
              marginBottom: '1rem',
              maxWidth: '320px'
            }}>
              <strong>“ENGINEERING IDEAS INTO REALITY.”</strong><br />
              Pioneering hardware engineering, embedded systems, IoT sensors, robotics, and custom software prototyping.
            </p>

            <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
              Integrated with Firebase (ggbank-d6735) & Cloudinary (ggtechcore).
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 style={{ color: '#0f172a', fontSize: '0.95rem', marginBottom: '1rem', fontWeight: 800 }}>Quick Navigation</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
              <li>
                <a href="#home" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} style={{ color: '#475569' }}>
                  Home Overview
                </a>
              </li>
              <li>
                <a href="#projects" onClick={(e) => { e.preventDefault(); onNavigate('projects'); }} style={{ color: '#475569' }}>
                  Projects Showcase Gallery
                </a>
              </li>
              <li>
                <a href="#booking" onClick={(e) => { e.preventDefault(); onNavigate('booking'); }} style={{ color: '#475569' }}>
                  Submit Project Idea
                </a>
              </li>
              <li>
                <a href="#reviews" onClick={(e) => {
                  e.preventDefault();
                  onNavigate('home');
                  setTimeout(() => {
                    const el = document.getElementById('reviews-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 120);
                }} style={{ color: '#0284c7', fontWeight: 700 }}>
                  ★ Engineering Reviews & Ratings
                </a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => { e.preventDefault(); onNavigate('contact'); }} style={{ color: '#475569' }}>
                  Direct Lab Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Engineering Domains */}
          <div>
            <h4 style={{ color: '#0f172a', fontSize: '0.95rem', marginBottom: '1rem', fontWeight: 800 }}>Domains</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem', color: '#64748b' }}>
              <li>Embedded Systems & ESP32</li>
              <li>Autonomous Robotics & AGVs</li>
              <li>LoRaWAN & IoT Telemetry</li>
              <li>High-Density PCB Layouts</li>
              <li>Edge AI & Computer Vision</li>
              <li>Web Telemetry Portals</li>
            </ul>
          </div>

          {/* Secure Admin Portal Link */}
          <div>
            <h4 style={{ color: '#0f172a', fontSize: '0.95rem', marginBottom: '1rem', fontWeight: 800 }}>Governance & Admin</h4>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.5 }}>
              Authorized administrators can log in to manage project dossiers, evaluate customer abstracts, and update proposal statuses.
            </p>

            <button
              onClick={onOpenAdmin}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', justifyContent: 'flex-start' }}
            >
              <ShieldCheck size={16} color="#0284c7" />
              <span>Admin Authentication Portal</span>
            </button>
          </div>
        </div>

        {/* Direct Engineering Leadership Contacts */}
        <div style={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: '2rem',
          paddingBottom: '1.5rem',
          marginBottom: '1rem'
        }}>
          <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h4 style={{ color: '#0f172a', fontSize: '1rem', fontWeight: 800, margin: 0 }}>
                Direct Engineering Contacts & Official Desk
              </h4>
              <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                Connect directly with our team leads for technical inquiries, project feasibility, and rapid consultation:
              </p>
            </div>

            <a 
              href="mailto:ggbank360@gmail.com"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#e0f2fe',
                color: '#0284c7',
                padding: '0.45rem 0.9rem',
                borderRadius: 'var(--radius-sm)',
                fontWeight: 700,
                fontSize: '0.88rem',
                textDecoration: 'none'
              }}
            >
              <Mail size={15} />
              <span>ggbank360@gmail.com</span>
            </a>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '1rem'
          }}>
            {/* GOWTHAM N K */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem'
            }}>
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                GOWTHAM N K
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <a 
                  href="tel:7708949507" 
                  style={{
                    color: '#0284c7',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'none'
                  }}
                >
                  <Phone size={14} />
                  <span>7708949507</span>
                </a>
                <a 
                  href="https://wa.me/917708949507" 
                  target="_blank" 
                  rel="noreferrer"
                  style={{
                    fontSize: '0.78rem',
                    color: '#15803d',
                    fontWeight: 600,
                    background: '#dcfce7',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    textDecoration: 'none'
                  }}
                >
                  💬 WhatsApp
                </a>
              </div>
            </div>

            {/* GOPALA KRISHNAN M */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem'
            }}>
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                GOPALA KRISHNAN M
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <a 
                  href="tel:6374431113" 
                  style={{
                    color: '#0284c7',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'none'
                  }}
                >
                  <Phone size={14} />
                  <span>6374431113</span>
                </a>
                <a 
                  href="https://wa.me/916374431113" 
                  target="_blank" 
                  rel="noreferrer"
                  style={{
                    fontSize: '0.78rem',
                    color: '#15803d',
                    fontWeight: 600,
                    background: '#dcfce7',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    textDecoration: 'none'
                  }}
                >
                  💬 WhatsApp
                </a>
              </div>
            </div>

            {/* SARAVANA PRIYAN K */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 'var(--radius-md)',
              padding: '1rem 1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem'
            }}>
              <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                SARAVANA PRIYAN K
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <a 
                  href="tel:7708883927" 
                  style={{
                    color: '#0284c7',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'none'
                  }}
                >
                  <Phone size={14} />
                  <span>7708883927</span>
                </a>
                <a 
                  href="https://wa.me/917708883927" 
                  target="_blank" 
                  rel="noreferrer"
                  style={{
                    fontSize: '0.78rem',
                    color: '#15803d',
                    fontWeight: 600,
                    background: '#dcfce7',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    textDecoration: 'none'
                  }}
                >
                  💬 WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid #e2e8f0',
          paddingTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
            © {new Date().getFullYear()} GG TECHCORE. All Rights Reserved. Engineering ideas into reality.
          </div>

          <button
            onClick={scrollToTop}
            style={{
              background: '#f1f5f9',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              padding: '0.45rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-sub)',
              fontWeight: 700
            }}
          >
            <span>Back to top</span>
            <ArrowUp size={14} />
          </button>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 550px) {
          .footer-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
};
