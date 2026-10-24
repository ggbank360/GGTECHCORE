import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, AlertCircle, Loader2, X, KeyRound } from 'lucide-react';
import { auth, signInWithEmailAndPassword, isFirebaseConfigured } from '../services/firebase';

export const AdminLoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [email, setEmail] = useState('ggbank360@gmail.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!isFirebaseConfigured() || !auth) {
        throw new Error('Firebase Authentication is not configured.');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      onLoginSuccess(userCredential.user);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify admin email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '440px', background: '#ffffff', color: '#0f172a' }}
      >
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={20} color="#0284c7" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 800 }}>Admin Access</h3>
              <div style={{ fontSize: '0.75rem', color: '#0284c7', fontFamily: 'var(--font-sub)', fontWeight: 700 }}>
                Firebase Auth & Security Gateway
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.75rem' }}>
          <div className="form-group">
            <label className="form-label required">Administrator Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#0284c7' }} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ggbank360@gmail.com"
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label required">Security Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#0284c7' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          {error && (
            <div style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: '#ffe4e6',
              border: '1px solid #fecdd3',
              color: '#e11d48',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              <AlertCircle size={16} color="#e11d48" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Authenticating...</span>
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
  );
};
