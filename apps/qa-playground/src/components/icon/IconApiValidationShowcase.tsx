'use client';

import { Icon } from '@oneui/ui/components/Icon';
import { ICON_SIZES } from '@oneui/ui/components/Icon';
import type { IconAppearance, IconEmphasis } from '@oneui/ui/components/Icon/shared';
import styles from './IconApiValidationShowcase.module.css';

/** Figma API table order (attached spec). */
const FIGMA_APPEARANCE: readonly IconAppearance[] = [
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
] as const;

const FIGMA_EMPHASIS: readonly { value: IconEmphasis; figmaLabel: string }[] = [
  { value: 'high', figmaLabel: 'high' },
  { value: 'medium', figmaLabel: 'medium [text]' },
  { value: 'low', figmaLabel: 'low [text]' },
  { value: 'tinted', figmaLabel: 'tinted' },
  { value: 'tintedA11y', figmaLabel: 'tintedA11y' },
] as const;

const FIGMA_SIZE_LIST = ICON_SIZES.join(', ');

/**
 * Figma **API Table** ↔ shipped `Icon` / `IconProps` (`packages/ui/src/components/Icon/Icon.shared.ts`).
 * Live controls in the **Demo** column use the real `Icon` from `@oneui/ui`.
 */
export function IconApiValidationShowcase() {
  const appearanceFigmaList = FIGMA_APPEARANCE.join(', ');
  const emphasisFigmaList = FIGMA_EMPHASIS.map(({ figmaLabel }) => figmaLabel).join(', ');

  return (
    <div className={styles.page} data-testid="icon-api-validation-root">
      <h2 className={styles.title}>Icon — Figma API vs code</h2>
      <p className={styles.metaLine}>
        Source of truth for types: <code>IconProps</code> in{' '}
        <code>packages/ui/src/components/Icon/Icon.shared.ts</code>. Interactive matrices live under{' '}
        <strong>Test Scenarios</strong>; visual <strong>appearance × emphasis</strong> and <strong>size</strong> grids
        under <strong>Figma Validation</strong>.
      </p>

      <h3 className={styles.sectionTitle}>Main API (Figma + code)</h3>
      <div className={styles.tableWrap}>
        <table className={styles.apiTable} data-testid="icon-api-table-main">
          <thead>
            <tr>
              <th scope="col">Property (Figma)</th>
              <th scope="col">Figma value(s)</th>
              <th scope="col">Figma API</th>
              <th scope="col">Code (`IconProps`)</th>
              <th scope="col">Match</th>
              <th scope="col">Demo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>size</strong>
              </td>
              <td>{FIGMA_SIZE_LIST}</td>
              <td>variable mode</td>
              <td>
                <code>size?: IconSize</code> (default <code>&apos;5&apos;</code>) — 20 spacing-index presets
              </td>
              <td className={styles.matchOk}>✓</td>
              <td className={styles.cellDemo}>
                <Icon
                  icon="heart"
                  size="8"
                  appearance="primary"
                  emphasis="high"
                  aria-label="API validation size 8"
                  data-testid="icon-api-demo-size-8"
                />
              </td>
            </tr>
            <tr>
              <td>
                <strong>appearance</strong>
              </td>
              <td>{appearanceFigmaList}</td>
              <td>variable mode</td>
              <td>
                <code>appearance?: IconAppearance</code> — 8-role union (no <code>auto</code> /{' '}
                <code>brand-bg</code> on Icon)
              </td>
              <td className={styles.matchOk}>✓</td>
              <td className={styles.cellDemo}>
                <Icon
                  icon="heart"
                  appearance="positive"
                  emphasis="high"
                  size="8"
                  aria-label="API validation appearance positive"
                  data-testid="icon-api-demo-appearance-positive"
                />
              </td>
            </tr>
            <tr>
              <td>
                <strong>emphasis</strong>
              </td>
              <td>{emphasisFigmaList}</td>
              <td>colour token</td>
              <td>
                <code>emphasis?: &apos;high&apos; | &apos;medium&apos; | &apos;low&apos; | &apos;tinted&apos; | &apos;tintedA11y&apos;</code>{' '}
                (default <code>&apos;high&apos;</code>)
              </td>
              <td className={styles.matchOk}>✓</td>
              <td className={styles.cellDemo}>
                <Icon
                  icon="heart"
                  appearance="primary"
                  emphasis="tintedA11y"
                  size="8"
                  aria-label="API validation emphasis tintedA11y"
                  data-testid="icon-api-demo-emphasis-tintedA11y"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 className={styles.sectionTitle}>In code but not on attached Figma API table</h3>
      <div className={styles.tableWrap}>
        <table className={styles.apiTable} data-testid="icon-api-table-extra">
          <thead>
            <tr>
              <th scope="col">Property</th>
              <th scope="col">Code</th>
              <th scope="col">Note</th>
              <th scope="col">Demo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>icon</strong>
              </td>
              <td>
                <code>icon: SemanticIconName | ReactElement</code> (required)
              </td>
              <td className={styles.matchWarn}>
                Figma models the glyph via the component instance; code requires explicit <code>icon</code> prop. ⚠️
              </td>
              <td className={styles.cellDemo}>
                <Icon
                  icon="heart"
                  size="8"
                  appearance="primary"
                  emphasis="high"
                  aria-label="API validation icon heart"
                  data-testid="icon-api-demo-icon-heart"
                />
              </td>
            </tr>
            <tr>
              <td>
                <strong>aria-label</strong>
              </td>
              <td>
                <code>aria-label?: string</code>
              </td>
              <td className={styles.matchWarn}>
                When set, root gets <code>role=&quot;img&quot;</code>; omitted → decorative{' '}
                <code>aria-hidden=&quot;true&quot;</code>. ⚠️
              </td>
              <td className={styles.cellDemo}>
                <Icon
                  icon="heart"
                  size="8"
                  appearance="neutral"
                  emphasis="high"
                  aria-label="Favourited"
                  data-testid="icon-api-demo-aria-label"
                />
              </td>
            </tr>
            <tr>
              <td>
                <strong>aria-hidden</strong>
              </td>
              <td>
                <code>aria-hidden?: boolean</code>
              </td>
              <td className={styles.matchWarn}>
                Defaults to <code>true</code> when no <code>aria-label</code>. ⚠️
              </td>
              <td className={styles.cellDemo}>
                <Icon
                  icon="heart"
                  size="8"
                  appearance="neutral"
                  emphasis="medium"
                  data-testid="icon-api-demo-aria-hidden-default"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
