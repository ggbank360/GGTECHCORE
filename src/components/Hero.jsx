import React from 'react';
import { ArrowRight, Cpu, Zap, Activity, Layers, ShieldCheck, Terminal, Disc } from 'lucide-react';

export const Hero = ({ onExploreProjects, onBookProject, onContactUs }) => {
  return (
    <section style={{
      position: 'relative',
      padding: '4.5rem 0 5rem 0',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)'
    }}>
      {/* Background Subtle Gradient & Light Grid */}
      <div style={{
        position: 'absolute',
        top: '-120px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '900px',
        height: '450px',
        background: 'radial-gradient(ellipse, rgba(2, 132, 199, 0.12) 0%, rgba(37, 99, 235, 0.05) 50%, transparent 80%)',
        filter: 'blur(60px)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Status Badge */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.45rem 1.25rem',
            borderRadius: '9999px',
            background: '#e0f2fe',
            border: '1px solid #bae6fd',
            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.1)'
          }}>
            <span className="beacon" />
            <span style={{
              fontFamily: 'var(--font-sub)',
              fontSize: '0.88rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              color: '#0369a1',
              textTransform: 'uppercase'
            }}>
              Next-Gen Engineering & Prototyping Platform
            </span>
          </div>
        </div>

        {/* Hero Title & Tagline */}
        <div style={{ textAlign: 'center', maxWidth: '980px', margin: '0 auto 2rem auto' }}>
          <h1 style={{
            fontSize: 'clamp(2.4rem, 5.5vw, 4.3rem)',
            fontWeight: 900,
            lineHeight: 1.15,
            marginBottom: '1.25rem',
            letterSpacing: '0.02em',
            color: '#0f172a'
          }}>
            ENGINEERING IDEAS <br />
            <span style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 50%, #4f46e5 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              INTO REALITY.
            </span>
          </h1>

          <p style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.25rem)',
            color: '#475569',
            lineHeight: 1.65,
            maxWidth: '780px',
            margin: '0 auto 2.5rem auto'
          }}>
            <strong style={{ color: '#0f172a' }}>GG TECHCORE</strong> delivers precision hardware development, intelligent embedded systems, IoT sensors, high-density PCBs, and custom software solutions — transforming complex ideas into production-ready physical hardware.
          </p>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem'
          }}>
            <button
              onClick={onExploreProjects}
              className="btn btn-primary btn-lg"
              id="hero-explore-btn"
            >
              <Layers size={20} />
              <span>Explore Projects</span>
            </button>

            <button
              onClick={onBookProject}
              className="btn btn-secondary btn-lg"
              id="hero-book-btn"
            >
              <Zap size={20} />
              <span>Submit Project Idea</span>
            </button>

            <button
              onClick={onContactUs}
              className="btn btn-outline btn-lg"
              id="hero-contact-btn"
            >
              <Terminal size={20} />
              <span>Contact Lab</span>
            </button>
          </div>
        </div>

        {/* Live Engineering Metrics Ticker */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '1.25rem',
          maxWidth: '1100px',
          margin: '3.5rem auto 0 auto'
        }}>
          {[
            { label: 'Prototypes Fabricated', val: '65+', sub: 'ESP32, STM32 & ARM Cortex', icon: Cpu, color: '#0284c7', bg: '#e0f2fe' },
            { label: 'Engineering Reliability', val: '99.8%', sub: 'Field-Tested Standards', icon: Activity, color: '#15803d', bg: '#dcfce7' },
            { label: 'Custom Circuit Layouts', val: '120+', sub: 'Up to 6-Layer PCBs', icon: Disc, color: '#7c3aed', bg: '#ede9fe' },
            { label: 'Client IP Ownership', val: '100%', sub: 'Complete Confidentiality', icon: ShieldCheck, color: '#b45309', bg: '#fef3c7' }
          ].map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx}
                className="tech-card"
                style={{
                  padding: '1.35rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.1rem',
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  boxShadow: 'var(--shadow-card)'
                }}
              >
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '12px',
                  background: stat.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Icon size={24} color={stat.color} />
                </div>
                <div>
                  <div style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '1.75rem',
                    fontWeight: 900,
                    color: '#0f172a',
                    lineHeight: 1.1
                  }}>
                    {stat.val}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-sub)',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: stat.color,
                    textTransform: 'uppercase'
                  }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                    {stat.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
