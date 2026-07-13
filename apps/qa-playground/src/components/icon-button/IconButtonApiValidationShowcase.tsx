'use client';

import { IconButton } from '@oneui/ui/components/IconButton';
import styles from '../shared/qa-api-validation.module.css';

const FIGMA_APPEARANCE =
  'auto, neutral, primary, secondary, sparkle, negative, positive, warning, informative';

/**
 * IconButton — Figma API table vs `IconButtonProps` (`IconButton.shared.ts`).
 * Attached Figma spec: size, attention, shape, appearance, condensed, contained, fullWidth, disabled, loading.
 */
export function IconButtonApiValidationShowcase() {
  return (
    <div className={styles.page} data-testid="icon-button-api-validation-root">
      <h2 className={styles.title}>IconButton — Figma API vs code</h2>
      <p className={styles.metaLine}>
        Source: <code>packages/ui/src/components/IconButton/IconButton.shared.ts</code>. Matrices under{' '}
        <strong>Test Scenarios</strong> and <strong>Figma Validation</strong>.
      </p>

      <h3 className={styles.sectionTitle}>Main API (Figma component properties + variable modes)</h3>
      <div className={styles.tableWrap}>
        <table className={styles.apiTable} data-testid="icon-button-api-table-main">
          <thead>
            <tr>
              <th scope="col">Property (Figma)</th>
              <th scope="col">Figma value(s)</th>
              <th scope="col">Figma API</th>
              <th scope="col">Code (`IconButtonProps`)</th>
              <th scope="col">Match</th>
              <th scope="col">Action item</th>
              <th scope="col">Demo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>size</strong></td>
              <td>2XS, XS, S, M, L, XL</td>
              <td>component property</td>
              <td>
                <code>size?: IconButtonSize</code> — f-steps <code>4|6|8|10|12|14</code> or t-shirt{' '}
                <code>2xs…xl</code> (default <code>10</code> / M)
              </td>
              <td className={styles.matchWarn}>⚠️ Partial</td>
              <td className={styles.actionItem}>Align naming: Figma labels vs numeric f-steps in docs/Storybook.</td>
              <td className={styles.cellDemo}>
                <IconButton icon="star" size="m" aria-label="Size M" data-testid="icon-button-api-demo-size" />
              </td>
            </tr>
            <tr>
              <td><strong>attention</strong></td>
              <td>high, medium, low</td>
              <td>component property</td>
              <td>
                <code>attention?: &apos;high&apos; | &apos;medium&apos; | &apos;low&apos;</code> (default high → bold)
              </td>
              <td className={styles.matchOk}>✓</td>
              <td>—</td>
              <td className={styles.cellDemo}>
                <IconButton icon="star" attention="medium" aria-label="Medium" data-testid="icon-button-api-demo-attention" />
              </td>
            </tr>
            <tr>
              <td><strong>shape</strong></td>
              <td>1:1, 2:3</td>
              <td>component property</td>
              <td>
                <code>layout?: &apos;1:1&apos; | &apos;3:2&apos;</code> (default <code>1:1</code>) — not <code>shape</code>
              </td>
              <td className={styles.matchWarn}>⚠️ Rename</td>
              <td className={styles.actionItem}>
                Figma <code>2:3</code> maps to code <code>3:2</code>; consider alias <code>shape</code> for parity.
              </td>
              <td className={styles.cellDemo}>
                <IconButton icon="star" layout="3:2" aria-label="Wide" data-testid="icon-button-api-demo-layout" />
              </td>
            </tr>
            <tr>
              <td><strong>appearance</strong></td>
              <td>{FIGMA_APPEARANCE}</td>
              <td>variable mode</td>
              <td>
                <code>appearance?: ComponentAppearance</code> (+ <code>brand-bg</code> in code)
              </td>
              <td className={styles.matchOk}>✓</td>
              <td>—</td>
              <td className={styles.cellDemo}>
                <IconButton icon="star" appearance="secondary" aria-label="Secondary" data-testid="icon-button-api-demo-appearance" />
              </td>
            </tr>
            <tr>
              <td><strong>condensed</strong></td>
              <td>true, false</td>
              <td>component property</td>
              <td><code>condensed?: boolean</code> (default false)</td>
              <td className={styles.matchOk}>✓</td>
              <td>—</td>
              <td className={styles.cellDemo}>
                <IconButton icon="star" condensed aria-label="Condensed" data-testid="icon-button-api-demo-condensed" />
              </td>
            </tr>
            <tr>
              <td><strong>contained</strong></td>
              <td>true, false</td>
              <td>component property</td>
              <td>Not implemented — IconButton is always icon-in-button chrome</td>
              <td className={styles.matchFail}>✗ Missing</td>
              <td className={styles.actionItem}>
                Confirm with design: remove from Figma table or add prop if distinct from attention fill.
              </td>
              <td className={styles.cellDemo}>—</td>
            </tr>
            <tr>
              <td><strong>fullWidth</strong></td>
              <td>true, false</td>
              <td>component property</td>
              <td><code>fullWidth?: boolean</code> (default false)</td>
              <td className={styles.matchOk}>✓</td>
              <td>—</td>
              <td className={styles.cellDemo}>
                <IconButton icon="star" fullWidth aria-label="Full width" data-testid="icon-button-api-demo-fullwidth" />
              </td>
            </tr>
            <tr>
              <td><strong>disabled</strong></td>
              <td>true, false</td>
              <td>variable mode</td>
              <td><code>disabled?: boolean</code></td>
              <td className={styles.matchOk}>✓</td>
              <td>—</td>
              <td className={styles.cellDemo}>
                <IconButton icon="star" disabled aria-label="Disabled" data-testid="icon-button-api-demo-disabled" />
              </td>
            </tr>
            <tr>
              <td><strong>loading</strong></td>
              <td>true, false</td>
              <td>variable mode</td>
              <td>
                <code>loading?: boolean</code> — replaces icon with circular progress indicator
              </td>
              <td className={styles.matchOk}>✓</td>
              <td>—</td>
              <td className={styles.cellDemo}>
                <IconButton icon="star" loading aria-label="Loading" data-testid="icon-button-api-demo-loading" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className={styles.sectionTitle}>Figma “Code only” (not component properties)</h3>
      <div className={styles.tableWrap}>
        <table className={styles.apiTable} data-testid="icon-button-api-table-code-only">
          <thead>
            <tr>
              <th scope="col">Property (Figma code-only)</th>
              <th scope="col">Figma value(s)</th>
              <th scope="col">Code</th>
              <th scope="col">Match</th>
              <th scope="col">Note</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>accent</strong></td>
              <td>primary, secondary, sparkle</td>
              <td>Use <code>appearance</code> instead</td>
              <td className={styles.matchWarn}>⚠️</td>
              <td>Document mapping in consumer guides; no separate <code>accent</code> prop.</td>
            </tr>
            <tr>
              <td><strong>content</strong></td>
              <td>icon, circularProgressIndicator</td>
              <td><code>loading</code> toggles CPI; <code>icon</code> required</td>
              <td className={styles.matchOk}>✓</td>
              <td>Behaviour matches via <code>loading</code> boolean.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className={styles.sectionTitle}>In code but not on attached Figma API table</h3>
      <div className={styles.tableWrap}>
        <table className={styles.apiTable} data-testid="icon-button-api-table-extra">
          <thead>
            <tr>
              <th scope="col">Property</th>
              <th scope="col">Code</th>
              <th scope="col">Note</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>icon</strong></td>
              <td><code>icon: SemanticIconName | ReactElement</code> (required)</td>
              <td>Figma embeds glyph in the component set instance.</td>
            </tr>
            <tr>
              <td><strong>variant</strong></td>
              <td><code>variant?: bold | subtle | ghost</code></td>
              <td>Legacy; <code>attention</code> is the Figma-aligned API.</td>
            </tr>
            <tr>
              <td><strong>aria-label</strong></td>
              <td>Required in <code>IconButtonProps</code></td>
              <td>WCAG: icon-only buttons must have an accessible name.</td>
            </tr>
            <tr>
              <td><strong>aria-expanded</strong></td>
              <td>Optional — menu / disclosure triggers</td>
              <td>Not listed in Figma API table.</td>
            </tr>
            <tr>
              <td><strong>data-testid</strong></td>
              <td>Forwarded to root <code>&lt;button&gt;</code></td>
              <td>QA / automation only.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
