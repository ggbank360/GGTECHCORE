import React, { useState, useEffect } from 'react';
import { Star, MessageSquarePlus, CheckCircle2, Quote } from 'lucide-react';
import { subscribeToReviews } from '../services/reviewService';

export const ReviewsSection = ({ onOpenReviewModal }) => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // Real-time subscription — updates automatically when Firestore changes
    const unsubscribe = subscribeToReviews((list) => {
      setReviews(list);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <section style={{ padding: '5rem 0', background: '#f8fafc', borderTop: '1px solid #e2e8f0', scrollMarginTop: '100px' }} id="reviews-section">
      <div className="container">
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: '3rem',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}>
          <div>
            <span className="section-tag">Client Feedback</span>
            <h2 className="section-title" style={{ margin: 0 }}>Engineering Reviews & Ratings</h2>
            <p className="section-subtitle" style={{ margin: '0.5rem 0 0 0' }}>
              Real reviews from researchers, startups, and institutions working with GG TECHCORE.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {/* Rating pill */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '9999px',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)'
            }}>
              <div style={{ display: 'flex', gap: '2px' }}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} size={16} color="#f59e0b" fill="#f59e0b" />
                ))}
              </div>
              <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem' }}>
                {averageRating} / 5.0
              </span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                ({reviews.length} reviews)
              </span>
            </div>

            <button 
              onClick={onOpenReviewModal}
              className="btn btn-primary btn-sm"
            >
              <MessageSquarePlus size={16} />
              <span>Write A Review</span>
            </button>
          </div>
        </div>

        {/* Reviews Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.75rem'
        }}>
          {reviews.map((rev) => (
            <div 
              key={rev.id}
              className="tech-card"
              style={{
                padding: '2rem',
                background: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  {/* Stars */}
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        size={17}
                        color={star <= rev.rating ? '#f59e0b' : '#cbd5e1'}
                        fill={star <= rev.rating ? '#f59e0b' : 'none'}
                      />
                    ))}
                  </div>

                  <Quote size={24} color="#bae6fd" style={{ opacity: 0.8 }} />
                </div>

                <p style={{
                  fontSize: '0.95rem',
                  color: '#334155',
                  lineHeight: 1.65,
                  marginBottom: '1.5rem',
                  fontStyle: 'italic'
                }}>
                  "{rev.comment}"
                </p>
              </div>

              <div style={{
                borderTop: '1px solid #f1f5f9',
                paddingTop: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span>{rev.name}</span>
                    <CheckCircle2 size={15} color="#15803d" title="Verified Engineering Client" />
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    {rev.role ? `${rev.role}, ` : ''}{rev.organization || 'Client'}
                  </div>
                  {rev.projectTitle && (
                    <div style={{ fontSize: '0.75rem', color: '#0284c7', fontWeight: 600, marginTop: '0.2rem' }}>
                      Project: {rev.projectTitle}
                    </div>
                  )}
                </div>

                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  {new Date(rev.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
