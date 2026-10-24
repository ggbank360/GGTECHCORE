import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Cpu, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Download, 
  Layers, 
  Activity, 
  ShieldCheck, 
  Code2,
  Maximize2
} from 'lucide-react';

export const ProjectDetailPage = ({ project, onBack, onBookThisProject }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedGalleryImg, setSelectedGalleryImg] = useState(null);

  if (!project) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem', color: '#0f172a' }}>Project Not Found</h2>
        <button onClick={onBack} className="btn btn-secondary">
          <ArrowLeft size={16} />
          <span>Back to Projects</span>
        </button>
      </div>
    );
  }

  const mainImage = project.imageUrls?.[0] || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';

  return (
    <div style={{ paddingBottom: '6rem', background: '#f8fafc' }}>
      {/* Top Breadcrumb & Navigation */}
      <div style={{
        background: '#ffffff',
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 0'
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem'
        }}>
          <button 
            onClick={onBack}
            className="btn btn-secondary btn-sm"
          >
            <ArrowLeft size={16} />
            <span>Back to Projects Showcase</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span className="badge badge-blue">{project.category}</span>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontFamily: 'var(--font-sub)', fontWeight: 600 }}>
              Project ID: {project.id}
            </span>
          </div>
        </div>
      </div>

      {/* Hero Header Dossier */}
      <div className="container" style={{ marginTop: '2.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '2.5rem',
          alignItems: 'start'
        }} className="detail-hero-grid">
          {/* Main Hero Image */}
          <div style={{
            position: 'relative',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: '1px solid #cbd5e1',
            boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.1)',
            background: '#f1f5f9',
            height: '380px'
          }}>
            <img 
              src={mainImage} 
              alt={project.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
            />
            <div style={{
              position: 'absolute',
              bottom: '1.25rem',
              left: '1.25rem',
              right: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span className="badge badge-emerald" style={{ backdropFilter: 'blur(8px)', background: 'rgba(255, 255, 255, 0.95)' }}>
                Hardware & Embedded Spec Ready
              </span>
              <button 
                onClick={() => setSelectedGalleryImg(mainImage)}
                style={{
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: '1px solid #cbd5e1',
                  color: '#0f172a',
                  padding: '0.4rem',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
                title="Expand View"
              >
                <Maximize2 size={16} />
              </button>
            </div>
          </div>

          {/* Title, Quick Summary & Action Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <h1 style={{
              fontSize: 'clamp(1.75rem, 3.5vw, 2.35rem)',
              lineHeight: 1.25,
              fontWeight: 900,
              color: '#0f172a'
            }}>
              {project.title}
            </h1>

            <p style={{
              fontSize: '1.02rem',
              color: '#475569',
              lineHeight: 1.65
            }}>
              {project.shortDescription}
            </p>

            {/* Technologies Strip */}
            <div>
              <div style={{
                fontFamily: 'var(--font-sub)',
                fontSize: '0.8rem',
                color: '#64748b',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 700,
                marginBottom: '0.5rem'
              }}>
                Engineering Stack & Protocols
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.45rem' }}>
                {(project.technologies || []).map((t, idx) => (
                  <span key={idx} className="badge badge-blue">
                    #{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Direct Proposal Action Banner */}
            <div className="tech-card" style={{
              padding: '1.5rem',
              marginTop: '0.75rem',
              background: '#f0f9ff',
              border: '1px solid #bae6fd'
            }}>
              <div style={{ marginBottom: '0.85rem' }}>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.05rem', color: '#0369a1', fontWeight: 800 }}>
                  Need A Similar Custom Solution?
                </div>
                <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                  Request turnkey prototyping, custom firmware adaptations, or submit your own unique hardware/software requirements.
                </div>
              </div>

              <button
                onClick={() => onBookThisProject(project)}
                className="btn btn-primary"
                style={{ width: '100%', fontSize: '1rem', padding: '0.85rem 1.5rem' }}
                id="dossier-book-btn"
              >
                <span>Request Project Proposal</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Technical Dossier Navigation Tabs */}
        <div style={{
          marginTop: '3.5rem',
          borderBottom: '2px solid #e2e8f0',
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '2px'
        }}>
          {[
            { id: 'overview', label: '1. Abstract & Overview', icon: FileText },
            { id: 'solution', label: '2. Problem & Solution', icon: Activity },
            { id: 'bom', label: '3. HW & SW Requirements', icon: Cpu },
            { id: 'schematics', label: '4. Schematics & Media', icon: Layers },
            { id: 'analysis', label: '5. Features & Trade-Offs', icon: ShieldCheck }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.55rem',
                  padding: '0.85rem 1.35rem',
                  fontFamily: 'var(--font-sub)',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  background: isActive ? '#e0f2fe' : 'transparent',
                  color: isActive ? '#0284c7' : '#64748b',
                  border: 'none',
                  borderBottom: isActive ? '3px solid #0284c7' : '3px solid transparent',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  borderRadius: '6px 6px 0 0',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Panels */}
        <div style={{ marginTop: '2.5rem' }}>
          {/* TAB 1: ABSTRACT & OVERVIEW */}
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Project Abstract */}
              <div className="tech-card" style={{ padding: '2rem', background: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <FileText size={22} color="#0284c7" />
                  <h3 style={{ fontSize: '1.35rem', color: '#0f172a' }}>Project Abstract</h3>
                </div>
                <p style={{
                  fontSize: '1.02rem',
                  lineHeight: 1.8,
                  color: '#334155',
                  background: '#f8fafc',
                  padding: '1.5rem',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '4px solid #0284c7'
                }}>
                  {project.abstract}
                </p>
              </div>

              {/* Detailed Project Overview */}
              <div className="tech-card" style={{ padding: '2rem', background: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <Activity size={22} color="#2563eb" />
                  <h3 style={{ fontSize: '1.35rem', color: '#0f172a' }}>Detailed Project Overview</h3>
                </div>
                <p style={{ fontSize: '1rem', lineHeight: 1.75, color: '#475569' }}>
                  {project.overview}
                </p>

                {/* Methodology */}
                {project.methodology && (
                  <div style={{ marginTop: '2rem' }}>
                    <h4 style={{ color: '#0284c7', marginBottom: '0.75rem', fontSize: '1.05rem', fontWeight: 800 }}>
                      Working Principle & Methodology
                    </h4>
                    <p style={{ fontSize: '0.98rem', lineHeight: 1.7, color: '#475569' }}>
                      {project.methodology}
                    </p>
                  </div>
                )}
              </div>

              {/* Objectives List */}
              {project.objectives && project.objectives.length > 0 && (
                <div className="tech-card" style={{ padding: '2rem', background: '#ffffff' }}>
                  <h3 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', color: '#0f172a' }}>Project Objectives</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                    {project.objectives.map((obj, i) => (
                      <div key={i} style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.85rem',
                        padding: '1rem',
                        background: '#f8fafc',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid #e2e8f0'
                      }}>
                        <CheckCircle size={18} color="#0284c7" style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.5, fontWeight: 500 }}>
                          {obj}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROBLEM & SOLUTION */}
          {activeTab === 'solution' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="grid-cols-2">
              <div className="tech-card" style={{ padding: '2rem', borderTop: '4px solid #e11d48', background: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <AlertCircle size={22} color="#e11d48" />
                  <h3 style={{ fontSize: '1.3rem', color: '#e11d48' }}>Problem Statement</h3>
                </div>
                <p style={{ fontSize: '0.98rem', lineHeight: 1.75, color: '#475569' }}>
                  {project.problemStatement || 'Traditional implementations suffer from high component cost, lack of real-time telemetry, and difficulty in field deployment.'}
                </p>
              </div>

              <div className="tech-card" style={{ padding: '2rem', borderTop: '4px solid #10b981', background: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                  <ShieldCheck size={22} color="#10b981" />
                  <h3 style={{ fontSize: '1.3rem', color: '#15803d' }}>Proposed Solution</h3>
                </div>
                <p style={{ fontSize: '0.98rem', lineHeight: 1.75, color: '#475569' }}>
                  {project.proposedSolution || 'GG TECHCORE engineered a custom integrated embedded solution featuring dedicated hardware sensing, low-overhead communication protocols, and edge computation.'}
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: HARDWARE & SOFTWARE REQUIREMENTS */}
          {activeTab === 'bom' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              <div className="tech-card" style={{ padding: '2rem', background: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <Cpu size={22} color="#0284c7" />
                  <h3 style={{ fontSize: '1.35rem', color: '#0f172a' }}>Hardware Bill of Materials (BOM) & Specifications</h3>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{
                        borderBottom: '2px solid #e2e8f0',
                        fontFamily: 'var(--font-sub)',
                        fontSize: '0.85rem',
                        color: '#0369a1',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        background: '#f8fafc'
                      }}>
                        <th style={{ padding: '0.85rem 1rem' }}>Component / Module</th>
                        <th style={{ padding: '0.85rem 1rem' }}>Engineering Specification & Tolerance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(project.hardwareRequirements || []).map((hw, i) => {
                        const item = typeof hw === 'string' ? hw : hw.item;
                        const spec = typeof hw === 'string' ? 'Required Component' : hw.spec;
                        return (
                          <tr key={i} style={{
                            borderBottom: '1px solid #f1f5f9',
                            fontSize: '0.92rem'
                          }}>
                            <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: '#0f172a' }}>
                              {item}
                            </td>
                            <td style={{ padding: '0.85rem 1rem', color: '#475569' }}>
                              {spec}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="tech-card" style={{ padding: '2rem', background: '#ffffff' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <Code2 size={22} color="#2563eb" />
                  <h3 style={{ fontSize: '1.35rem', color: '#0f172a' }}>Software Frameworks, Libraries & Firmware</h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                  {(project.softwareRequirements || []).map((sw, i) => (
                    <div key={i} style={{
                      padding: '1rem',
                      background: '#f8fafc',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid #e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem'
                    }}>
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#0284c7'
                      }} />
                      <span style={{ fontSize: '0.92rem', color: '#1e293b', fontWeight: 600 }}>{sw}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SCHEMATICS & MEDIA */}
          {activeTab === 'schematics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              <div className="tech-card" style={{ padding: '2rem', background: '#ffffff' }}>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem', color: '#0f172a' }}>Circuit & Block Diagrams</h3>
                <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                  Functional block architecture and schematic interconnection diagram for hardware fabrication.
                </p>

                <div style={{
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: '1px solid #cbd5e1',
                  background: '#f1f5f9',
                  maxHeight: '480px'
                }}>
                  <img 
                    src={project.circuitDiagramUrl || mainImage} 
                    alt="Circuit diagram"
                    style={{
                      width: '100%',
                      height: '100%',
                      maxHeight: '480px',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              </div>

              {project.imageUrls && project.imageUrls.length > 1 && (
                <div className="tech-card" style={{ padding: '2rem', background: '#ffffff' }}>
                  <h3 style={{ fontSize: '1.35rem', marginBottom: '1.25rem', color: '#0f172a' }}>Engineering Photo Gallery</h3>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '1.25rem'
                  }}>
                    {project.imageUrls.map((img, i) => (
                      <div 
                        key={i}
                        onClick={() => setSelectedGalleryImg(img)}
                        style={{
                          height: '200px',
                          borderRadius: 'var(--radius-md)',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          border: '1px solid #cbd5e1'
                        }}
                      >
                        <img 
                          src={img} 
                          alt={`Gallery ${i}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {project.documentUrls && project.documentUrls.length > 0 && (
                <div className="tech-card" style={{ padding: '2rem', background: '#ffffff' }}>
                  <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem', color: '#0f172a' }}>Downloadable Documentation</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {project.documentUrls.map((doc, idx) => (
                      <a 
                        key={idx}
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary"
                        style={{
                          justifyContent: 'space-between',
                          padding: '0.85rem 1.25rem'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <FileText size={18} color="#0284c7" />
                          <span>{doc.name || 'Technical Document PDF'}</span>
                        </div>
                        <Download size={16} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: FEATURES & TRADE-OFFS */}
          {activeTab === 'analysis' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="grid-cols-2">
                <div className="tech-card" style={{ padding: '2rem', background: '#ffffff' }}>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', color: '#0284c7' }}>
                    Key Features
                  </h3>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(project.features || []).map((f, i) => (
                      <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.95rem' }}>
                        <CheckCircle size={16} color="#0284c7" style={{ flexShrink: 0, marginTop: '3px' }} />
                        <span style={{ color: '#334155' }}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="tech-card" style={{ padding: '2rem', background: '#ffffff' }}>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', color: '#2563eb' }}>
                    Target Industrial Applications
                  </h3>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(project.applications || []).map((app, i) => (
                      <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.95rem' }}>
                        <Layers size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: '3px' }} />
                        <span style={{ color: '#334155' }}>{app}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }} className="grid-cols-2">
                <div className="tech-card" style={{ padding: '2rem', borderLeft: '4px solid #10b981', background: '#ffffff' }}>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', color: '#15803d' }}>
                    Engineering Advantages
                  </h3>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(project.advantages || []).map((adv, i) => (
                      <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.92rem' }}>
                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                        <span style={{ color: '#475569' }}>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="tech-card" style={{ padding: '2rem', borderLeft: '4px solid #f59e0b', background: '#ffffff' }}>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', color: '#b45309' }}>
                    Technical Constraints
                  </h3>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(project.limitations || []).map((lim, i) => (
                      <li key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.92rem' }}>
                        <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>!</span>
                        <span style={{ color: '#475569' }}>{lim}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedGalleryImg && (
        <div 
          className="modal-overlay"
          onClick={() => setSelectedGalleryImg(null)}
        >
          <div style={{ maxWidth: '900px', width: '100%', position: 'relative' }}>
            <img 
              src={selectedGalleryImg} 
              alt="Enlarged view"
              style={{
                width: '100%',
                maxHeight: '85vh',
                objectFit: 'contain',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
              }}
            />
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .detail-hero-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};
