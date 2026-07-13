'use client';

import { IconContained } from '@oneui/ui/components/IconContained';
import styles from '../shared/qa-api-validation.module.css';

const FIGMA_APPEARANCE =
  'neutral, primary, secondary, sparkle, negative, positive, warning, informative';

export function IconContainedApiValidationShowcase() {
  return (
    <div className={styles.page} data-testid="icon-contained-api-validation-root">
      <h2 className={styles.title}>IconContained — Figma API vs code</h2>
      <p className={styles.metaLine}>
        Source: <code>packages/ui/src/components/IconContained/IconContained.shared.ts</code>.
      </p>

      <h3 className={styles.sectionTitle}>Main API</h3>
      <div className={styles.tableWrap}>
        <table className={styles.apiTable} data-testid="icon-contained-api-table-main">
          <thead>
            <tr>
              <th scope="col">Property (Figma)</th>
              <th scope="col">Figma value(s)</th>
              <th scope="col">Figma API</th>
              <th scope="col">Code</th>
              <th scope="col">Match</th>
              <th scope="col">Action item</th>
              <th scope="col">Demo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>size</strong></td>
              <td>XS, S, M, L, XL</td>
              <td>component property</td>
              <td>
                <code>size?: &apos;xs&apos;|&apos;s&apos;|&apos;m&apos;|&apos;l&apos;|&apos;xl&apos;</code> (default{' '}
                <code>m</code>)
              </td>
              <td className={styles.matchWarn}>⚠️ Case</td>
              <td className={styles.actionItem}>Figma uses uppercase labels; code uses lowercase t-shirt keys.</td>
              <td className={styles.cellDemo}>
                <span data-testid="icon-contained-api-demo-size">
                  <IconContained icon="heart" size="m" aria-label="M" />
                </span>
              </td>
            </tr>
            <tr>
              <td><strong>attention</strong></td>
              <td>medium, high</td>
              <td>component property</td>
              <td>
                <code>attention?: &apos;high&apos; | &apos;medium&apos;</code> (default <code>high</code>)
              </td>
              <td className={styles.matchOk}>✓</td>
              <td>—</td>
              <td className={styles.cellDemo}>
                <span data-testid="icon-contained-api-demo-attention">
                  <IconContained icon="heart" attention="medium" aria-label="Medium" />
                </span>
              </td>
            </tr>
            <tr>
              <td><strong>appearance</strong></td>
              <td>{FIGMA_APPEARANCE}</td>
              <td>variable mode</td>
              <td>
                <code>appearance?: ButtonAppearance</code> (+ <code>auto</code>, <code>brand-bg</code>)
              </td>
              <td className={styles.matchOk}>✓</td>
              <td className={styles.actionItem}>Figma screenshot default highlights secondary; code default resolves to primary.</td>
              <td className={styles.cellDemo}>
                <span data-testid="icon-contained-api-demo-appearance">
                  <IconContained icon="heart" appearance="secondary" aria-label="Secondary" />
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className={styles.sectionTitle}>In code but not on Figma API table</h3>
      <div className={styles.tableWrap}>
        <table className={styles.apiTable} data-testid="icon-contained-api-table-extra">
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
              <td>Required semantic name or ReactElement</td>
              <td>Figma embeds heart glyph in the set.</td>
            </tr>
            <tr>
              <td><strong>disabled</strong></td>
              <td><code>disabled?: boolean</code></td>
              <td>Not on attached Figma API table.</td>
            </tr>
            <tr>
              <td><strong>aria-label</strong></td>
              <td>Optional; root <code>role=&quot;img&quot;</code> when set</td>
              <td>Decorative use: omit label + use parent text.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
