import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  X, 
  KeyRound, 
  UserPlus, 
  Send, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  isFirebaseConfigured 
} from '../services/firebase';

const EMERGENCY_MASTER_PASSCODE = 'ggtechcore360';

export const AdminLoginModal = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState('signin'); // 'signin' | 'register' | 'forgot' | 'emergency'
  const [email, setEmail] = useState('ggbank360@gmail.com');
  const [password, setPassword] = useState('');
  const [emergencyCode, setEmergencyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const formatFirebaseError = (err) => {
    const code = err.code || '';
    const msg = err.message || '';

    if (code === 'auth/invalid-credential' || msg.includes('auth/invalid-credential')) {
      return 'Invalid credentials. Either the password is incorrect, or this account has not been created in Firebase yet. Click "First-Time Setup" above to create it or "Forgot Password" to reset.';
    }
    if (code === 'auth/user-not-found' || msg.includes('user-not-found')) {
      return 'No account found with this email. Click "First-Time Setup" above to register it.';
    }
    if (code === 'auth/wrong-password' || msg.includes('wrong-password')) {
      return 'Incorrect password. Click "Forgot Password" below to send a reset link to your email.';
    }
    if (code === 'auth/email-already-in-use' || msg.includes('email-already-in-use')) {
      return 'This admin email is already registered in Firebase. Switch to "Sign In" or click "Forgot Password" to reset.';
    }
    if (code === 'auth/weak-password' || msg.includes('weak-password')) {
      return 'Password should be at least 6 characters long.';
    }
    if (code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed')) {
      return 'Email/Password sign-in provider is not enabled in Firebase Console (Authentication > Sign-in method). Enable it or use the Emergency Passcode below.';
    }
    if (code === 'auth/too-many-requests' || msg.includes('too-many-requests')) {
      return 'Access temporarily blocked due to many failed attempts. Try again later or reset your password.';
    }
    if (code === 'auth/network-request-failed' || msg.includes('network-request-failed')) {
      return 'Network connectivity error contacting Firebase. Check your internet connection or use Emergency Access.';
    }
    return msg || 'Authentication failed. Please verify credentials.';
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (!isFirebaseConfigured() || !auth) {
        throw new Error('Firebase Authentication is not configured.');
      }

      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      onLoginSuccess(userCredential.user);
    } catch (err) {
      console.warn('Admin sign-in error:', err);
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (!isFirebaseConfigured() || !auth) {
        throw new Error('Firebase Authentication is not configured.');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      setSuccessMessage('Admin account created successfully! Logging you in...');
      setTimeout(() => {
        onLoginSuccess(userCredential.user);
      }, 700);
    } catch (err) {
      console.warn('Admin registration error:', err);
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (!isFirebaseConfigured() || !auth) {
        throw new Error('Firebase Authentication is not configured.');
      }
      if (!email.trim()) {
        throw new Error('Please enter your administrator email.');
      }

      await sendPasswordResetEmail(auth, email.trim());
      setSuccessMessage(`Password reset link dispatched to ${email.trim()}! Please check your inbox or spam folder.`);
    } catch (err) {
      console.warn('Password reset error:', err);
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyAccess = (e) => {
    e.preventDefault();
    setError('');

    if (emergencyCode.trim() === EMERGENCY_MASTER_PASSCODE) {
      setSuccessMessage('Emergency authorization granted. Redirecting to dashboard...');
      setTimeout(() => {
        onLoginSuccess({
          email: email.trim() || 'ggbank360@gmail.com',
          uid: 'emergency_master_admin',
          displayName: 'GG TECHCORE Lead Admin',
          isEmergencyMaster: true
        });
      }, 500);
    } else {
      setError(`Invalid Emergency Passcode. Hint: default emergency key is "${EMERGENCY_MASTER_PASSCODE}".`);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '460px', background: '#ffffff', color: '#0f172a', borderRadius: '16px', overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#f8fafc'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShieldCheck size={22} color="#0284c7" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 800, margin: 0 }}>Admin Portal</h3>
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
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e2e8f0',
          background: '#f1f5f9'
        }}>
          <button
            onClick={() => { setMode('signin'); setError(''); setSuccessMessage(''); }}
            style={{
              flex: 1,
              padding: '0.75rem 0.5rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              fontFamily: 'var(--font-sub)',
              background: mode === 'signin' ? '#ffffff' : 'transparent',
              color: mode === 'signin' ? '#0284c7' : '#64748b',
              border: 'none',
              borderBottom: mode === 'signin' ? '2px solid #0284c7' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Sign In
          </button>

          <button
            onClick={() => { setMode('register'); setError(''); setSuccessMessage(''); }}
            style={{
              flex: 1,
              padding: '0.75rem 0.5rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              fontFamily: 'var(--font-sub)',
              background: mode === 'register' ? '#ffffff' : 'transparent',
              color: mode === 'register' ? '#0284c7' : '#64748b',
              border: 'none',
              borderBottom: mode === 'register' ? '2px solid #0284c7' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            First-Time Setup
          </button>

          <button
            onClick={() => { setMode('forgot'); setError(''); setSuccessMessage(''); }}
            style={{
              flex: 1,
              padding: '0.75rem 0.5rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              fontFamily: 'var(--font-sub)',
              background: mode === 'forgot' ? '#ffffff' : 'transparent',
              color: mode === 'forgot' ? '#0284c7' : '#64748b',
              border: 'none',
              borderBottom: mode === 'forgot' ? '2px solid #0284c7' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            Reset Key
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem' }}>
          {/* Notifications */}
          {error && (
            <div style={{
              padding: '0.85rem',
              borderRadius: 'var(--radius-sm)',
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

          {successMessage && (
            <div style={{
              padding: '0.85rem',
              borderRadius: 'var(--radius-sm)',
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

          {/* 1. SIGN IN MODE */}
          {mode === 'signin' && (
            <form onSubmit={handleSignIn}>
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label required">Security Password</label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(''); setSuccessMessage(''); }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#0284c7',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#0284c7' }} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password..."
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
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
                    <span>Authenticate & Access Dashboard</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* 2. FIRST-TIME SETUP / REGISTER MODE */}
          {mode === 'register' && (
            <form onSubmit={handleRegister}>
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem',
                fontSize: '0.82rem',
                color: '#166534',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Sparkles size={16} color="#166534" style={{ flexShrink: 0 }} />
                <span>
                  First time setting up your Firebase project? Register <strong>{email}</strong> here to create your initial admin credentials.
                </span>
              </div>

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
                <label className="form-label required">Create New Password (min 6 characters)</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#0284c7' }} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Set your secure password..."
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Registering Admin Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={18} />
                    <span>Create & Initialize Admin Account</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* 3. FORGOT PASSWORD MODE */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword}>
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem',
                fontSize: '0.82rem',
                color: '#1e40af',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <HelpCircle size={16} color="#1e40af" style={{ flexShrink: 0 }} />
                <span>
                  Enter your email address to receive an official Firebase password reset link.
                </span>
              </div>

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

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Send Password Reset Link</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* 4. EMERGENCY PASSCODE FALLBACK */}
          {mode === 'emergency' && (
            <form onSubmit={handleEmergencyAccess}>
              <div style={{
                background: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: 'var(--radius-sm)',
                padding: '0.75rem',
                fontSize: '0.82rem',
                color: '#92400e',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem'
              }}>
                <ShieldCheck size={18} color="#92400e" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong>Emergency Master Bypass:</strong> Use this if Firebase Authentication services are temporarily unreachable or restricted by firewall.
                </div>
              </div>

              <div className="form-group">
                <label className="form-label required">Master Emergency Passcode</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#d97706' }} />
                  <input
                    type="password"
                    required
                    value={emergencyCode}
                    onChange={(e) => setEmergencyCode(e.target.value)}
                    placeholder={`Enter passcode (${EMERGENCY_MASTER_PASSCODE})`}
                    className="form-input"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', marginTop: '0.5rem', background: '#d97706', borderColor: '#b45309' }}
              >
                <ShieldCheck size={18} />
                <span>Authorize Master Bypass</span>
              </button>
            </form>
          )}

          {/* Emergency Bypass Footer Toggle */}
          <div style={{
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem',
            color: '#64748b'
          }}>
            <span>Trouble connecting to Firebase?</span>
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'emergency' ? 'signin' : 'emergency');
                setError('');
                setSuccessMessage('');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: mode === 'emergency' ? '#0284c7' : '#d97706',
                fontWeight: 700,
                cursor: 'pointer',
                padding: '2px 6px',
                borderRadius: '4px'
              }}
            >
              {mode === 'emergency' ? '← Back to Firebase Login' : 'Emergency Master Access →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
