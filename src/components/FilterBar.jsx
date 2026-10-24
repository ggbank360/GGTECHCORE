import React from 'react';
import { Search, X, Filter } from 'lucide-react';
import { projectCategories } from '../data/seedProjects';

export const FilterBar = ({ 
  selectedCategory, 
  onSelectCategory, 
  searchQuery, 
  onSearchChange,
  totalResults 
}) => {
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      {/* Search Input Box */}
      <div style={{
        position: 'relative',
        maxWidth: '650px',
        margin: '0 auto 1.5rem auto'
      }}>
        <Search 
          size={18} 
          style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#0284c7'
          }} 
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by keyword, microcontroller (ESP32, STM32), algorithm, or protocol..."
          className="form-input"
          style={{
            paddingLeft: '2.75rem',
            paddingRight: searchQuery ? '2.5rem' : '1rem',
            height: '48px',
            fontSize: '0.95rem',
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '9999px',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.05)',
            color: '#0f172a'
          }}
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            style={{
              position: 'absolute',
              right: '0.85rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Clear search"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Category Pills Strip */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {projectCategories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              style={{
                padding: '0.45rem 1rem',
                fontFamily: 'var(--font-sub)',
                fontSize: '0.86rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                borderRadius: '9999px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: isSelected 
                  ? 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' 
                  : '#ffffff',
                color: isSelected ? '#ffffff' : '#334155',
                border: '1px solid',
                borderColor: isSelected ? '#0284c7' : '#cbd5e1',
                boxShadow: isSelected ? '0 4px 12px rgba(2, 132, 199, 0.25)' : '0 1px 2px rgba(0,0,0,0.04)'
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Result Count Indicator */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        marginTop: '1.25rem',
        fontSize: '0.85rem',
        color: '#64748b',
        fontFamily: 'var(--font-sub)',
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        fontWeight: 600
      }}>
        <Filter size={14} color="#0284c7" />
        <span>Displaying {totalResults} technical engineering {totalResults === 1 ? 'project' : 'projects'}</span>
      </div>
    </div>
  );
};
