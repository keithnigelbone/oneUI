'use client';

import { useState, type CSSProperties, type ReactNode } from 'react';
import { Button } from '@oneui/ui/components/Button';
import { Surface } from '@oneui/ui/components/Surface';
import { Tooltip } from '@oneui/ui/components/Tooltip';
import { QaShowcaseRoot, QaStoryBand } from '../shared/QaShowcaseLayout';
import { ScenarioGridQaShowcase } from '../shared/ScenarioGridQaShowcase';
import styles from '../../styles/qa.module.css';

const flowRow: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--Spacing-4)',
  alignItems: 'center',
  justifyContent: 'center',
};

/** Same neutral minimal surface as {@link ../bottom-navigation/BottomNavigationQaShowcase.tsx} `QaMobileFrame`. */
function QaSurfaceFrame({ children }: { children: ReactNode }) {
  return (
    <Surface
      mode="minimal"
      appearance="neutral"
      style={{
        borderRadius: 'var(--Shape-4-5)',
        overflowX: 'auto',
        overflowY: 'hidden',
        padding: 'var(--Spacing-2XL)',
        boxSizing: 'border-box',
        maxWidth: '100%',
      }}
    >
      {children}
    </Surface>
  );
}

function ApiSectionBody({ children }: { children: ReactNode }) {
  return (
    <div className={styles.apiSectionBody}>
      <QaSurfaceFrame>{children}</QaSurfaceFrame>
    </div>
  );
}

/**
 * Tooltip QA — Figma API bands + registry scenario grid.
 * Position matrix lives on the **Figma Validation** tab ({@link TooltipFigmaValidationGrid}).
 *
 * NOTE: The Button component does not forward data-testid to the DOM (no ...rest spread).
 * All testids are therefore placed on wrapper <div> elements so Playwright can locate them.
 * Functional tests that dispatch events on triggers use
 * `wrapper.locator('[data-base-ui-tooltip-trigger]')` to reach the actual span trigger.
 */
