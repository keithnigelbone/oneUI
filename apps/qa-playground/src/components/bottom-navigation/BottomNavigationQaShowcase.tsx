'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import { BottomNavigation, BottomNavItem } from '@oneui/ui/components/BottomNavigation';
import { Surface } from '@oneui/ui/components/Surface';
import type {
  BottomNavigationAppearance,
  BottomNavigationLabelType,
  BottomNavigationProps,
} from '@oneui/ui/components/BottomNavigation';
import type { SemanticIconName } from '@oneui/shared';
import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import styles from '../../styles/qa.module.css';

const appearanceRowLabelStyle: CSSProperties = {
  minWidth: 'var(--Spacing-24)',
  flexShrink: 0,
  fontFamily: 'var(--Typography-Font-Primary)',
  fontSize: 'var(--Body-S-FontSize)',
  lineHeight: 'var(--Body-S-LineHeight)',
  fontWeight: 'var(--Body-FontWeight-Medium)',
  color: 'var(--Text-Medium)',
};

/** Narrow phone frame on a neutral moderate surface so nav tokens remap in context. */
function QaMobileFrame({ children, width = 360 }: { children: ReactNode; width?: number }) {
  return (
    <Surface
      mode="minimal"
      appearance="neutral"
      style={{
        width,
        borderRadius: 'var(--Shape-4-5)',
        overflow: 'hidden',
      }}
    >
      {children}
    </Surface>
  );
}

/** Figma `items` 2–5 — same defs as `BottomNavigation.showcase.tsx` `ITEM_DEFS`. */
const ITEM_DEFS: ReadonlyArray<{ value: string; label: string; icon: SemanticIconName }> = [
  { value: 'home', label: 'Home', icon: 'home' },
  { value: 'search', label: 'Search', icon: 'search' },
  { value: 'explore', label: 'Explore', icon: 'globe' },
  { value: 'inbox', label: 'Inbox', icon: 'mail' },
  { value: 'profile', label: 'Profile', icon: 'user' },
];

/** Figma appearance variable modes (+ `auto`). Order aligned with `CheckboxQaShowcase` / `BottomNavigation.stories.tsx` argTypes. */
const FIGMA_APPEARANCE = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'warning',
  'informative',
] as const satisfies readonly BottomNavigationAppearance[];

// Returns items as a keyed array (not a Fragment): `BottomNavigation` runs
// `Children.map` + `cloneElement` to inject `itemIndex`, which warns if it
// clones a `React.Fragment`. Direct/array children mirror the canonical
// `BottomNavigation.showcase.tsx` usage and let each item receive `itemIndex`.
function threeItemsDefault() {
  return [
    <BottomNavItem key="home" value="home" icon="home" label="Home" />,
    <BottomNavItem key="search" value="search" icon="search" label="Search" />,
    <BottomNavItem key="profile" value="profile" icon="user" label="Profile" />,
  ];
}

type ComboRow = {
  caption: string;
  navProps: Omit<BottomNavigationProps, 'children' | 'aria-label'>;
  children: ReactNode;
};

const COMBO_MATRIX: ComboRow[] = [
  {
    caption: '1line · primary · defaultValue search',
    navProps: { labelType: '1line', appearance: 'primary', defaultValue: 'search' },
    children: threeItemsDefault(),
  },
  {
    caption: '2line · secondary · defaultValue home',
    navProps: { labelType: '2line', appearance: 'secondary', defaultValue: 'home' },
    children: [
      <BottomNavItem key="home" value="home" icon="home" label="Home" />,
      <BottomNavItem key="search" value="search" icon="search" label="Search and discover" />,
      <BottomNavItem key="profile" value="profile" icon="user" label="Profile" />,
    ],
  },
  {
    caption: 'none · neutral · 4 items (aria-label on each item)',
    navProps: { labelType: 'none', appearance: 'neutral', defaultValue: 'explore' },
    children: [
      <BottomNavItem key="home" value="home" icon="home" aria-label="Home" />,
      <BottomNavItem key="search" value="search" icon="search" aria-label="Search" />,
      <BottomNavItem key="explore" value="explore" icon="globe" aria-label="Explore" />,
      <BottomNavItem key="profile" value="profile" icon="user" aria-label="Profile" />,
    ],
  },
  {
    caption: '1line · warning · middle item disabled',
    navProps: { appearance: 'warning', defaultValue: 'home' },
    children: [
      <BottomNavItem key="home" value="home" icon="home" label="Home" />,
      <BottomNavItem key="search" value="search" icon="search" label="Search" disabled />,
      <BottomNavItem key="profile" value="profile" icon="user" label="Profile" />,
    ],
  },
  {
    caption: '1line · positive · showDivider false',
    navProps: { appearance: 'positive', defaultValue: 'home', showDivider: false },
    children: threeItemsDefault(),
  },
  {
    caption: '1line · informative · explicit active on first item',
    navProps: { appearance: 'informative', defaultValue: 'search' },
    children: [
      <BottomNavItem key="home" value="home" icon="home" label="Home" active />,
      <BottomNavItem key="search" value="search" icon="search" label="Search" />,
      <BottomNavItem key="profile" value="profile" icon="user" label="Profile" />,
    ],
  },
];

