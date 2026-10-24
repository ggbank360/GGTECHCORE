import React, { useState } from 'react';
import { Star, X, Send, Loader2, CheckCircle2 } from 'lucide-react';
import { submitReview } from '../services/reviewService';

export const ReviewModal = ({ isOpen, onClose, onReviewSubmitted }) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [organization, setOrganization] = useState('');
  const [projectTitle, setProjectTitle] = useState('');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!comment.trim()) {
      setError('Please enter your review comments.');
      return;
    }

    try {
      setSubmitting(true);
      const newRev = await submitReview({
        name,
        role,
        organization,
        projectTitle,
        rating,
        comment
      });
      setSubmitting(false);
      setSuccess(true);
      if (onReviewSubmitted) onReviewSubmitted(newRev);
    } catch (err) {
      setSubmitting(false);
      setError(err.message || 'Failed to submit review.');
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '580px', background: '#ffffff', color: '#0f172a' }}
      >
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc'
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: 800 }}>
              Write A Client Review
            </h3>
            <div style={{ fontSize: '0.8rem', color: '#0284c7', fontWeight: 600 }}>
              Share your engineering & prototyping experience with GG TECHCORE
            </div>
          </div>

          <button 
            onClick={handleClose}
            style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.75rem' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#dcfce7',
                border: '1px solid #86efac',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                <CheckCircle2 size={32} color="#15803d" />
              </div>
              <h4 style={{ fontSize: '1.35rem', color: '#0f172a', marginBottom: '0.5rem' }}>
                Thank You For Your Review!
              </h4>
              <p style={{ color: '#475569', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
                Your feedback has been published and added to our client testimonials.
              </p>
              <button onClick={handleClose} className="btn btn-primary">
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Star Rating Picker */}
              <div className="form-group" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <label className="form-label" style={{ marginBottom: '0.5rem' }}>Your Rating</label>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = (hoverRating || rating) >= star;
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '0.25rem',
                          transition: 'transform 0.15s ease'
                        }}
                      >
                        <Star 
                          size={32} 
                          color={isFilled ? '#f59e0b' : '#cbd5e1'} 
                          fill={isFilled ? '#f59e0b' : 'none'}
                        />
                      </button>
                    );
                  })}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#0284c7', fontWeight: 700, marginTop: '0.35rem' }}>
                  {rating} of 5 Stars
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label required">Your Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Dr. Ananya Sen"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Role / Title (Optional)</label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g., Lead Hardware Researcher"
                    className="form-input"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }} className="grid-cols-2">
                <div className="form-group">
                  <label className="form-label">Organization / College</label>
                  <input
                    type="text"
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    placeholder="e.g., IIT Madras / BioLabs"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Project / Service Reviewed</label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="e.g., ESP32 Sensor System"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">Your Review & Feedback</label>
                <textarea
                  required
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about the quality of engineering, prototypes, technical documentation, or turnaround time..."
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={handleClose} className="btn btn-outline">
                  Cancel
                </button>

                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  <span>Publish Review</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
