import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  X, 
  Eye, 
  EyeOff,
  Sparkles
} from 'lucide-react';

export const MASTER_PASSCODE = 'ggtechcore360';

export const AdminLoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleMasterLogin = (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    const entered = passcode.trim();

    if (!entered) {
      setError('Please enter the Master Security Passcode.');
      setLoading(false);
      return;
    }

    if (entered === MASTER_PASSCODE) {
      setSuccessMessage('Master authorization confirmed! Redirecting to Command Center...');
      setTimeout(() => {
        setLoading(false);
        onLoginSuccess({
          email: 'ggbank360@gmail.com',
          uid: 'master_admin',
          displayName: 'GG TECHCORE Lead Admin',
          isMasterAdmin: true
        });
      }, 500);
    } else {
      setTimeout(() => {
        setLoading(false);
        setError('Invalid Master Passcode. Please check your credentials and try again.');
      }, 300);
    }
  };

  const handleCloseModal = () => {
    setPasscode('');
    setError('');
    setSuccessMessage('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleCloseModal}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          maxWidth: '440px', 
          background: '#ffffff', 
          color: '#0f172a', 
          borderRadius: '16px', 
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid #e2e8f0'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)'
            }}>
              <ShieldCheck size={24} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', color: '#0f172a', fontWeight: 800, margin: 0, letterSpacing: '-0.01em' }}>
                Master Admin Portal
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#0284c7', fontFamily: 'var(--font-sub)', fontWeight: 700 }}>
                Master Access Security Gateway
              </div>
            </div>
          </div>

          <button 
            onClick={handleCloseModal}
            aria-label="Close"
            style={{
              background: '#f1f5f9',
              border: 'none',
              borderRadius: '8px',
              color: '#64748b',
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.75rem 1.5rem' }}>
          {/* Informative Security Banner */}
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '10px',
            padding: '0.85rem 1rem',
            fontSize: '0.82rem',
            color: '#0369a1',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            lineHeight: 1.45
          }}>
            <Sparkles size={18} color="#0284c7" style={{ flexShrink: 0 }} />
            <div>
              Enter the authorized <strong>Master Passcode</strong> to access the GG TECHCORE Command Center.
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '0.85rem',
              borderRadius: '10px',
              background: '#ffe4e6',
              border: '1px solid #fecdd3',
              color: '#e11d48',
              fontSize: '0.84rem',
              lineHeight: 1.45,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={18} color="#e11d48" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{error}</div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div style={{
              padding: '0.85rem',
              borderRadius: '10px',
              background: '#dcfce7',
              border: '1px solid #86efac',
              color: '#15803d',
              fontSize: '0.84rem',
              lineHeight: 1.45,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.6rem',
              marginBottom: '1.25rem'
            }}>
              <CheckCircle2 size={18} color="#15803d" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{successMessage}</div>
            </div>
          )}

          {/* Master Login Form */}
          <form onSubmit={handleMasterLogin}>
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label 
                className="form-label required" 
                style={{ 
                  display: 'block', 
                  fontSize: '0.82rem', 
                  fontWeight: 700, 
                  color: '#334155', 
                  marginBottom: '0.5rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                Master Security Passcode
              </label>
              <div style={{ position: 'relative' }}>
                <Lock 
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
                  type={showPasscode ? 'text' : 'password'}
                  required
                  autoFocus
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter master passcode..."
                  className="form-input"
                  style={{ 
                    paddingLeft: '2.6rem',
                    paddingRight: '2.75rem',
                    height: '46px',
                    fontSize: '0.95rem',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPasscode(!showPasscode)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  title={showPasscode ? 'Hide passcode' : 'Show passcode'}
                >
                  {showPasscode ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ 
                width: '100%', 
                padding: '0.85rem 1.25rem', 
                height: '48px',
                fontSize: '0.95rem',
                fontWeight: 700,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)'
              }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Verifying Master Credentials...</span>
                </>
              ) : (
                <>
                  <KeyRound size={18} />
                  <span>Authenticate & Access Dashboard</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