export function TooltipQaShowcase() {
  const [manualOpen, setManualOpen] = useState(false);

  return (
    <QaShowcaseRoot>
      <QaStoryBand id="tooltip-figma-tip-true" title="tip / arrow: true (default)">
        <ApiSectionBody>
          <div style={flowRow}>
            {/* testid on div — Button does not forward data-testid to the DOM */}
            <div data-testid="tt-figma-tip-true">
              <Tooltip content="With tip" defaultOpen trigger="manual" arrow>
                <Button variant="subtle">Hover target</Button>
              </Tooltip>
            </div>
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="tooltip-figma-tip-false" title="tip / arrow: false">
        <ApiSectionBody>
          <div style={flowRow}>
            {/* testid on div — Button does not forward data-testid to the DOM */}
            <div data-testid="tt-figma-tip-false">
              <Tooltip content="No tip" defaultOpen trigger="manual" arrow={false}>
                <Button variant="subtle">No arrow</Button>
              </Tooltip>
            </div>
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="tooltip-figma-disabled-false" title="disable / disabled: false">
        <ApiSectionBody>
          <div style={flowRow}>
            {/* testid on wrapper div — Button does not forward data-testid to the DOM */}
            <div data-testid="tt-figma-disabled-false-trigger">
              <Tooltip content="Enabled" disabled={false}>
                <Button variant="subtle">Hover me</Button>
              </Tooltip>
            </div>
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="tooltip-figma-disabled-true" title="disable / disabled: true">
        <ApiSectionBody>
          <div style={flowRow}>
            {/* testid on wrapper div — Button does not forward data-testid to the DOM */}
            <div data-testid="tt-figma-disabled-true-trigger">
              <Tooltip content="Hidden" disabled>
                <Button variant="subtle">Disabled trigger</Button>
              </Tooltip>
            </div>
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="tooltip-trigger-hover" title="trigger: hover (default)">
        <ApiSectionBody>
          <div style={flowRow}>
            {/* testid on wrapper div — Button does not forward data-testid to the DOM */}
            <div data-testid="tt-figma-trigger-hover">
              <Tooltip content="Hover tooltip" trigger="hover">
                <Button variant="subtle">Hover</Button>
              </Tooltip>
            </div>
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="tooltip-trigger-click" title="trigger: click">
        <ApiSectionBody>
          <div style={flowRow}>
            {/* testid on wrapper div — Button does not forward data-testid to the DOM */}
            <div data-testid="tt-figma-trigger-click">
              <Tooltip content="Click tooltip" trigger="click">
                <Button variant="subtle">Click toggle</Button>
              </Tooltip>
            </div>
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="tooltip-trigger-focus" title="trigger: focus">
        <ApiSectionBody>
          <div style={flowRow}>
            {/* testid on wrapper div — Button does not forward data-testid to the DOM */}
            <div data-testid="tt-figma-trigger-focus">
              <Tooltip content="Focus tooltip" trigger="focus">
                <Button variant="subtle">Focus me</Button>
              </Tooltip>
            </div>
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="tooltip-controlled-manual" title="open + trigger: manual">
        <ApiSectionBody>
          <div style={flowRow}>
            {/* testids on wrapper divs — Button does not forward data-testid to the DOM */}
            <div data-testid="tt-figma-manual-anchor">
              <Tooltip
                content="Controlled manual"
                open={manualOpen}
                onOpenChange={setManualOpen}
                trigger="manual"
              >
                <Button variant="subtle">Anchor only</Button>
              </Tooltip>
            </div>
            <div data-testid="tt-figma-manual-toggle">
              <Button
                variant="bold"
                onClick={() => setManualOpen((o) => !o)}
              >
                Toggle open
              </Button>
            </div>
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="tooltip-default-open" title="defaultOpen: true">
        <ApiSectionBody>
          <div style={flowRow}>
            {/* testid on wrapper div — Button does not forward data-testid to the DOM */}
            <div data-testid="tt-figma-default-open">
              <Tooltip content="Initially visible" defaultOpen trigger="manual">
                <Button variant="subtle">defaultOpen</Button>
              </Tooltip>
            </div>
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      {/* ── Code-only props (no Figma equivalent) ─────────────────────────── */}

      <QaStoryBand id="tooltip-side-align" title="side + align (low-level positioning API)">
        <ApiSectionBody>
          <div style={flowRow}>
            {/* testid on wrapper div — Button does not forward data-testid to the DOM */}
            <div data-testid="tt-side-align-anchor">
              <Tooltip
                content="side=right align=start"
                side="right"
                align="start"
                defaultOpen
                trigger="manual"
              >
                <Button variant="subtle">Anchor</Button>
              </Tooltip>
            </div>
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="tooltip-sideOffset" title="sideOffset: 32px gap from trigger">
        <ApiSectionBody>
          <div style={flowRow}>
            {/* testid on wrapper div — Button does not forward data-testid to the DOM */}
            <div data-testid="tt-sideOffset-anchor">
              <Tooltip
                content="sideOffset=32"
                sideOffset={32}
                defaultOpen
                trigger="manual"
              >
                <Button variant="subtle">Anchor</Button>
              </Tooltip>
            </div>
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="tooltip-delay" title="delay: 800ms before show">
        <ApiSectionBody>
          <div style={flowRow}>
            {/* testid on wrapper div — Button does not forward data-testid to the DOM */}
            <div data-testid="tt-delay-trigger">
              <Tooltip content="Delayed show" delay={800} trigger="hover">
                <Button variant="subtle">Hover (800ms delay)</Button>
              </Tooltip>
            </div>
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="tooltip-closeDelay" title="closeDelay: 800ms before hide">
        <ApiSectionBody>
          <div style={flowRow}>
            {/* testid on wrapper div — Button does not forward data-testid to the DOM */}
            <div data-testid="tt-closeDelay-trigger">
              <Tooltip content="Slow close" closeDelay={800} trigger="hover">
                <Button variant="subtle">Hover then leave</Button>
              </Tooltip>
            </div>
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="tooltip-hoverable-false" title="hoverable: false">
        <ApiSectionBody>
          <div style={flowRow}>
            {/*
              tt-hoverable-false-wrap: outer wrapper (already on div, unchanged)
              tt-hoverable-false-trigger: moved from Button to inner div wrapper
            */}
            <div data-testid="tt-hoverable-false-wrap">
              <div data-testid="tt-hoverable-false-trigger">
                <Tooltip content="Not hoverable" hoverable={false} trigger="hover">
                  <Button variant="subtle">Hover me</Button>
                </Tooltip>
              </div>
            </div>
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="tooltip-zIndex" title="zIndex: 9999">
        <ApiSectionBody>
          <div style={flowRow}>
            {/* testid on wrapper div — Button does not forward data-testid to the DOM */}
            <div data-testid="tt-zIndex-anchor">
              <Tooltip
                content="Custom z-index"
                zIndex={9999}
                defaultOpen
                trigger="manual"
              >
                <Button variant="subtle">Anchor</Button>
              </Tooltip>
            </div>
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="tooltip-maxWidth" title="maxWidth: 120">
        <ApiSectionBody>
          <div style={flowRow}>
            {/* testid on wrapper div — Button does not forward data-testid to the DOM */}
            <div data-testid="tt-maxWidth-anchor">
              <Tooltip
                content="Max width constrained tooltip text"
                maxWidth={120}
                defaultOpen
                trigger="manual"
              >
                <Button variant="subtle">Anchor</Button>
              </Tooltip>
            </div>
          </div>
        </ApiSectionBody>
      </QaStoryBand>

      <QaStoryBand id="tooltip-registry-scenarios" title="Registry scenario grid">
        <ScenarioGridQaShowcase slug="tooltip" />
      </QaStoryBand>
    </QaShowcaseRoot>
  );
}
