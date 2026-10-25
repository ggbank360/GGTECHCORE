import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { submitInquiry } from '../services/inquiryService';

export const ContactSection = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('General Consultation');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await submitInquiry({ name, email, phone, subject, message });
      setLoading(false);
      setSuccess(true);
      setName('');
      setEmail('');
      setPhone('');
      setMessage('');
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Failed to submit inquiry. Please try again.');
    }
  };

  return (
    <section style={{ padding: '5rem 0', background: '#f8fafc' }}>
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Engineering Communications</span>
          <h2 className="section-title">Get In Touch With GG TECHCORE</h2>
          <p className="section-subtitle">
            Have questions regarding component sourcing, hardware feasibility, or custom engineering consultations? Connect directly with our engineering lab.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.3fr',
          gap: '3rem',
          maxWidth: '1100px',
          margin: '0 auto'
        }} className="grid-cols-2">
          {/* Company Contact Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="tech-card" style={{ padding: '2rem', background: '#ffffff' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: '#0f172a' }}>
                Engineering Headquarters
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#e0f2fe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <MapPin size={20} color="#0284c7" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.98rem' }}>GG TECHCORE Lab & R&D</div>
                    <div style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.5 }}>
                      TechCore Engineering Park, Electronics Innovation Hub<br />
                      Global Engineering Service
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#e0f2fe',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Mail size={20} color="#0284c7" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.98rem' }}>Direct Official Email</div>
                    <a href="mailto:ggbank360@gmail.com" style={{ fontSize: '0.92rem', color: '#0284c7', fontWeight: 700 }}>
                      ggbank360@gmail.com
                    </a>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: '#dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Phone size={20} color="#15803d" />
                  </div>
                  <div style={{ width: '100%' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.98rem', marginBottom: '0.5rem' }}>
                      Direct Engineering Team Contacts
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', borderBottom: '1px dashed #e2e8f0', paddingBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.86rem', color: '#0f172a' }}>GOWTHAM N K</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <a href="tel:7708949507" style={{ fontSize: '0.86rem', color: '#0284c7', fontWeight: 700, textDecoration: 'none' }}>
                            7708949507
                          </a>
                          <a href="https://wa.me/917708949507" target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', color: '#15803d', background: '#dcfce7', padding: '1px 6px', borderRadius: '4px', textDecoration: 'none' }}>
                            WhatsApp
                          </a>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem', borderBottom: '1px dashed #e2e8f0', paddingBottom: '0.35rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.86rem', color: '#0f172a' }}>GOPALA KRISHNAN M</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <a href="tel:6374431113" style={{ fontSize: '0.86rem', color: '#0284c7', fontWeight: 700, textDecoration: 'none' }}>
                            6374431113
                          </a>
                          <a href="https://wa.me/916374431113" target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', color: '#15803d', background: '#dcfce7', padding: '1px 6px', borderRadius: '4px', textDecoration: 'none' }}>
                            WhatsApp
                          </a>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.4rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.86rem', color: '#0f172a' }}>SARAVANA PRIYAN K</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <a href="tel:7708883927" style={{ fontSize: '0.86rem', color: '#0284c7', fontWeight: 700, textDecoration: 'none' }}>
                            7708883927
                          </a>
                          <a href="https://wa.me/917708883927" target="_blank" rel="noreferrer" style={{ fontSize: '0.72rem', color: '#15803d', background: '#dcfce7', padding: '1px 6px', borderRadius: '4px', textDecoration: 'none' }}>
                            WhatsApp
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="tech-card" style={{ padding: '1.75rem', background: '#ffffff' }}>
              <div style={{ fontFamily: 'var(--font-heading)', color: '#0284c7', fontSize: '1rem', fontWeight: 800, marginBottom: '0.5rem' }}>
                Engineering Ethics & IP Protection
              </div>
              <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: 1.6 }}>
                GG TECHCORE executes strict Non-Disclosure Agreements (NDAs) for proprietary hardware ideas and customer submissions. Customer abstracts remain the confidential intellectual property of their submitters.
              </p>
            </div>
          </div>

          {/* Contact Inquiry Form */}
          <div className="tech-card" style={{ padding: '2rem', background: '#ffffff' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: '#0f172a' }}>
              Transmit Direct Inquiry
            </h3>

            {success ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <CheckCircle2 size={42} color="#15803d" style={{ margin: '0 auto 1rem auto' }} />
                <h4 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>Inquiry Transmitted Successfully</h4>
                <p style={{ color: '#475569', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
                  Your message has been stored in our inquiries database. Our technical team will follow up via email.
                </p>
                <button onClick={() => setSuccess(false)} className="btn btn-secondary btn-sm">
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label required">Your Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Sarah Chen"
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sarah@example.com"
                      className="form-input"
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '1rem' }} className="grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 / +1 ..."
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g., PCB Prototyping Question"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label required">Message / Technical Requirements</label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your inquiry or engineering requirements..."
                    className="form-textarea"
                  />
                </div>

                {error && (
                  <div style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    background: '#ffe4e6',
                    border: '1px solid #fecdd3',
                    color: '#e11d48',
                    fontSize: '0.85rem',
                    marginBottom: '1rem'
                  }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem' }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Send Direct Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
