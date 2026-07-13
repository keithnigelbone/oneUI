# Sign-Up Form Screen

A focused sign-up screen following OneUI composition conventions: `default` surface throughout (white canvas, the form is the content), single primary CTA, quiet supporting typography, and zero literals — every spacing/shape/color/type value is a design token.

## TSX

```tsx
import { Button } from '@oneui/ui';

export function SignUpScreen() {
  return (
    <main
      style={{
        maxWidth: '480px',
        margin: '0 auto',
        padding: 'var(--Spacing-Margin)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-8)',
      }}
    >
      {/* Heading — page title (Headline-L). One focal heading, no brand wash. */}
      <header style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)' }}>
        <h1
          style={{
            margin: 0,
            fontFamily: 'var(--Typography-Font-Primary)',
            fontSize: 'var(--Headline-L-FontSize)',
            lineHeight: 'var(--Headline-L-LineHeight)',
            fontWeight: 'var(--Headline-L-FontWeight)',
            color: 'var(--Text-High)',
          }}
        >
          Create your account
        </h1>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--Typography-Font-Primary)',
            fontSize: 'var(--Body-M-FontSize)',
            lineHeight: 'var(--Body-M-LineHeight)',
            fontWeight: 'var(--Body-FontWeight-Low)',
            color: 'var(--Text-Medium)',
          }}
        >
          Sign up to get started.
        </p>
      </header>

      {/* Form — default surface, generous field spacing */}
      <form style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}>
        {/* Email field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-1)' }}>
          <label
            htmlFor="signup-email"
            style={{
              fontFamily: 'var(--Typography-Font-Primary)',
              fontSize: 'var(--Label-S-FontSize)',
              lineHeight: 'var(--Label-S-LineHeight)',
              fontWeight: 'var(--Label-FontWeight-Medium)',
              color: 'var(--Text-High)',
            }}
          >
            Email
          </label>
          <input
            id="signup-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            style={{
              borderRadius: 'var(--Shape-2)',
              padding: 'var(--Spacing-2-5) var(--Spacing-4)',
              border: 'var(--Stroke-M) solid var(--Border-Default)',
              fontFamily: 'var(--Typography-Font-Primary)',
              fontSize: 'var(--Body-M-FontSize)',
              lineHeight: 'var(--Body-M-LineHeight)',
              color: 'var(--Text-High)',
              background: 'var(--Surface-Main)',
            }}
          />
        </div>

        {/* Password field */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-1)' }}>
          <label
            htmlFor="signup-password"
            style={{
              fontFamily: 'var(--Typography-Font-Primary)',
              fontSize: 'var(--Label-S-FontSize)',
              lineHeight: 'var(--Label-S-LineHeight)',
              fontWeight: 'var(--Label-FontWeight-Medium)',
              color: 'var(--Text-High)',
            }}
          >
            Password
          </label>
          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            style={{
              borderRadius: 'var(--Shape-2)',
              padding: 'var(--Spacing-2-5) var(--Spacing-4)',
              border: 'var(--Stroke-M) solid var(--Border-Default)',
              fontFamily: 'var(--Typography-Font-Primary)',
              fontSize: 'var(--Body-M-FontSize)',
              lineHeight: 'var(--Body-M-LineHeight)',
              color: 'var(--Text-High)',
              background: 'var(--Surface-Main)',
            }}
          />
        </div>

        {/* Primary submit — the single High-attention element on the screen */}
        <Button variant="bold" appearance="primary" size="l" fullWidth type="submit">
          Create account
        </Button>

        {/* Legal line — micro meta text, low emphasis, centered */}
        <p
          style={{
            margin: 0,
            textAlign: 'center',
            fontFamily: 'var(--Typography-Font-Primary)',
            fontSize: 'var(--Label-XS-FontSize)',
            lineHeight: 'var(--Label-XS-LineHeight)',
            fontWeight: 'var(--Label-FontWeight-Low)',
            color: 'var(--Text-Low)',
          }}
        >
          By signing up, you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>
    </main>
  );
}
```

## Composition notes

- **Surface**: `default` throughout — the form is the content, so no tinted/bold container. No `<Surface>` wrapper is needed because nothing sits on a non-default background (per the mandatory-Surface rule, a wrapper is only required for colored/dark backgrounds).
- **Attention pyramid**: exactly one High element — the bold primary submit button. Everything else stays None/Low (heading, labels, inputs, legal line), so the CTA is the unmistakable focal point.
- **Typography roles** (each pairs a size token with its line-height token and `--Typography-Font-Primary`):
  - Heading → `Headline-L` at `--Text-High`
  - Subtitle → `Body-M` / `Body-FontWeight-Low` at `--Text-Medium`
  - Field labels → `Label-S` / `Label-FontWeight-Medium`
  - Input text → `Body-M`
  - Legal line → `Label-XS` / `Label-FontWeight-Low` at `--Text-Low` (de-emphasized meta text)
- **Shape**: inputs use `--Shape-2` (8px, subtle container rounding per the shape table); the Button defaults to `--Shape-Pill` (Jio identity) via its own component token.
- **Spacing**: `--Spacing-8` between heading block and form (card-group separation), `--Spacing-5` between fields, `--Spacing-1` between label and input, `--Spacing-Margin` for the page edge.
- **Color**: primary brand color appears only on the submit button. `Border-Default` on inputs, `Text-High/Medium/Low` for the type hierarchy. No literals — all values are tokens.
- The `Button` component handles its own focus halo, hover/pressed states, and on-fill text token, so no per-element color logic is needed.
```
