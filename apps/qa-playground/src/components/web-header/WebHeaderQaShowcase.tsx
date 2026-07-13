'use client';

import { QaApiSectionBody, QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import styles from '../../styles/qa.module.css';
import {
  QaDesktopFrame,
  QaInteractiveScenario,
  QaPlatformFrame,
  platformCaptionStyle,
  WEB_HEADER_FIGMA_PLATFORMS,
  platformBreakpoint,
  type QaHeaderScenario,
} from './webHeaderQaFixtures';

const DEFAULT_SCENARIO: QaHeaderScenario = {
  testId: 'web-header-default',
  ariaLabel: 'Default — primary navigation',
  searchAriaLabel: 'Default — site search',
  type: 'homeBar',
  middle: 'fluid',
  searchInput: 'end',
  showMenuButton: true,
  navItems: ['home', 'products', 'solutions', 'resources'],
};

const HOME_BAR_SCENARIOS: Array<{ sectionId: string; title: string; scenario: QaHeaderScenario }> = [
  {
    sectionId: 'web-header-qa-home-fluid-search-end',
    title: 'Fluid + Search End',
    scenario: {
      testId: 'web-header-home-fluid-search-end',
      ariaLabel: 'Fluid + Search End — primary navigation',
      searchAriaLabel: 'Fluid + Search End — site search',
      type: 'homeBar',
      middle: 'fluid',
      searchInput: 'end',
      showMenuButton: true,
    },
  },
  {
    sectionId: 'web-header-qa-home-fluid-search-middle',
    title: 'Fluid + Search Middle',
    scenario: {
      testId: 'web-header-home-fluid-search-middle',
      ariaLabel: 'Fluid + Search Middle — primary navigation',
      searchAriaLabel: 'Fluid + Search Middle — site search',
      type: 'homeBar',
      middle: 'fluid',
      searchInput: 'middle',
      showMenuButton: true,
    },
  },
  {
    sectionId: 'web-header-qa-home-centred-no-search',
    title: 'Centred + No Search',
    scenario: {
      testId: 'web-header-home-centred-no-search',
      ariaLabel: 'Centred + No Search — primary navigation',
      type: 'homeBar',
      middle: 'centred',
      searchInput: 'none',
      showMenuButton: true,
    },
  },
  {
    sectionId: 'web-header-qa-home-no-hamburger',
    title: 'No Hamburger',
    scenario: {
      testId: 'web-header-home-no-hamburger',
      ariaLabel: 'No Hamburger — primary navigation',
      searchAriaLabel: 'No Hamburger — site search',
      type: 'homeBar',
      middle: 'fluid',
      searchInput: 'end',
      showMenuButton: false,
      navItems: ['home', 'products', 'solutions'],
    },
  },
];

function ScenarioStack({
  scenarios,
}: {
  scenarios: Array<{ id: string; title: string; scenario: QaHeaderScenario }>;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)', width: '100%' }}>
      {scenarios.map(({ id, title, scenario }) => (
        <div key={id} id={id}>
          <p style={platformCaptionStyle}>{title}</p>
          <QaDesktopFrame>
            <QaInteractiveScenario scenario={scenario} />
          </QaDesktopFrame>
        </div>
      ))}
    </div>
  );
}

/**
 * Web Header QA — mirrors Figma PrimaryNav API (`type`, `start`, `middle`, `primaryNavItems`, `end`, `avatar`).
 */
