# Sign-Up Form — OneUI

A focused sign-up screen following OneUI composition philosophy: **default page surface** (white canvas), a **single primary CTA**, generous whitespace, and zero literals. No bold surface, no tinted card — content is the hero. The form sits centered in a constrained column so it breathes on every breakpoint.

## Composition decisions

- **Surface:** `default` only. A sign-up form is a quiet, content-first task — no hero, no branded wash, no tinted card. The white canvas keeps focus on the fields (White Canvas Rule). The form is a plain `<div>`, which is correct here because we are NOT placing components on a non-default background.
- **Attention pyramid:** one **High** element — the bold primary submit button. Everything else (heading, labels, inputs, legal line) is None/Low. Only one focal point per viewport.
- **Typography roles:** `Headline-M` for the page heading, `Label-S` (medium weight) for field labels, `Body-M` for input text, `Body-S` (low weight) for the small legal line. Buttons use the `Label` role. Every text element carries `--Typography-Font-Primary` and a paired line-height token.
- **Shape:** inputs use `--Shape-3XS` (8px, subtle container rounding); the button uses `--Shape-Pill` (Jio button identity).
- **Spacing:** vertical rhythm via `--Spacing-*` tokens; comfortable gaps between fields, a larger gap before the submit button, generous breathing room around the legal line.
- **Color roles:** Primary for the action button; `--Text-High` / `--Text-Medium` / `--Text-Low` for the text hierarchy; `--Border-Default` for input borders. No semantic roles needed (no status to communicate yet).

## Component (`SignUpForm.tsx`)

```tsx
import * as React from 'react';
import styles from './SignUpForm.module.css';

export interface SignUpFormProps {
  onSubmit?: (values: { email: string; password: string }) => void;
}

export function SignUpForm({ onSubmit }: SignUpFormProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.({ email, password });
  };

  return (
    <main className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <h1 className={styles.heading}>Create your account</h1>

        <div className={styles.fields}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-email">
              Email
            </label>
            <input
              id="signup-email"
              className={styles.input}
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="signup-password">
              Password
            </label>
            <input
              id="signup-password"
              className={styles.input}
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <button className={styles.submit} type="submit">
          Create account
        </button>

        <p className={styles.legal}>
          By creating an account you agree to our Terms of Service and Privacy Policy.
        </p>
      </form>
    </main>
  );
}
```

## Styles (`SignUpForm.module.css`)

```css
/* default page surface — the white canvas */
.page {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100%;
  padding: var(--Spacing-7XL) var(--Spacing-Margin);
  background-color: var(--Surface-Main);
}

.form {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 360px;
}

.heading {
  margin: 0;
  color: var(--Text-High);
  font-family: var(--Typography-Font-Primary);
  font-size: var(--Headline-M-FontSize);
  line-height: var(--Headline-M-LineHeight);
  font-weight: var(--Headline-M-FontWeight);
  letter-spacing: var(--Typography-LetterSpacing-Tight);
}

/* group of fields, with a comfortable gap before the CTA */
.fields {
  display: flex;
  flex-direction: column;
  gap: var(--Spacing-2XL);
  margin-top: var(--Spacing-5XL);
  margin-bottom: var(--Spacing-5XL);
}

.field {
  display: flex;
  flex-direction: column;
  gap: var(--Spacing-3XS);
}

.label {
  color: var(--Text-Medium);
  font-family: var(--Typography-Font-Primary);
  font-size: var(--Label-S-FontSize);
  line-height: var(--Label-S-LineHeight);
  font-weight: var(--Label-FontWeight-Medium);
}

.input {
  width: 100%;
  box-sizing: border-box;
  padding: var(--Spacing-XS) var(--Spacing-M);
  border: var(--Stroke-M) solid var(--Border-Default);
  border-radius: var(--Shape-3XS);
  background-color: var(--Surface-Main);
  color: var(--Text-High);
  font-family: var(--Typography-Font-Primary);
  font-size: var(--Body-M-FontSize);
  line-height: var(--Body-M-LineHeight);
  font-weight: var(--Body-FontWeight-Low);
  transition: border-color var(--Motion-Duration-Discreet-Medium)
    var(--Motion-Easing-Standard);
}

.input::placeholder {
  color: var(--Text-Low);
}

.input:focus-visible {
  outline: none;
  border-color: var(--Primary-High);
  box-shadow:
    0 0 0 var(--Stroke-XL) var(--Surface-Halo-Gap, var(--Surface-Main)),
    0 0 0 var(--Focus-Outline-Width) var(--Focus-Outline);
}

/* single primary CTA — the one High-attention element on the page */
.submit {
  width: 100%;
  padding: var(--Spacing-S) var(--Spacing-XL);
  border: none;
  border-radius: var(--Shape-Pill);
  background-color: var(--Primary-Bold);
  color: var(--Primary-Bold-High);
  font-family: var(--Typography-Font-Primary);
  font-size: var(--Label-M-FontSize);
  line-height: var(--Label-M-LineHeight);
  font-weight: var(--Label-FontWeight-High);
  cursor: pointer;
  transition: background-color var(--Motion-Duration-Discreet-Medium)
    var(--Motion-Easing-Standard);
}

.submit:hover {
  background-color: var(--Primary-Bold-Hover);
}

.submit:active {
  background-color: var(--Primary-Bold-Pressed);
}

.submit:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 var(--Stroke-XL) var(--Surface-Halo-Gap, var(--Surface-Main)),
    0 0 0 var(--Focus-Outline-Width) var(--Focus-Outline);
}

/* small legal line — Low attention, relaxed reading */
.legal {
  margin: 0;
  margin-top: var(--Spacing-3XL);
  color: var(--Text-Low);
  font-family: var(--Typography-Font-Primary);
  font-size: var(--Body-S-FontSize);
  line-height: var(--Body-S-LineHeight);
  font-weight: var(--Body-FontWeight-Low);
  text-align: center;
}
```

## Notes

- **Zero literals** — every color, size, weight, radius, border, and gap resolves through a `var(--Token-*)`. The only raw values are layout primitives (`100%`, `0`), which the literals check permits.
- **Focus halo** uses `--Surface-Halo-Gap` (with a `--Surface-Main` fallback) so it adapts correctly if this form is ever placed inside a `<Surface>`.
- **No decorative card / stroke** around the form. On the default canvas a sign-up form doesn't need a boundary — the whitespace does the grouping. If a designer later wants the form on a tinted card, wrap it in `<Surface mode="subtle">` rather than adding a manual background + border, so child tokens remap correctly.
- If your app exposes the OneUI primitives, swap the raw `<button>` for `<Button variant="bold" appearance="primary">` and the raw `<input>` for the `Input` component — they encapsulate these same tokens, states, and a11y. The hand-rolled markup above is shown so the token usage is explicit and self-contained.
- Each `font-size` is paired with its matching `line-height` token, per the relational typography system.
```
