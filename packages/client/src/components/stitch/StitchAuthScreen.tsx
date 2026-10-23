import { useState, type FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, Fingerprint, Mail, ShieldCheck, UserRound } from 'lucide-react';

export interface AuthFormData { mode: 'login' | 'register'; name: string; email: string; password: string }
interface StitchAuthScreenProps { onSubmit: (data: AuthFormData) => Promise<void>; loading?: boolean; error?: string }

export function StitchAuthScreen({ onSubmit, loading = false, error = '' }: StitchAuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit({ mode, name, email, password });
  };

  return (
    <main className="z-auth-page">
      <header className="z-auth-nav"><a href="/auth" className="z-auth-brand"><span className="z-mark">z</span><strong>zixie</strong></a><span className="z-auth-secure"><i /> Private workspace</span></header>
      <div className="z-auth-layout">
        <section className="z-auth-story">
          <span className="z-eyebrow"><span className="z-eyebrow-mark" /> CODE INTEGRITY WORKSPACE</span>
          <h1>See the work.<br /><em>Understand the pattern.</em></h1>
          <p>Compare code submissions with context, so unusual overlap becomes a useful starting point for a fair review.</p>
          <div className="z-auth-proof">
            <div><span><Fingerprint size={17} /></span><b>Structural matching</b><small>Find overlap beyond renamed variables.</small></div>
            <div><span><ShieldCheck size={17} /></span><b>Human review, supported</b><small>Keep signals in their proper context.</small></div>
          </div>
          <div className="z-auth-quote"><span>“</span><p>Clear evidence makes careful decisions possible.</p><small>THE ZIXIE WORKSPACE</small></div>
        </section>
        <section className="z-auth-card">
          <div className="z-auth-card-head"><span className="z-auth-lock"><ShieldCheck size={17} /></span><span className="z-auth-card-kicker">INSTRUCTOR ACCESS</span><h2>{mode === 'login' ? 'Welcome back.' : 'Create your account.'}</h2><p>{mode === 'login' ? 'Sign in to your Zixie workspace.' : 'Set up a workspace to review your cohort.'}</p></div>
          <div className="z-auth-divider"><span>{mode === 'login' ? 'ACCOUNT SIGN IN' : 'NEW ACCOUNT'}</span></div>
          <form className="z-auth-form" onSubmit={(event) => void submit(event)}>
            {mode === 'register' && <><label htmlFor="z-auth-name">Name</label><div className="z-auth-input"><UserRound size={15} /><input id="z-auth-name" type="text" autoComplete="name" placeholder="Your name" value={name} onChange={(event) => setName(event.target.value)} required minLength={1} maxLength={80} /></div></>}
            <label htmlFor="z-auth-email">Email</label>
            <div className="z-auth-input"><Mail size={15} /><input id="z-auth-email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} /></div>
            <label htmlFor="z-auth-password">Password</label>
            <div className="z-auth-input"><ShieldCheck size={15} /><input id="z-auth-password" type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} maxLength={128} /><button type="button" className="z-password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button></div>
            {error && <p className="z-auth-error" role="alert">{error}</p>}
            <button className="z-auth-submit" type="submit" disabled={loading}>{loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} {!loading && <ArrowRight size={15} />}</button>
          </form>
          <p className="z-auth-switch">{mode === 'login' ? 'New to Zixie?' : 'Already have an account?'} <button type="button" onClick={() => setMode((current) => current === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></p>
          <div className="z-auth-legal"><ShieldCheck size={13} /><span>Passwords are hashed on the server. Session cookies are HttpOnly.</span></div>
        </section>
      </div>
      <footer className="z-auth-footer"><span>© 2026 Zixie</span><span>Thoughtful code review, grounded in evidence.</span></footer>
    </main>
  );
}
