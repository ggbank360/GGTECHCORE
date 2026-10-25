import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail,
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  X, 
  Eye, 
  EyeOff,
  Sparkles
} from 'lucide-react';
import { auth, signInWithEmailAndPassword, signInAnonymously, isFirebaseConfigured } from '../services/firebase';

export const MASTER_PASSCODE = 'ggtechcore360';

export const AdminLoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState('firebase'); // 'firebase' | 'passcode'
  const [email, setEmail] = useState('ggbank360@gmail.com');
  const [password, setPassword] = useState('');
  const [passcode, setPasscode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleFirebaseAuthLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (!isFirebaseConfigured() || !auth) {
        throw new Error('Firebase Authentication is not initialized or configured.');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      setSuccessMessage('Firebase Authentication confirmed! Loading Command Center...');
      setTimeout(() => {
        setLoading(false);
        onLoginSuccess(userCredential.user);
      }, 400);
    } catch (err) {
      setLoading(false);
      console.error('Firebase Auth sign in failed with code:', err?.code || 'unknown', err);
      const code = err?.code;
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        setError('Invalid Firebase email or password. You can also switch to Master Passcode access below.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please wait a moment or use the Master Passcode bypass.');
      } else {
        setError(err.message || 'Firebase login failed. Please verify credentials or use Master Passcode.');
      }
    }
  };

  const handleMasterLogin = async (e) => {
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
      let authUser = {
        email: 'ggbank360@gmail.com',
        uid: 'master_admin',
        displayName: 'GG TECHCORE Lead Admin',
        isMasterAdmin: true
      };

      // Sign in via Firebase Auth so request.auth is valid for Firestore security rules
      if (isFirebaseConfigured() && auth) {
        try {
          const userCredential = await signInWithEmailAndPassword(auth, 'ggbank360@gmail.com', 'ggtechcore360');
          authUser = userCredential.user;
          console.info('Master Passcode successfully authenticated with Firebase Auth (ggbank360@gmail.com).');
        } catch (authErr) {
          console.warn('Firebase email/password sign-in with master credentials failed, attempting anonymous auth fallback:', authErr?.code || authErr);
          try {
            const anonCredential = await signInAnonymously(auth);
            authUser = anonCredential.user;
            console.info('Master Passcode authenticated anonymously with Firebase Auth.');
          } catch (anonErr) {
            console.warn('Firebase anonymous sign in also failed:', anonErr?.code || anonErr);
          }
        }
      }

      setSuccessMessage('Master authorization confirmed! Redirecting to Command Center...');
      setTimeout(() => {
        setLoading(false);
        onLoginSuccess(authUser);
      }, 400);
    } else {
      setTimeout(() => {
        setLoading(false);
        setError('Invalid Master Passcode. Please check your credentials and try again.');
      }, 300);
    }
  };

  const handleCloseModal = () => {
    setPassword('');
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
          maxWidth: '460px', 
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
                Admin Command Center
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#0284c7', fontFamily: 'var(--font-sub)', fontWeight: 700 }}>
                {authMode === 'firebase' ? 'Firebase Auth Gateway (Recommended)' : 'Master Passcode Bypass'}
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
              justifyContent: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Auth Mode Tabs */}
        <div style={{
          display: 'flex',
          background: '#f1f5f9',
          padding: '4px',
          margin: '1.25rem 1.5rem 0 1.5rem',
          borderRadius: '10px'
        }}>
          <button
            type="button"
            onClick={() => { setAuthMode('firebase'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              background: authMode === 'firebase' ? '#ffffff' : 'transparent',
              color: authMode === 'firebase' ? '#0284c7' : '#64748b',
              boxShadow: authMode === 'firebase' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Firebase Auth (Admin)
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('passcode'); setError(''); }}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              background: authMode === 'passcode' ? '#ffffff' : 'transparent',
              color: authMode === 'passcode' ? '#0284c7' : '#64748b',
              boxShadow: authMode === 'passcode' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
            }}
          >
            Master Passcode
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.25rem 1.5rem 1.5rem 1.5rem' }}>
          {authMode === 'firebase' && (
            <div style={{
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '10px',
              padding: '0.75rem 0.9rem',
              fontSize: '0.82rem',
              color: '#0369a1',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              lineHeight: 1.4
            }}>
              <Sparkles size={16} color="#0284c7" style={{ flexShrink: 0 }} />
              <div>
                Authenticates with <strong>ggbank360@gmail.com</strong> for secure Firestore rules authorization.
              </div>
            </div>
          )}

          {authMode === 'passcode' && (
            <div style={{
              background: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: '10px',
              padding: '0.75rem 0.9rem',
              fontSize: '0.82rem',
              color: '#92400e',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              lineHeight: 1.4
            }}>
              <ShieldCheck size={16} color="#d97706" style={{ flexShrink: 0 }} />
              <div>
                Quick access via the configured master administrator passcode.
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '0.8rem',
              borderRadius: '10px',
              background: '#ffe4e6',
              border: '1px solid #fecdd3',
              color: '#e11d48',
              fontSize: '0.84rem',
              lineHeight: 1.4,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              marginBottom: '1.25rem'
            }}>
              <AlertCircle size={16} color="#e11d48" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{error}</div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div style={{
              padding: '0.8rem',
              borderRadius: '10px',
              background: '#dcfce7',
              border: '1px solid #86efac',
              color: '#15803d',
              fontSize: '0.84rem',
              lineHeight: 1.4,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              marginBottom: '1.25rem'
            }}>
              <CheckCircle2 size={16} color="#15803d" style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{successMessage}</div>
            </div>
          )}

          {/* Mode 1: Firebase Auth Form */}
          {authMode === 'firebase' ? (
            <form onSubmit={handleFirebaseAuthLogin}>
              <div className="form-group" style={{ marginBottom: '1.15rem' }}>
                <label className="form-label required" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Admin Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#0284c7' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ggbank360@gmail.com"
                    className="form-input"
                    style={{ paddingLeft: '2.6rem', height: '46px', fontSize: '0.92rem', borderRadius: '10px', border: '1.5px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label required" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#0284c7' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password..."
                    className="form-input"
                    style={{ paddingLeft: '2.6rem', paddingRight: '2.75rem', height: '46px', fontSize: '0.92rem', borderRadius: '10px', border: '1.5px solid #cbd5e1' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      color: '#64748b',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ 
                  width: '100%', 
                  padding: '0.85rem', 
                  height: '48px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Signing in to Firebase...</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={18} />
                    <span>Authenticate with Firebase</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Mode 2: Master Passcode Form */
            <form onSubmit={handleMasterLogin}>
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label className="form-label required" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Master Security Passcode
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#0284c7' }} />
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    required
                    autoFocus
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="Enter master passcode..."
                    className="form-input"
                    style={{ paddingLeft: '2.6rem', paddingRight: '2.75rem', height: '46px', fontSize: '0.92rem', borderRadius: '10px', border: '1.5px solid #cbd5e1' }}
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
                      padding: '4px'
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
                  padding: '0.85rem', 
                  height: '48px',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)'
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={18} />
                    <span>Authorize Master Passcode</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
