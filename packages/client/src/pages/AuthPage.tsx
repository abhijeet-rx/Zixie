import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, AlertCircle } from 'lucide-react';
import { ScaleIn, MotionButton } from '../components/motion/primitives';
import { api } from '../lib/api';
import { useApp } from '../context/AppContext';

export const AuthPage: React.FC = () => {
  const { setUser, refreshReport } = useApp();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.includes('@')) {
      setError('Enter a valid institutional email address.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setSubmitting(true);
    try {
      const response =
        mode === 'login'
          ? await api.login(email, password)
          : await api.register(name, email, password);

      setUser(response.user);
      await refreshReport();

      const returnUrl = window.sessionStorage.getItem('zixie_return_url') || '/';
      window.sessionStorage.removeItem('zixie_return_url');
      navigate(returnUrl, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-base)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
    >
      <ScaleIn
        className="zixie-card"
        style={{
          width: '100%',
          maxWidth: 400,
          padding: 'var(--space-8)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div
              className="mono"
              style={{
                width: 28,
                height: 28,
                borderRadius: 'var(--radius-control)',
                backgroundColor: 'var(--accent)',
                color: '#FAFAFA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
              }}
            >
              Z
            </div>
            <span style={{ fontWeight: 600, fontSize: 'var(--text-base)' }}>Zixie</span>
          </div>
          <h1 style={{ fontSize: 'var(--text-lg)' }}>
            {mode === 'login' ? 'Sign in to your workspace' : 'Create integrity reviewer account'}
          </h1>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
            Session-scoped academic code forensics. Cookie authentication is enforced.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-control)',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: 'var(--risk-collusion)',
              fontSize: 'var(--text-xs)',
            }}
          >
            <AlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
        >
          {mode === 'register' && (
            <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                Reviewer Name
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="zixie-input"
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  backgroundColor: 'var(--bg-base)',
                  color: 'var(--text-primary)',
                }}
              />
            </label>
          )}

          <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              Institutional Email
            </span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="zixie-input"
              style={{
                padding: 'var(--space-2) var(--space-3)',
                backgroundColor: 'var(--bg-base)',
                color: 'var(--text-primary)',
              }}
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              Password
            </span>
            <input
              type="password"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="zixie-input"
              style={{
                padding: 'var(--space-2) var(--space-3)',
                backgroundColor: 'var(--bg-base)',
                color: 'var(--text-primary)',
              }}
            />
          </label>

          <MotionButton
            type="submit"
            disabled={submitting}
            className="zixie-button"
            style={{
              padding: 'var(--space-2) var(--space-4)',
              backgroundColor: 'var(--accent)',
              borderColor: 'var(--accent)',
              color: '#FAFAFA',
              fontWeight: 500,
              cursor: submitting ? 'wait' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
            }}
          >
            <Lock size={14} />
            {submitting
              ? 'Authenticating...'
              : mode === 'login'
              ? 'Sign in'
              : 'Create account'}
          </MotionButton>
        </form>

        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: 'var(--space-4)',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <MotionButton
            type="button"
            onClick={() => {
              setMode((m) => (m === 'login' ? 'register' : 'login'));
              setError(null);
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: 'var(--text-xs)',
              cursor: 'pointer',
            }}
          >
            {mode === 'login'
              ? 'Need a reviewer account? Register'
              : 'Already have an account? Sign in'}
          </MotionButton>
        </div>
      </ScaleIn>
    </div>
  );
};
