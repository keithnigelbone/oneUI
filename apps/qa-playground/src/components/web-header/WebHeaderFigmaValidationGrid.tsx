'use client';

import type { CSSProperties, ReactNode } from 'react';
import type { PrimaryNavMiddle, PrimaryNavType, SearchInputPosition } from '@oneui/ui/components/WebHeader';
import styles from '../pagination/pagination-figma-validation.module.css';
import {
  FIGMA_COMBO_GRID_TESTID,
  FIGMA_PROPERTY_GRID_TESTID,
  FIGMA_PROPERTY_ROWS,
  FIGMA_TYPE_MIDDLE_SEARCH_COMBOS,
  WEB_HEADER_FIGMA_PLATFORMS,
  figmaComboCellTestId,
  figmaPropertyCellTestId,
  type WebHeaderFigmaPlatform,
} from './webHeaderFigmaValidation.shared';
import {
  QaInteractiveScenario,
  QaPlatformFrame,
  type QaHeaderScenario,
} from './webHeaderQaFixtures';

function FigmaPreviewWrap({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className={styles.previewWrap} style={style}>
      {children}
    </div>
  );
}

function buildPropertyScenario(
  group: string,
  value: string | boolean,
  platform: WebHeaderFigmaPlatform,
): QaHeaderScenario {
  const testId = figmaPropertyCellTestId(group, value, platform);
  const base: QaHeaderScenario = {
    testId,
    ariaLabel: `Figma ${group}=${String(value)} platform ${platform}`,
    searchAriaLabel: `Figma search ${group}=${String(value)} platform ${platform}`,
    platformWidth: platform,
    type: 'homeBar',
    middle: 'fluid',
    searchInput: platformBreakpointSearch(platform),
    showStart: true,
    showEnd: true,
    showAvatar: true,
    primaryNavItems: true,
    navItems: ['home', 'products', 'solutions'],
  };

  switch (group) {
    case 'type':
      return {
        ...base,
        type: value as PrimaryNavType,
        primaryNavItems: value !== 'searchBar',
        searchInput:
          value === 'searchBar'
            ? 'middle'
            : platformBreakpointSearch(platform),
      };
    case 'start':
      return { ...base, showStart: Boolean(value) };
    case 'middle':
      return { ...base, middle: value as PrimaryNavMiddle };
    case 'primaryNavItems':
      return { ...base, primaryNavItems: Boolean(value) };
    case 'end':
      return { ...base, showEnd: Boolean(value) };
    case 'avatar':
      return { ...base, showAvatar: Boolean(value) };
    default:
      return base;
  }
}

function platformBreakpointSearch(platform: WebHeaderFigmaPlatform): SearchInputPosition {
  return platform >= 1024 ? 'end' : 'none';
}

function buildComboScenario(
  combo: (typeof FIGMA_TYPE_MIDDLE_SEARCH_COMBOS)[number],
  platform: WebHeaderFigmaPlatform,
): QaHeaderScenario {
  const testId = figmaComboCellTestId(combo.type, combo.middle, combo.searchInput, platform);
  return {
    testId,
    ariaLabel: `Figma combo ${combo.type} ${combo.middle} search ${combo.searchInput} @ ${platform}`,
    searchAriaLabel: `Figma combo search ${combo.type} ${combo.middle} ${combo.searchInput}`,
    platformWidth: platform,
    type: combo.type,
    middle: combo.middle,
    searchInput: combo.searchInput,
    primaryNavItems: combo.type !== 'searchBar',
    showStart: true,
    showEnd: true,
    showAvatar: true,
    navItems: ['home', 'products'],
  };
}

function PropertyMatrixCell({
  group,
  value,
  platform,
}: {
  group: string;
  value: string | boolean;
  platform: WebHeaderFigmaPlatform;
}) {
  const scenario = buildPropertyScenario(group, value, platform);
  return (
    <FigmaPreviewWrap style={{ width: `${platform}px`, maxWidth: `${platform}px` }}>
      <QaInteractiveScenario scenario={scenario} />
    </FigmaPreviewWrap>
  );
}

