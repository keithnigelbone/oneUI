'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Input } from '@oneui/ui/components/Input';
import { Button } from '@oneui/ui/components/Button';
import { authClient } from '@/lib/auth-client';

type Mode = 'signin' | 'signup';

const labelStyle = {
  fontSize: 'var(--Body-S-FontSize)',
  fontFamily: 'var(--Body-FontFamily, var(--Typography-Font-Text))',
  color: 'var(--Text-Low)',
  textAlign: 'center' as const,
};

// Pre-auth screen: this route is OUTSIDE the platform layout, so the brand-CSS
// engine never injects here and colour tokens would resolve to nothing (the
// "strange" look). We supply MyJio (Jio blue) brand values for the tokens the
// page + OneUI Input/Button read. Accepted pre-injection exception, like the
// layout loading spinner. Adjust the hexes to exact MyJio brand values if needed.
const MYJIO_THEME = {
  '--Surface-Main': '#FFFFFF',
  '--Surface-Subtle': '#F4F6FB',
  '--Surface-Elevated': '#FFFFFF',
  '--Text-High': '#0B1020',
  '--Text-Medium': '#3A4153',
  '--Text-Low': '#6B7184',
  '--Border-Subtle': '#DEE2EC',
  '--Border-Medium': '#C6CCDA',
  '--Negative-Tinted': '#D32F2F',
  '--Primary-Bold': '#0C2074',
  '--Primary-Bold-High': '#FFFFFF',
  '--Primary-Bold-Hover': '#15309A',
  '--Primary-Bold-Pressed': '#091654',
  '--Primary-TintedA11y': '#0C2074',
  '--Focus-Outline': '#3550C9',
} as React.CSSProperties;

/** Map Better Auth error codes to human copy; falls back to the raw message. */
function friendlyAuthError(
  code: string | undefined,
  message: string | undefined,
  mode: Mode,
): string {
  switch (code) {
    case 'INVALID_EMAIL_OR_PASSWORD':
      return 'Incorrect email or password.';
    case 'USER_ALREADY_EXISTS':
      return 'An account with this email already exists — switch to "Sign in" below.';
    case 'PASSWORD_TOO_SHORT':
      return 'Password is too short — use at least 8 characters.';
    case 'INVALID_EMAIL':
      return 'Enter a valid email address.';
    default:
      return message ?? (mode === 'signup' ? 'Could not create the account' : 'Sign-in failed');
  }
}

function AuthForm() {
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<Mode>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = searchParams.get('from') ?? '/';

  useEffect(() => {
    document.getElementById('auth-email')?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result =
        mode === 'signup'
          ? await authClient.signUp.email({ email, password, name: name || email })
          : await authClient.signIn.email({ email, password });

      if (result.error) {
        setError(friendlyAuthError(result.error.code, result.error.message, mode));
        setLoading(false);
        document.getElementById('auth-email')?.focus();
        return;
      }
      window.location.href = from;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setLoading(false);
    }
  }

  return (
    <div style={{
      ...MYJIO_THEME,
      minHeight: '100dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--Surface-Main)',
      fontFamily: 'var(--font-inter, system-ui, -apple-system, sans-serif)',
    }}>
      <div style={{ width: '100%', maxWidth: '320px', padding: '0 24px' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '40px',
          gap: '14px',
        }}>
          <img
            src="/JioLogo.svg"
            alt="OneUIStudio"
            width="52"
            height="52"
          />
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 'var(--Body-L-FontSize)',
              fontWeight: 'var(--Body-FontWeight-High)',
              fontFamily: 'var(--Body-FontFamily, var(--Typography-Font-Text))',
              color: 'var(--Text-High)',
              letterSpacing: '-0.3px',
            }}>
              OneUIStudio
            </div>
            <div style={{
              fontSize: 'var(--Body-S-FontSize)',
              fontFamily: 'var(--Body-FontFamily, var(--Typography-Font-Text))',
              color: 'var(--Text-Low)',
              marginTop: '3px',
            }}>
              {mode === 'signup' ? 'Create your account' : 'Sign in to continue'}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)' }}>
          {mode === 'signup' && (
            <Input
              id="auth-name"
              type="text"
              value={name}
              onChange={(value) => setName(value)}
              placeholder="Name"
              autoComplete="name"
              disabled={loading}
            />
          )}
          <Input
            id="auth-email"
            type="email"
            value={email}
            onChange={(value) => setEmail(value)}
            placeholder="Email"
            autoComplete="email"
            required
            disabled={loading}
          />
          <Input
            id="auth-password"
            type="password"
            value={password}
            onChange={(value) => setPassword(value)}
            placeholder="Password"
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            required
            disabled={loading}
          />

          <p
            role={error ? 'alert' : undefined}
            aria-live="polite"
            style={{
              margin: '2px 0 0',
              minHeight: 'var(--Body-S-LineHeight)',
              fontSize: 'var(--Body-S-FontSize)',
              lineHeight: 'var(--Body-S-LineHeight)',
              fontFamily: 'var(--Body-FontFamily, var(--Typography-Font-Text))',
              color: 'var(--Negative-Tinted)',
              textAlign: 'center',
            }}
          >
            {error}
          </p>

          <Button
            type="submit"
            attention="high"
            disabled={loading || !email || !password}
            loading={loading}
            style={{ marginTop: 'var(--Spacing-2)', width: '100%' }}
          >
            {loading ? 'Please wait…' : mode === 'signup' ? 'Create account' : 'Continue'}
          </Button>
        </form>

        {mode === 'signup' && (
          <p
            style={{
              ...labelStyle,
              margin: 'var(--Spacing-3) 0 0',
              lineHeight: 'var(--Body-S-LineHeight)',
            }}
          >
            New accounts start with view-only access. Ask an admin to invite
            you to a brand.
          </p>
        )}

        <button
          type="button"
          onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(''); }}
          style={{
            ...labelStyle,
            display: 'block',
            width: '100%',
            marginTop: 'var(--Spacing-4)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          {mode === 'signup'
            ? 'Already have an account? Sign in'
            : "Don't have an account? Sign up"}
        </button>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense>
      <AuthForm />
    </Suspense>
  );
}