export function WebHeaderQaShowcase() {
  return (
    <QaShowcaseRoot>
      <QaStoryBand id="web-header-qa-default" title="Default (homeBar · fluid · search end)" overflow>
        <p className={styles.storySectionLead}>
          Default configuration — <code>type=homeBar</code>, <code>middle=fluid</code>, <code>searchInput=end</code>,
          four nav items, IconButton end actions + avatar.
        </p>
        <QaApiSectionBody>
          <QaDesktopFrame>
            <QaInteractiveScenario scenario={DEFAULT_SCENARIO} />
          </QaDesktopFrame>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="web-header-qa-home-bar" title="homeBar (Figma type=homeBar)" overflow>
        <p className={styles.storySectionLead}>
          HomeBar matrix — <code>middle</code> × <code>searchInput</code> combinations from Figma.
        </p>
        <QaApiSectionBody>
          <ScenarioStack scenarios={HOME_BAR_SCENARIOS.map((s) => ({ id: s.sectionId, title: s.title, scenario: s.scenario }))} />
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="web-header-qa-context-bar" title="contextBar (Figma type=contextBar)" overflow>
        <QaApiSectionBody>
          <ScenarioStack
            scenarios={[
              {
                id: 'web-header-qa-context-no-nav',
                title: 'primaryNavItems=false',
                scenario: {
                  testId: 'web-header-context-no-nav',
                  ariaLabel: 'ContextBar without nav items',
                  type: 'contextBar',
                  primaryNavItems: false,
                  searchInput: 'none',
                  showMenuButton: true,
                },
              },
              {
                id: 'web-header-qa-context-with-nav',
                title: 'primaryNavItems=true',
                scenario: {
                  testId: 'web-header-context-with-nav',
                  ariaLabel: 'ContextBar with nav items',
                  type: 'contextBar',
                  middle: 'fluid',
                  searchInput: 'none',
                  showMenuButton: true,
                  navItems: ['home', 'about'],
                  initialActive: 'home',
                },
              },
            ]}
          />
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="web-header-qa-search-bar" title="searchBar (Figma type=searchBar)" overflow>
        <QaApiSectionBody>
          <ScenarioStack
            scenarios={[
              {
                id: 'web-header-qa-search-middle',
                title: 'searchInput=middle',
                scenario: {
                  testId: 'web-header-search-middle',
                  ariaLabel: 'SearchBar middle search',
                  searchAriaLabel: 'SearchBar middle — site search',
                  type: 'searchBar',
                  middle: 'fluid',
                  searchInput: 'middle',
                  primaryNavItems: false,
                  showMenuButton: true,
                },
              },
              {
                id: 'web-header-qa-search-end',
                title: 'searchInput=end',
                scenario: {
                  testId: 'web-header-search-end',
                  ariaLabel: 'SearchBar end search',
                  searchAriaLabel: 'SearchBar end — site search',
                  type: 'searchBar',
                  searchInput: 'end',
                  primaryNavItems: false,
                  showMenuButton: true,
                },
              },
            ]}
          />
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="web-header-qa-api-start" title="start=true / start=false" overflow>
        <QaApiSectionBody>
          <ScenarioStack
            scenarios={[
              {
                id: 'web-header-qa-start-true',
                title: 'start=true (logo + menu on mobile)',
                scenario: {
                  testId: 'web-header-start-true',
                  ariaLabel: 'Start slot visible',
                  showStart: true,
                  showMenuButton: true,
                },
              },
              {
                id: 'web-header-qa-start-false',
                title: 'start=false (no logo)',
                scenario: {
                  testId: 'web-header-start-false',
                  ariaLabel: 'Start slot hidden',
                  showStart: false,
                  showMenuButton: false,
                },
              },
            ]}
          />
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="web-header-qa-api-middle" title="middle=fluid / middle=centred" overflow>
        <QaApiSectionBody>
          <ScenarioStack
            scenarios={[
              {
                id: 'web-header-qa-middle-fluid',
                title: 'middle=fluid',
                scenario: {
                  testId: 'web-header-middle-fluid',
                  ariaLabel: 'Middle fluid layout',
                  middle: 'fluid',
                },
              },
              {
                id: 'web-header-qa-middle-centred',
                title: 'middle=centred',
                scenario: {
                  testId: 'web-header-middle-centred',
                  ariaLabel: 'Middle centred layout',
                  middle: 'centred',
                  searchInput: 'none',
                },
              },
            ]}
          />
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="web-header-qa-api-primary-nav" title="primaryNavItems=true / false" overflow>
        <QaApiSectionBody>
          <ScenarioStack
            scenarios={[
              {
                id: 'web-header-qa-primary-nav-true',
                title: 'primaryNavItems=true',
                scenario: {
                  testId: 'web-header-primary-nav-true',
                  ariaLabel: 'Primary nav items visible',
                  primaryNavItems: true,
                },
              },
              {
                id: 'web-header-qa-primary-nav-false',
                title: 'primaryNavItems=false',
                scenario: {
                  testId: 'web-header-primary-nav-false',
                  ariaLabel: 'Primary nav items hidden',
                  primaryNavItems: false,
                  searchInput: 'none',
                },
              },
            ]}
          />
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="web-header-qa-api-end" title="end=true / end=false" overflow>
        <QaApiSectionBody>
          <ScenarioStack
            scenarios={[
              {
                id: 'web-header-qa-end-true',
                title: 'end=true (IconButton actions)',
                scenario: {
                  testId: 'web-header-end-true',
                  ariaLabel: 'End actions visible',
                  showEnd: true,
                  endActionMode: 'iconButtons',
                },
              },
              {
                id: 'web-header-qa-end-false',
                title: 'end=false',
                scenario: {
                  testId: 'web-header-end-false',
                  ariaLabel: 'End actions hidden',
                  showEnd: false,
                },
              },
            ]}
          />
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="web-header-qa-api-avatar" title="avatar=true / avatar=false" overflow>
        <QaApiSectionBody>
          <ScenarioStack
            scenarios={[
              {
                id: 'web-header-qa-avatar-true',
                title: 'avatar=true',
                scenario: {
                  testId: 'web-header-avatar-true',
                  ariaLabel: 'Avatar visible',
                  showAvatar: true,
                },
              },
              {
                id: 'web-header-qa-avatar-false',
                title: 'avatar=false',
                scenario: {
                  testId: 'web-header-avatar-false',
                  ariaLabel: 'Avatar hidden',
                  showAvatar: false,
                },
              },
            ]}
          />
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="web-header-qa-end-actions" title="EndActions — Button vs IconButton" overflow>
        <QaApiSectionBody>
          <ScenarioStack
            scenarios={[
              {
                id: 'web-header-qa-end-icon-buttons',
                title: 'EndActions: IconButton cluster',
                scenario: {
                  testId: 'web-header-end-icon-buttons',
                  ariaLabel: 'IconButton end actions',
                  endActionMode: 'iconButtons',
                },
              },
              {
                id: 'web-header-qa-end-button',
                title: 'EndActions: Button',
                scenario: {
                  testId: 'web-header-end-button',
                  ariaLabel: 'Button end action',
                  endActionMode: 'button',
                  searchInput: 'none',
                },
              },
            ]}
          />
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="web-header-qa-header-item" title="Header.Item slot" overflow>
        <QaApiSectionBody>
          <QaDesktopFrame>
            <QaInteractiveScenario
              scenario={{
                testId: 'web-header-header-item-slot',
                ariaLabel: 'Header.Item interactive nav',
                initialActive: 'a',
                staticNav: [
                  { value: 'a', label: 'Alpha', active: true },
                  { value: 'b', label: 'Beta' },
                  { value: 'c', label: 'Gamma' },
                ],
              }}
            />
          </QaDesktopFrame>
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="web-header-qa-negative" title="Negative / edge cases" overflow>
        <QaApiSectionBody>
          <ScenarioStack
            scenarios={[
              {
                id: 'web-header-qa-negative-empty-nav',
                title: 'primaryNavItems=true but empty children',
                scenario: {
                  testId: 'web-header-negative-empty-nav',
                  ariaLabel: 'Empty nav items',
                  primaryNavItems: true,
                  navItems: [],
                },
              },
              {
                id: 'web-header-qa-negative-no-end-no-avatar',
                title: 'end=false + avatar=false',
                scenario: {
                  testId: 'web-header-negative-no-end-no-avatar',
                  ariaLabel: 'No end and no avatar',
                  showEnd: false,
                  showAvatar: false,
                  searchInput: 'middle',
                },
              },
              {
                id: 'web-header-qa-negative-searchbar-no-search',
                title: 'searchBar with searchInput=none (invalid combo)',
                scenario: {
                  testId: 'web-header-negative-searchbar-no-search',
                  ariaLabel: 'SearchBar without search input',
                  type: 'searchBar',
                  primaryNavItems: false,
                  searchInput: 'none',
                },
              },
            ]}
          />
        </QaApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="web-header-qa-responsive" title="Responsive — Figma platform widths" overflow>
        <p className={styles.storySectionLead}>
          Platforms <strong>360</strong> · <strong>768</strong> · <strong>1024</strong> · <strong>1440</strong> ·{' '}
          <strong>1920</strong> — fixed-width frames per Figma validation sheet.
        </p>
        <QaApiSectionBody>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-5)', width: '100%' }}>
            {WEB_HEADER_FIGMA_PLATFORMS.map((width) => {
              const bp = platformBreakpoint(width);
              return (
                <QaPlatformFrame key={width} width={width}>
                  <QaInteractiveScenario
                    scenario={{
                      testId: `web-header-platform-${width}-inner`,
                      ariaLabel: `WebHeader ${width} — primary navigation`,
                      searchAriaLabel: `WebHeader ${width} — site search`,
                      platformWidth: width,
                      breakpoint: bp,
                      type: 'homeBar',
                      middle: 'fluid',
                      searchInput: bp === 'L' ? 'end' : 'none',
                      showMenuButton: bp !== 'L',
                      navItems: ['home', 'products', 'solutions'],
                    }}
                  />
                </QaPlatformFrame>
              );
            })}
          </div>
        </QaApiSectionBody>
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}
