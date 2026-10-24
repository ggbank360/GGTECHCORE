import React, { useState, useMemo } from 'react';
import { ProjectCard } from '../components/ProjectCard';
import { FilterBar } from '../components/FilterBar';
import { Layers, AlertCircle, RefreshCw } from 'lucide-react';

export const ProjectsPage = ({ projects, onViewDetails, onBookProject }) => {
  const [selectedCategory, setSelectedCategory] = useState('All Projects');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter projects by category and search query
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // Category match
      const matchesCategory = 
        selectedCategory === 'All Projects' || project.category === selectedCategory;

      // Search match
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const titleMatch = (project.title || '').toLowerCase().includes(query);
      const descMatch = (project.shortDescription || '').toLowerCase().includes(query);
      const abstractMatch = (project.abstract || '').toLowerCase().includes(query);
      const techMatch = (project.technologies || []).some(t => t.toLowerCase().includes(query));

      return matchesCategory && (titleMatch || descMatch || abstractMatch || techMatch);
    });
  }, [projects, selectedCategory, searchQuery]);

  return (
    <div style={{ padding: '4rem 0 6rem 0' }}>
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="section-tag">Engineering Showcase</span>
          <h1 className="section-title">Hardware & Software Projects</h1>
          <p className="section-subtitle">
            Browse our catalog of published engineering prototypes, complete with technical abstracts, BOM specifications, schematics, and booking options.
          </p>
        </div>

        {/* Filter Bar Component */}
        <FilterBar 
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalResults={filteredProjects.length}
        />

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '2rem'
          }}>
            {filteredProjects.map((project) => (
              <ProjectCard 
                key={project.id}
                project={project}
                onViewDetails={onViewDetails}
                onBookProject={onBookProject}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="tech-card" style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            maxWidth: '560px',
            margin: '2rem auto',
            background: '#ffffff',
            border: '2px dashed #cbd5e1'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.25rem auto'
            }}>
              <AlertCircle size={30} color="#0284c7" />
            </div>
            <h3 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 800, marginBottom: '0.5rem' }}>
              {searchQuery ? 'No Matching Projects' : 'Project Catalog Ready'}
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              {searchQuery
                ? `No engineering projects matched "${searchQuery}" in category "${selectedCategory}".`
                : 'All default mock projects have been cleared. New projects published from the Admin Portal will appear here instantly.'}
            </p>
            {searchQuery ? (
              <button 
                onClick={() => { setSelectedCategory('All Projects'); setSearchQuery(''); }}
                className="btn btn-secondary btn-sm"
              >
                <RefreshCw size={14} />
                <span>Reset All Filters</span>
              </button>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};
