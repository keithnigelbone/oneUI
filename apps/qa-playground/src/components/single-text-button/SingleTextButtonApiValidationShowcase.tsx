'use client';

import { SingleTextButton } from '@oneui/ui/components/SingleTextButton';
import styles from '../shared/qa-api-validation.module.css';

const FIGMA_APPEARANCE =
  'auto, neutral, primary, secondary, sparkle, negative, positive, warning, informative';

export function SingleTextButtonApiValidationShowcase() {
  return (
    <div className={styles.page} data-testid="single-text-button-api-validation-root">
      <h2 className={styles.title}>SingleTextButton — Figma API vs code</h2>
      <p className={styles.metaLine}>
        Source: <code>packages/ui/src/components/SingleTextButton/SingleTextButton.shared.ts</code>.
      </p>

      <h3 className={styles.sectionTitle}>Main API</h3>
      <div className={styles.tableWrap}>
        <table className={styles.apiTable} data-testid="single-text-button-api-table-main">
          <thead>
            <tr>
              <th scope="col">Property (Figma)</th>
              <th scope="col">Figma value(s)</th>
              <th scope="col">Code</th>
              <th scope="col">Match</th>
              <th scope="col">Action item</th>
              <th scope="col">Demo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>size</strong></td>
              <td>S, M, L</td>
              <td><code>size?: &apos;s&apos;|&apos;m&apos;|&apos;l&apos;</code> (default m)</td>
              <td className={styles.matchWarn}>⚠️ Case</td>
              <td className={styles.actionItem}>Figma uppercase labels vs lowercase code keys.</td>
              <td className={styles.cellDemo}>
                <span data-testid="single-text-button-api-demo-size">
                  <SingleTextButton size="m">Ag</SingleTextButton>
                </span>
              </td>
            </tr>
            <tr>
              <td><strong>attention</strong></td>
              <td>high, medium, low</td>
              <td><code>attention?: &apos;high&apos;|&apos;medium&apos;|&apos;low&apos;</code></td>
              <td className={styles.matchOk}>✓</td>
              <td>—</td>
              <td className={styles.cellDemo}>
                <span data-testid="single-text-button-api-demo-attention">
                  <SingleTextButton attention="medium">Ag</SingleTextButton>
                </span>
              </td>
            </tr>
            <tr>
              <td><strong>appearance</strong></td>
              <td>{FIGMA_APPEARANCE}</td>
              <td>
                <code>appearance?</code> (+ <code>tertiary</code>, <code>quaternary</code> in code only)
              </td>
              <td className={styles.matchWarn}>⚠️</td>
              <td className={styles.actionItem}>Document extra appearances or add to Figma variable modes.</td>
              <td className={styles.cellDemo}>
                <span data-testid="single-text-button-api-demo-appearance">
                  <SingleTextButton appearance="secondary">Ag</SingleTextButton>
                </span>
              </td>
            </tr>
            <tr>
              <td><strong>condensed</strong></td>
              <td>true, false</td>
              <td><code>condensed?: boolean</code></td>
              <td className={styles.matchOk}>✓</td>
              <td>—</td>
              <td className={styles.cellDemo}>
                <span data-testid="single-text-button-api-demo-condensed">
                  <SingleTextButton condensed>Ag</SingleTextButton>
                </span>
              </td>
            </tr>
            <tr>
              <td><strong>disabled</strong></td>
              <td>true, false</td>
              <td><code>disabled?</code></td>
              <td className={styles.matchOk}>✓</td>
              <td>—</td>
              <td className={styles.cellDemo}>
                <span data-testid="single-text-button-api-demo-disabled">
                  <SingleTextButton disabled>Ag</SingleTextButton>
                </span>
              </td>
            </tr>
            <tr>
              <td><strong>loading</strong></td>
              <td>true, false</td>
              <td><code>loading?</code> — CPI replaces label (Figma content: circularProgressIndicator)</td>
              <td className={styles.matchOk}>✓</td>
              <td>—</td>
              <td className={styles.cellDemo}>
                <span data-testid="single-text-button-api-demo-loading">
                  <SingleTextButton loading>Ag</SingleTextButton>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className={styles.sectionTitle}>Figma “Code only”</h3>
      <div className={styles.tableWrap}>
        <table className={styles.apiTable} data-testid="single-text-button-api-table-code-only">
          <thead>
            <tr>
              <th scope="col">Property</th>
              <th scope="col">Figma</th>
              <th scope="col">Code</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>accent</strong></td>
              <td>primary, secondary, sparkle</td>
              <td>Use <code>appearance</code></td>
            </tr>
            <tr>
              <td><strong>content</strong></td>
              <td>text, circularProgressIndicator</td>
              <td><code>children</code> + <code>loading</code></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className={styles.sectionTitle}>In code but not on Figma API table</h3>
      <div className={styles.tableWrap}>
        <table className={styles.apiTable} data-testid="single-text-button-api-table-extra">
          <thead>
            <tr>
              <th scope="col">Property</th>
              <th scope="col">Code</th>
              <th scope="col">Note</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>children</strong></td>
              <td>Max 2 characters (enforced in dev)</td>
              <td>Figma shows placeholder &quot;Ag&quot;.</td>
            </tr>
            <tr>
              <td><strong>fullWidth</strong></td>
              <td>Overrides circular shape</td>
              <td>Not on attached Figma table.</td>
            </tr>
            <tr>
              <td><strong>type</strong></td>
              <td>button | submit | reset</td>
              <td>HTML form integration.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
