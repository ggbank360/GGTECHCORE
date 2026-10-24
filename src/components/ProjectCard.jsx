import React from 'react';
import { FileText, ArrowRight } from 'lucide-react';

export const ProjectCard = ({ project, onViewDetails, onBookProject }) => {
  const thumbnail = project.imageUrls?.[0] || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="tech-card" style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-card)',
      overflow: 'hidden'
    }}>
      {/* Thumbnail Banner */}
      <div style={{
        position: 'relative',
        height: '210px',
        overflow: 'hidden',
        background: '#f1f5f9'
      }}>
        <img 
          src={thumbnail} 
          alt={project.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          loading="lazy"
        />

        {/* Gradient Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(15, 23, 42, 0.45) 0%, transparent 60%)'
        }} />

        {/* Category Badge */}
        <div style={{
          position: 'absolute',
          top: '0.85rem',
          left: '0.85rem',
          zIndex: 2
        }}>
          <span className="badge badge-blue" style={{ background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(8px)' }}>
            {project.category}
          </span>
        </div>

        {/* Status Indicator */}
        <div style={{
          position: 'absolute',
          top: '0.85rem',
          right: '0.85rem',
          zIndex: 2
        }}>
          <span className="status-pill status-completed" style={{ background: 'rgba(255, 255, 255, 0.95)' }}>
            <span className="beacon" style={{ width: '6px', height: '6px' }} />
            {project.published ? 'Published' : 'Draft'}
          </span>
        </div>
      </div>

      {/* Card Content Body */}
      <div style={{
        padding: '1.4rem',
        display: 'flex',
        flexDirection: 'column',
        flexGrow: 1
      }}>
        {/* Project Title */}
        <h3 style={{
          fontSize: '1.2rem',
          fontWeight: 800,
          lineHeight: 1.35,
          marginBottom: '0.65rem',
          color: '#0f172a',
          cursor: 'pointer'
        }}
        onClick={() => onViewDetails(project)}
        title={project.title}
        >
          {project.title}
        </h3>

        {/* Short Description */}
        <p style={{
          fontSize: '0.9rem',
          color: '#475569',
          lineHeight: 1.55,
          marginBottom: '1.25rem',
          flexGrow: 1,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {project.shortDescription || project.abstract}
        </p>

        {/* Technology Badges */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.4rem',
          marginBottom: '1.4rem'
        }}>
          {(project.technologies || []).slice(0, 4).map((tech, i) => (
            <span 
              key={i} 
              style={{
                fontFamily: 'var(--font-sub)',
                fontSize: '0.74rem',
                fontWeight: 700,
                color: '#0369a1',
                background: '#e0f2fe',
                padding: '0.2rem 0.55rem',
                borderRadius: '4px',
                border: '1px solid #bae6fd'
              }}
            >
              #{tech}
            </span>
          ))}
          {(project.technologies || []).length > 4 && (
            <span style={{ fontSize: '0.74rem', color: '#64748b', alignSelf: 'center', fontWeight: 600 }}>
              +{(project.technologies || []).length - 4} more
            </span>
          )}
        </div>

        {/* Action Button Strip */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.25fr',
          gap: '0.65rem',
          marginTop: 'auto'
        }}>
          <button
            onClick={() => onViewDetails(project)}
            className="btn btn-secondary btn-sm"
            title="Read technical dossier"
          >
            <FileText size={15} />
            <span>Details</span>
          </button>

          <button
            onClick={() => onBookProject(project)}
            className="btn btn-primary btn-sm"
            title="Request project proposal based on this technology"
          >
            <span>Request Proposal</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