/**
 * Bottom Navigation QA — Figma properties from `BottomNavigation.shared.ts` (BottomNav items + label;
 * BottomNav.Item active + type), mirrored to `BottomNavigation` / `BottomNavItem` in code.
 * `data-testid` is forwarded on the root `<nav>` only (`packages/ui/src/components/BottomNavigation/BottomNavigation.tsx`).
 *
 * The **Figma Validation** tab (`BottomNavigationFigmaValidationGrid`) hosts two COMPONENT_SET matrices on one page:
 * **BottomNav** (items × label) and **BottomNav.Item** (type × active, **one isolated item per cell** matching the Figma sheet).
 */
export function BottomNavigationQaShowcase() {
  return (
    <QaShowcaseRoot layout="centered">
      <QaStoryBand id="bottom-navigation-qa-default" title="Default" centerContent>
        <QaMobileFrame>
          <BottomNavigation
            aria-label="QA default bottom navigation"
            defaultValue="search"
            data-testid="bottomnav-default"
          >
            {threeItemsDefault()}
          </BottomNavigation>
        </QaMobileFrame>
      </QaStoryBand>

      <QaStoryBand id="bottom-navigation-qa-label-type" title="1 Label (Figma) → labelType" overflow>
        <p className={styles.storySectionLead}>
          Figma <code>label</code> maps to parent <code>labelType</code>: <code>1Line</code> → <code>1line</code>,{' '}
          <code>2Line</code> → <code>2line</code>, <code>none</code> → <code>none</code> (see{' '}
          <code>BottomNavigation.stories.tsx</code> Label Types).
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}>
            {(['1line', '2line', 'none'] as const satisfies readonly BottomNavigationLabelType[]).map((labelType) => (
              <div key={labelType} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
                <span className={styles.scenarioCellCaption}>{`labelType: ${labelType}`}</span>
                <QaMobileFrame>
                  <BottomNavigation
                    aria-label={`QA labelType ${labelType}`}
                    labelType={labelType}
                    defaultValue="home"
                    data-testid={`bottomnav-labeltype-${labelType}`}
                  >
                    {labelType === 'none' ? (
                      [
                        <BottomNavItem key="home" value="home" icon="home" aria-label="Home" />,
                        <BottomNavItem key="search" value="search" icon="search" aria-label="Search" />,
                        <BottomNavItem key="profile" value="profile" icon="user" aria-label="Profile" />,
                      ]
                    ) : labelType === '2line' ? (
                      [
                        <BottomNavItem key="home" value="home" icon="home" label="Home" />,
                        <BottomNavItem key="search" value="search" icon="search" label="Search and discover" />,
                        <BottomNavItem key="profile" value="profile" icon="user" label="Profile" />,
                      ]
                    ) : (
                      [
                        <BottomNavItem key="home" value="home" icon="home" label="Home" />,
                        <BottomNavItem key="search" value="search" icon="search" label="Search" />,
                        <BottomNavItem key="profile" value="profile" icon="user" label="Profile" />,
                      ]
                    )}
                  </BottomNavigation>
                </QaMobileFrame>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
        <p className={styles.storySectionLead}>
          Figma <strong>Item.type</strong> (<code>label1Line</code> / <code>label2Line</code> / <code>labelFalse</code>) is
          modelled in code as the parent <code>labelType</code>; per-item override exists on <code>BottomNavItem</code> as{' '}
          <code>labelType</code> ⚠️ (not always exposed as a separate Figma column on the parent).
        </p>
      </QaStoryBand>

      <QaStoryBand id="bottom-navigation-qa-item-count" title="2 Items (Figma) — 2 to 5 children" overflow>
        <p className={styles.storySectionLead}>
          Figma <code>items</code> count is the number of <code>BottomNavItem</code> children (2–5). Same strip as{' '}
          <code>BottomNavigation.stories.tsx</code> Item Counts.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)' }}>
            {([2, 3, 4, 5] as const).map((n) => (
              <div key={n} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
                <span className={styles.scenarioCellCaption}>{`${n} items`}</span>
                <QaMobileFrame>
                  <BottomNavigation
                    aria-label={`QA ${n} items`}
                    defaultValue={ITEM_DEFS[0].value}
                    data-testid={`bottomnav-count-${n}`}
                  >
                    {ITEM_DEFS.slice(0, n).map((def) => (
                      <BottomNavItem key={def.value} value={def.value} icon={def.icon} label={def.label} />
                    ))}
                  </BottomNavigation>
                </QaMobileFrame>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="bottom-navigation-qa-appearance" title="3 Appearance (Figma + auto)" overflow>
        <p className={styles.storySectionLead}>
          Same pattern as <code>BottomNavigation.stories.tsx</code> Appearances / argTypes. Code resolves{' '}
          <code>auto</code> → <code>primary</code> (<code>resolveBottomNavigationAppearance</code>). Code also supports{' '}
          <code>brand-bg</code> (not always listed on a compact Figma table) ⚠️.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
            {FIGMA_APPEARANCE.map((appearance) => (
              <div key={appearance} style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}>
                <span style={appearanceRowLabelStyle}>{appearance}</span>
                <QaMobileFrame>
                  <BottomNavigation
                    aria-label={`QA appearance ${appearance}`}
                    appearance={appearance}
                    defaultValue="home"
                    data-testid={`bottomnav-appearance-${appearance}`}
                  >
                    {threeItemsDefault()}
                  </BottomNavigation>
                </QaMobileFrame>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
        <QaApiSectionBody>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)', flexWrap: 'wrap' }}>
            <span style={appearanceRowLabelStyle}>brand-bg ⚠️</span>
            <QaMobileFrame>
              <BottomNavigation
                aria-label="QA appearance brand-bg"
                appearance="brand-bg"
                defaultValue="home"
                data-testid="bottomnav-appearance-brand-bg"
              >
                {threeItemsDefault()}
              </BottomNavigation>
            </QaMobileFrame>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="bottom-navigation-qa-active" title="4 Active item (Figma) → value / defaultValue" overflow>
        <p className={styles.storySectionLead}>
          Figma <strong>Item.active</strong> is usually driven by matching the parent <code>value</code> (controlled) or{' '}
          <code>defaultValue</code> (uncontrolled) to each item&apos;s <code>value</code>. An explicit <code>active</code> prop on{' '}
          <code>BottomNavItem</code> overrides selection when set (<code>BottomNavigation.shared.ts</code>).
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <QaMobileFrame>
                <BottomNavigation
                  aria-label="QA active home"
                  defaultValue="home"
                  data-testid="bottomnav-active-home"
                >
                  {threeItemsDefault()}
                </BottomNavigation>
              </QaMobileFrame>
              <span className={styles.scenarioCellCaption}>defaultValue: home</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <QaMobileFrame>
                <BottomNavigation
                  aria-label="QA active search"
                  defaultValue="search"
                  data-testid="bottomnav-active-search"
                >
                  {threeItemsDefault()}
                </BottomNavigation>
              </QaMobileFrame>
              <span className={styles.scenarioCellCaption}>defaultValue: search</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="bottom-navigation-qa-disabled" title="5 disabled (BottomNavItem)" overflow>
        <p className={styles.storySectionLead}>
          Figma disabled state on an item maps to <code>BottomNavItem disabled</code> (see{' '}
          <code>BottomNavigation.stories.tsx</code> States).
        </p>
        <QaApiSectionBody>
          <QaMobileFrame>
            <BottomNavigation aria-label="QA disabled item" defaultValue="home" data-testid="bottomnav-disabled-row">
              <BottomNavItem value="home" icon="home" label="Home" />
              <BottomNavItem value="search" icon="search" label="Search" disabled />
              <BottomNavItem value="profile" icon="user" label="Profile" />
            </BottomNavigation>
          </QaMobileFrame>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="bottom-navigation-qa-show-divider" title="6 showDivider (code)" overflow>
        <p className={styles.storySectionLead}>
          Parent <code>showDivider</code> toggles the top hairline <code>Divider</code>. Not named on the short Figma
          property comment in <code>BottomNavigation.shared.ts</code> — present in Storybook argTypes ⚠️.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <QaMobileFrame>
                <BottomNavigation
                  aria-label="QA divider on"
                  showDivider
                  defaultValue="home"
                  data-testid="bottomnav-divider-true"
                >
                  {threeItemsDefault()}
                </BottomNavigation>
              </QaMobileFrame>
              <span className={styles.scenarioCellCaption}>showDivider: true</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <QaMobileFrame>
                <BottomNavigation
                  aria-label="QA divider off"
                  showDivider={false}
                  defaultValue="home"
                  data-testid="bottomnav-divider-false"
                >
                  {threeItemsDefault()}
                </BottomNavigation>
              </QaMobileFrame>
              <span className={styles.scenarioCellCaption}>showDivider: false</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="bottom-navigation-qa-controlled" title="7 Controlled value (code)" overflow>
        <p className={styles.storySectionLead}>
          <code>value</code> + <code>onValueChange</code> for controlled selection — see <code>BottomNavigation.stories.tsx</code>{' '}
          Interactive. Typical Figma files describe state, not this split — document as code-first ⚠️.
        </p>
        <ControlledNavDemo />
      </QaStoryBand>

      <QaStoryBand id="bottom-navigation-qa-item-extras" title="8 BottomNavItem — activeIcon & overrides (code)" overflow>
        <p className={styles.storySectionLead}>
          <code>activeIcon</code> swaps the icon when active (<code>BottomNavigation.stories.tsx</code> With Icons). Per-item{' '}
          <code>appearance</code> overrides parent context ⚠️. <code>href</code> renders an anchor instead of a button — see
          TODO below if your Figma contract expects link items.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioFlexRow}>
            <div className={styles.scenarioLabeledCell}>
              <QaMobileFrame>
                <BottomNavigation aria-label="QA activeIcon" defaultValue="home" data-testid="bottomnav-activeicon">
                  <BottomNavItem value="home" icon="home" activeIcon="home" label="Home" />
                  <BottomNavItem value="search" icon="search" label="Search" />
                  <BottomNavItem value="profile" icon="user" label="Profile" />
                </BottomNavigation>
              </QaMobileFrame>
              <span className={styles.scenarioCellCaption}>activeIcon on Home</span>
            </div>
            <div className={styles.scenarioLabeledCell}>
              <QaMobileFrame>
                <BottomNavigation aria-label="QA item appearance override" defaultValue="search" appearance="neutral">
                  <BottomNavItem value="home" icon="home" label="Home" />
                  <BottomNavItem value="search" icon="search" label="Search" appearance="sparkle" />
                  <BottomNavItem value="profile" icon="user" label="Profile" />
                </BottomNavigation>
              </QaMobileFrame>
              <span className={styles.scenarioCellCaption}>Search item appearance sparkle ⚠️</span>
            </div>
          </div>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="bottom-navigation-qa-href" title="9 href / router (code)" overflow>
        <p className={styles.storySectionLead}>
          {/* TODO: If Figma documents tab destinations as URLs, add href examples per route contract. */}
          TODO: Add <code>href</code> examples (anchor items) when the Figma ↔ product contract lists destinations; today{' '}
          <code>BottomNavItem</code> supports <code>href</code> but this QA strip uses buttons only.
        </p>
      </QaStoryBand>

      <QaStoryBand id="bottom-navigation-qa-combos" title="10 Combination matrix" overflow>
        <p className={styles.storySectionLead}>
          Each row is a full-width phone frame (360px) so 2-line labels and 4-item strips are not clipped by a dense
          grid.
        </p>
        <QaApiSectionBody>
          <div className={styles.scenarioStackWide}>
            {COMBO_MATRIX.map((row, index) => (
              <div key={`bottomnav-combo-${index}`} className={styles.scenarioLabeledCellWide}>
                <QaMobileFrame>
                  <BottomNavigation
                    aria-label={`QA combo ${index}`}
                    {...row.navProps}
                    data-testid={`bottomnav-combo-${index}`}
                  >
                    {row.children}
                  </BottomNavigation>
                </QaMobileFrame>
                <span className={styles.scenarioCellCaption}>{row.caption}</span>
              </div>
            ))}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}

function ControlledNavDemo() {
  const [val, setVal] = useState('home');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
      <span
        className={styles.scenarioCellCaption}
        style={{ fontFamily: 'var(--Typography-Font-Primary)', color: 'var(--Text-Medium)' }}
      >
        Active: <code>{val}</code>
      </span>
      <QaMobileFrame>
        <BottomNavigation aria-label="QA controlled" value={val} onValueChange={setVal} data-testid="bottomnav-controlled">
          {threeItemsDefault()}
        </BottomNavigation>
      </QaMobileFrame>
    </div>
  );
}
