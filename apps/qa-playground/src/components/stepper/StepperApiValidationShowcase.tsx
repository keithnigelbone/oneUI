'use client';

import { Stepper } from '@oneui/ui/components/Stepper';
import type { StepperAccent, StepperAppearance, StepperSize } from '@oneui/ui/components/Stepper';
import { COMPONENT_APPEARANCE_ROLES } from '@oneui/shared';
import styles from './StepperApiValidationShowcase.module.css';

/** Figma API table order (attached spec) + `auto` as in other QA showcases. */
const FIGMA_APPEARANCE_ORDER: readonly StepperAppearance[] = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
] as const;

const FIGMA_ACCENT: readonly StepperAccent[] = ['primary', 'secondary', 'sparkle'];

const SHARED_TYPES_NOTE =
  '`StepperAppearance` is `ComponentAppearance` from `@oneui/shared` (includes `brand-bg` not listed on the attached Figma API screenshot).';

/**
 * Figma **API Table** ↔ shipped `Stepper` / `StepperProps` (`packages/ui/src/components/Stepper/Stepper.shared.ts`).
 * Live controls in the **Demo** column use the real `Stepper` from `@oneui/ui`.
 */
export function StepperApiValidationShowcase() {
  const appearanceFigmaList = FIGMA_APPEARANCE_ORDER.join(', ');
  const appearanceCodeRoles = ['auto', ...COMPONENT_APPEARANCE_ROLES].join(', ');
  const accentList = FIGMA_ACCENT.join(', ');

  return (
    <div className={styles.page} data-testid="stepper-api-validation-root">
      <h2 className={styles.title}>Stepper — Figma API vs code</h2>
      <p className={styles.metaLine}>
        Source of truth for types: <code>StepperProps</code> in{' '}
        <code>packages/ui/src/components/Stepper/Stepper.shared.ts</code>. Interactive matrices live under{' '}
        <strong>Test Scenarios</strong>; visual <strong>attention × size × condensed</strong> grid under{' '}
        <strong>Figma Validation</strong>.
      </p>

      <h3 className={styles.sectionTitle}>Main API (Figma + code)</h3>
      <div className={styles.tableWrap}>
        <table className={styles.apiTable} data-testid="stepper-api-table-main">
          <thead>
            <tr>
              <th scope="col">Property (Figma)</th>
              <th scope="col">Figma value(s)</th>
              <th scope="col">Code (`StepperProps`)</th>
              <th scope="col">Match</th>
              <th scope="col">Demo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>size</strong>
              </td>
              <td>S, M, L</td>
              <td>
                <code>size?: &apos;s&apos; | &apos;m&apos; | &apos;l&apos;</code> (default <code>&apos;m&apos;</code>)
              </td>
              <td className={styles.matchOk}>✓</td>
              <td className={styles.cellDemo}>
                <Stepper
                  size="s"
                  appearance="secondary"
                  attention="high"
                  defaultValue={2}
                  data-testid="stepper-api-demo-size-s"
                  partProps={{ input: { 'aria-label': 'API validation size S' } }}
                />
              </td>
            </tr>
            <tr>
              <td>
                <strong>appearance</strong>
              </td>
              <td>{appearanceFigmaList}</td>
              <td>
                <code>appearance?: StepperAppearance</code> — {SHARED_TYPES_NOTE} Concrete roles:{' '}
                <code>{appearanceCodeRoles}</code>
              </td>
              <td className={styles.matchOk}>✓</td>
              <td className={styles.cellDemo}>
                <Stepper
                  appearance="positive"
                  attention="medium"
                  defaultValue={1}
                  data-testid="stepper-api-demo-appearance-positive"
                  partProps={{ input: { 'aria-label': 'API validation appearance positive' } }}
                />
              </td>
            </tr>
            <tr>
              <td>
                <strong>accent</strong>
              </td>
              <td>
                {accentList} (Figma API column <strong>N/A</strong>)
              </td>
              <td>
                <code>accent?: &apos;primary&apos; | &apos;secondary&apos; | &apos;sparkle&apos;</code>
              </td>
              <td className={styles.matchWarn}>✓ ⚠️</td>
              <td className={styles.cellDemo}>
                <Stepper
                  appearance="neutral"
                  accent="sparkle"
                  attention="high"
                  defaultValue={3}
                  data-testid="stepper-api-demo-accent-sparkle"
                  partProps={{ input: { 'aria-label': 'API validation accent sparkle' } }}
                />
              </td>
            </tr>
            <tr>
              <td>
                <strong>condensed</strong>
              </td>
              <td>true, false</td>
              <td>
                <code>condensed?: boolean</code> (default <code>false</code>)
              </td>
              <td className={styles.matchOk}>✓</td>
              <td className={styles.cellDemo}>
                <Stepper
                  condensed
                  appearance="secondary"
                  attention="medium"
                  defaultValue={4}
                  data-testid="stepper-api-demo-condensed"
                  partProps={{ input: { 'aria-label': 'API validation condensed' } }}
                />
              </td>
            </tr>
            <tr>
              <td>
                <strong>disabled</strong>
              </td>
              <td>true, false (Figma variable mode)</td>
              <td>
                <code>disabled?: boolean</code>
              </td>
              <td className={styles.matchOk}>✓</td>
              <td className={styles.cellDemo}>
                <Stepper
                  disabled
                  appearance="neutral"
                  defaultValue={5}
                  data-testid="stepper-api-demo-disabled"
                  partProps={{ input: { 'aria-label': 'API validation disabled' } }}
                />
              </td>
            </tr>
            <tr>
              <td>
                <strong>InputText</strong>
              </td>
              <td>(no values / description in Figma row)</td>
              <td>
                No <code>inputText</code> prop — numeric field is Base UI <code>NumberField.Input</code>; use{' '}
                <code>partProps.input</code> for <code>aria-label</code> etc.
              </td>
              <td className={styles.matchWarn}>N/A ⚠️</td>
              <td className={styles.cellDemo}>
                <Stepper
                  defaultValue={9}
                  data-testid="stepper-api-demo-inputtext-via-parts"
                  partProps={{ input: { 'aria-label': 'Quantity (InputText row → partProps only)' } }}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className={styles.sectionTitle}>Code only (Figma)</h3>
      <div className={styles.tableWrap}>
        <table className={styles.apiTable} data-testid="stepper-api-table-code-only">
          <thead>
            <tr>
              <th scope="col">Property</th>
              <th scope="col">Figma</th>
              <th scope="col">Code</th>
              <th scope="col">Match</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>start</strong>
              </td>
              <td>Button slot</td>
              <td>Not on `StepperProps` — fixed decrement icon button in `Stepper.tsx`.</td>
              <td className={styles.matchTodo}>TODO — align Figma ↔ code</td>
            </tr>
            <tr>
              <td>
                <strong>end</strong>
              </td>
              <td>Button slot</td>
              <td>Not on `StepperProps` — fixed increment icon button in `Stepper.tsx`.</td>
              <td className={styles.matchTodo}>TODO — align Figma ↔ code</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className={styles.sectionTitle}>In code but not on attached Figma API table</h3>
      <div className={styles.tableWrap}>
        <table className={styles.apiTable} data-testid="stepper-api-table-extra">
          <thead>
            <tr>
              <th scope="col">Property</th>
              <th scope="col">Code</th>
              <th scope="col">Note</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>attention</strong>
              </td>
              <td>
                <code>attention?: &apos;high&apos; | &apos;medium&apos; | &apos;low&apos;</code>
              </td>
              <td className={styles.matchWarn}>
                Required for real UI; covered in Test Scenarios + Figma Validation matrix. ⚠️
              </td>
            </tr>
            <tr>
              <td>
                <strong>readOnly</strong>, <strong>error</strong>, <strong>required</strong>
              </td>
              <td>
                <code>readOnly?</code>, <code>error?</code>, <code>required?</code>
              </td>
              <td className={styles.matchWarn}>Form states in code; see Test Scenarios band. ⚠️</td>
            </tr>
            <tr>
              <td>
                <strong>value</strong>, <strong>onChange</strong>, <strong>min</strong>, <strong>max</strong>,{' '}
                <strong>step</strong>…
              </td>
              <td>Base UI NumberField contract</td>
              <td>Standard numeric field props — not listed on the Figma property sheet.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