function ComboMatrixCell({
  combo,
  platform,
}: {
  combo: (typeof FIGMA_TYPE_MIDDLE_SEARCH_COMBOS)[number];
  platform: WebHeaderFigmaPlatform;
}) {
  const scenario = buildComboScenario(combo, platform);
  return (
    <FigmaPreviewWrap style={{ width: `${platform}px`, maxWidth: `${platform}px` }}>
      <QaInteractiveScenario scenario={scenario} />
    </FigmaPreviewWrap>
  );
}

/**
 * Figma validation matrices for HeaderWeb.PrimaryNav — property × platform widths
 * and type × middle × searchInput combinations (matches micropatterns Figma sheet).
 */
export function WebHeaderFigmaValidationGrid() {
  return (
    <div className={styles.page}>
      <p className={styles.metaLine}>
        Matrices from the Figma <strong>HeaderWeb.PrimaryNav</strong> COMPONENT_SET. Columns are platform widths{' '}
        {WEB_HEADER_FIGMA_PLATFORMS.join(' · ')}. Code maps Figma <code>start</code> → <code>logo</code> +{' '}
        <code>showMenuButton</code>; <code>end</code> → <code>end</code> slot; <code>avatar</code> →{' '}
        <code>showAvatar</code>.
      </p>

      <section className={styles.section}>
        <div className={styles.tableWrap}>
          <table className={styles.gridTable} data-testid={FIGMA_PROPERTY_GRID_TESTID}>
            <caption className={styles.figmaCaption}>
              <span className={styles.figmaCaptionMark} aria-hidden>
                ❖
              </span>{' '}
              HeaderWeb.PrimaryNav — API properties × platform
            </caption>
            <tbody>
              {FIGMA_PROPERTY_ROWS.flatMap(({ group, values }) =>
                values.map((value) => (
                  <tr key={`${group}-${String(value)}`} data-testrow={`${group}: ${String(value)}`}>
                    {WEB_HEADER_FIGMA_PLATFORMS.map((platform) => (
                      <td key={platform} className={`${styles.cell} ${styles.cellPagination}`}>
                        <PropertyMatrixCell group={group} value={value} platform={platform} />
                      </td>
                    ))}
                    <th scope="row" className={styles.rowLabelRight}>
                      {`${group}: ${String(value)}`}
                    </th>
                  </tr>
                )),
              )}
            </tbody>
            <tfoot>
              <tr className={styles.footerRow}>
                {WEB_HEADER_FIGMA_PLATFORMS.map((platform) => (
                  <td key={platform} className={styles.footerAxis}>
                    {`platform: ${platform}`}
                  </td>
                ))}
                <td className={styles.footerCorner} aria-hidden />
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section className={styles.section}>
        <p className={styles.metaLine}>
          Type × middle × searchInput combinations from the Figma documentation hierarchy (13 cells). Shown at
          platform <strong>1024</strong> (desktop breakpoint L).
        </p>
        <div className={styles.tableWrap}>
          <table className={styles.gridTable} data-testid={FIGMA_COMBO_GRID_TESTID}>
            <caption className={styles.figmaCaption}>
              <span className={styles.figmaCaptionMark} aria-hidden>
                ❖
              </span>{' '}
              HeaderWeb.PrimaryNav — type × middle × searchInput
            </caption>
            <thead>
              <tr>
                <th scope="col" className={styles.footerAxis}>
                  type
                </th>
                <th scope="col" className={styles.footerAxis}>
                  middle
                </th>
                <th scope="col" className={styles.footerAxis}>
                  searchInput
                </th>
                <th scope="col" className={styles.footerAxis}>
                  preview @ 1024
                </th>
              </tr>
            </thead>
            <tbody>
              {FIGMA_TYPE_MIDDLE_SEARCH_COMBOS.map((combo) => (
                <tr
                  key={`${combo.type}-${combo.middle}-${combo.searchInput}`}
                  data-testrow={`${combo.type} · ${combo.middle} · ${combo.searchInput}`}
                >
                  <td className={styles.footerAxis}>{combo.type}</td>
                  <td className={styles.footerAxis}>{combo.middle}</td>
                  <td className={styles.footerAxis}>{combo.searchInput}</td>
                  <td className={`${styles.cell} ${styles.cellPagination}`}>
                    <QaPlatformFrame width={1024}>
                      <ComboMatrixCell combo={combo} platform={1024} />
                    </QaPlatformFrame>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
