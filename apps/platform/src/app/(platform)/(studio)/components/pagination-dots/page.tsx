/**
 * components/pagination-dots/page.tsx
 *
 * PaginationDots component showcase page.
 * Windowed pagination indicator (Instagram / Prime Video pattern) with
 * loop vs non-loop modes, multi-accent appearance, and surface context
 * awareness. All visuals inherit from token-driven CSS — zero literals.
 */

'use client';

import React from 'react';
import {
  PaginationDotsDefault,
  PaginationDotsAppearances,
  PaginationDotsLoopVsNonLoop,
  PaginationDotsLongSequence,
  PaginationDotsInteractive,
  PaginationDotsReadOnly,
  PaginationDotsDegenerate,
  PaginationDotsSurfaceContext,
} from '@oneui/ui/components/PaginationDots';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import styles from '../component.module.css';

export default function PaginationDotsPage() {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>PaginationDots</h1>
        <p className={styles.description}>
          Windowed pagination indicator for carousels and multi-page content. A fixed
          window of 5 dots slides with the active index; edge dots shrink to signal
          there is more on either side — the pattern used by Instagram and Amazon
          Prime Video. Two modes: <strong>non-loop</strong> clamps at the edges and
          grows the last dot when the user reaches the end of the sequence;{' '}
          <strong>loop</strong> keeps the window always centered on the active dot
          and wraps seamlessly. Fully accessible via roving tabindex, keyboard
          navigation (arrows + Home / End), and a read-only mode for consumers that
          own their own state.
        </p>
      </div>

      <div className={styles.content}>
        {/* Default */}
        <FoundationCard
          title="Default"
          description="A minimal, uncontrolled PaginationDots with 5 pages."
        >
          <div className={styles.showcase}>
            <PaginationDotsDefault />
          </div>
        </FoundationCard>

        {/* Appearances */}
        <FoundationCard
          title="Appearances"
          description="Multi-accent appearance roles. Each role remaps the intermediate colour tokens so the active dot picks up the correct brand accent."
        >
          <div className={styles.showcaseColumn}>
            <PaginationDotsAppearances />
          </div>
        </FoundationCard>

        {/* Loop vs Non-loop */}
        <FoundationCard
          title="Loop vs Non-loop"
          description="Click through both columns to observe how the window behaves at the edges. Non-loop clamps and grows the last dot as you approach the end; Loop wraps seamlessly and the window stays centred on the active dot."
        >
          <div className={styles.showcase}>
            <PaginationDotsLoopVsNonLoop />
          </div>
        </FoundationCard>

        {/* Long sequence */}
        <FoundationCard
          title="Long Sequence"
          description="20 items, window size 7. Demonstrates the sliding window and non-loop end-grow. Use the controls to jump to the start and end to see the first and last dots hold their full size."
        >
          <div className={styles.showcase}>
            <PaginationDotsLongSequence />
          </div>
        </FoundationCard>

        {/* Interactive — fake carousel */}
        <FoundationCard
          title="Interactive (Fake Carousel)"
          description="Wired to a sibling card row to demonstrate the controlled API end-to-end. Clicking a dot updates the active slide; arrow keys on the focused dot navigate between pages."
        >
          <div className={styles.showcase}>
            <PaginationDotsInteractive />
          </div>
        </FoundationCard>

        {/* Read-only */}
        <FoundationCard
          title="Read-only"
          description="Opt out of interaction. The root switches to `role='status' aria-live='polite'` and the parent owns the active state — use this when another component (e.g., a Base UI Tabs or custom scroll carousel) already handles input."
        >
          <div className={styles.showcase}>
            <PaginationDotsReadOnly />
          </div>
        </FoundationCard>

        {/* Degenerate cases */}
        <FoundationCard
          title="Edge Cases"
          description="count = 0 renders an empty tablist without crashing. count = 1 shows a single active dot. count < windowSize renders every dot with no edge fade. Loop works even with 2 items."
        >
          <div className={styles.showcaseColumn}>
            <PaginationDotsDegenerate />
          </div>
        </FoundationCard>

        {/* Surface context */}
        <FoundationCard
          title="Surface Context"
          description="Adapts automatically across all six surface modes. Active pill: inverts to on-colour on bold surfaces via [data-surface] brand CSS remapping. Inactive dots on default surface: always neutral-grey. Inactive dots on any other surface (minimal → elevated): switch to a tinted version of the active appearance role so they stay visually connected to the surface."
        >
          <div className={styles.showcase}>
            <PaginationDotsSurfaceContext />
          </div>
        </FoundationCard>

        {/* Usage */}
        <FoundationCard
          title="Usage"
          description="Import PaginationDots from @oneui/ui and pass a count. For a carousel, control the active index from the parent."
          collapsible
        >
          <pre className={styles.codeBlock}>{`import { PaginationDots } from '@oneui/ui';

// Uncontrolled — 5-dot window by default
<PaginationDots pageCount={10} defaultActiveIndex={0} aria-label="Gallery" />

// Controlled — sync with a carousel
function Gallery({ slides }: { slides: Slide[] }) {
  const [active, setActive] = React.useState(0);
  return (
    <>
      <Carousel slide={active} onSlideChange={setActive}>{slides}</Carousel>
      <PaginationDots
        pageCount={slides.length}
        activeIndex={active}
        onActiveIndexChange={setActive}
        aria-label="Gallery pages"
      />
    </>
  );
}

// Infinite / loop mode
<PaginationDots pageCount={10} loop defaultActiveIndex={0} aria-label="Stories" />

// Read-only indicator mirroring an external state
<PaginationDots pageCount={10} readOnly activeIndex={currentSlide} aria-label="Slide progress" />`}</pre>
        </FoundationCard>

        {/* Props */}
        <FoundationCard
          title="Props"
          description="Available props for PaginationDots."
          collapsible
        >
          <table className={styles.propsTable}>
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>pageCount</code></td>
                <td><code>number</code></td>
                <td>-</td>
                <td>Total number of pages (required)</td>
              </tr>
              <tr>
                <td><code>activeIndex</code></td>
                <td><code>number</code></td>
                <td>-</td>
                <td>Controlled active index</td>
              </tr>
              <tr>
                <td><code>defaultActiveIndex</code></td>
                <td><code>number</code></td>
                <td><code>0</code></td>
                <td>Default active index (uncontrolled)</td>
              </tr>
              <tr>
                <td><code>onActiveIndexChange</code></td>
                <td><code>(index: number) =&gt; void</code></td>
                <td>-</td>
                <td>Called when active index changes</td>
              </tr>
              <tr>
                <td><code>loop</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Loop mode — infinite wrap vs finite end-grow</td>
              </tr>
              <tr>
                <td><code>appearance</code></td>
                <td><code>ComponentAppearance</code></td>
                <td><code>'primary'</code></td>
                <td>Multi-accent appearance role</td>
              </tr>
              <tr>
                <td><code>readOnly</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Non-interactive mode (role=status, aria-live=polite)</td>
              </tr>
              <tr>
                <td><code>aria-label</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Accessible name for the tablist / status root</td>
              </tr>
            </tbody>
          </table>
        </FoundationCard>
      </div>
    </div>
  );
}
