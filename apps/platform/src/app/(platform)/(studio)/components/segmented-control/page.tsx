/**
 * components/segmented-control/page.tsx
 *
 * SegmentedControl component showcase page
 */

'use client';

import React from 'react';
import {
  SegmentedControl,
  SegmentedControlAttentionLevels,
  SegmentedControlSurfaceContext,
  SegmentedControlTrackEmphasisLevels,
} from '@oneui/ui/components/SegmentedControl';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import styles from '../component.module.css';

export default function SegmentedControlPage() {
  const [view, setView] = React.useState<'list' | 'grid' | 'table'>('list');
  const [size, setSize] = React.useState<'s' | 'm' | 'l'>('m');
  const [filter, setFilter] = React.useState<'all' | 'active' | 'archived'>('all');

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>SegmentedControl</h1>
        <p className={styles.description}>
          A segmented control for selecting a single option from a set of mutually exclusive choices.
          Track role follows parent Surface appearance; item role follows the appearance prop.
        </p>
      </div>
      <div className={styles.content}>
        <FoundationCard title="Default" description="Basic segmented control with text labels.">
          <div className={styles.showcase}>
            <div className={styles.showcaseItem}>
              <SegmentedControl value={view} onValueChange={(v) => setView(v as typeof view)} aria-label="View mode">
                <SegmentedControl.Item value="list">List</SegmentedControl.Item>
                <SegmentedControl.Item value="grid">Grid</SegmentedControl.Item>
                <SegmentedControl.Item value="table">Table</SegmentedControl.Item>
              </SegmentedControl>
              <span className={styles.showcaseLabel}>Selected: {view}</span>
            </div>
          </div>
        </FoundationCard>

        <FoundationCard title="Sizes" description="S, M, and L size variants.">
          <div className={styles.showcase}>
            {(['s', 'm', 'l'] as const).map((s) => (
              <div key={s} className={styles.showcaseItem}>
                <SegmentedControl value={size} onValueChange={(v) => setSize(v as typeof size)} size={s} aria-label="Size selection">
                  <SegmentedControl.Item value="s">S</SegmentedControl.Item>
                  <SegmentedControl.Item value="m">M</SegmentedControl.Item>
                  <SegmentedControl.Item value="l">L</SegmentedControl.Item>
                </SegmentedControl>
                <span className={styles.showcaseLabel}>{s.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </FoundationCard>

        <FoundationCard title="Attention Levels" description="Slice of the matrix — track emphasis fixed at high.">
          <SegmentedControlAttentionLevels />
        </FoundationCard>

        <FoundationCard title="Track Emphasis" description="Slice of the matrix — attention fixed at high. Medium row shows ghost + strokeMedium border.">
          <SegmentedControlTrackEmphasisLevels />
        </FoundationCard>

        <FoundationCard title="Multiple Options" description="Segmented control with more options.">
          <div className={styles.showcase}>
            <div className={styles.showcaseItem}>
              <SegmentedControl value={filter} onValueChange={(v) => setFilter(v as typeof filter)} aria-label="Filter options">
                <SegmentedControl.Item value="all">All</SegmentedControl.Item>
                <SegmentedControl.Item value="active">Active</SegmentedControl.Item>
                <SegmentedControl.Item value="archived">Archived</SegmentedControl.Item>
              </SegmentedControl>
              <span className={styles.showcaseLabel}>Selected: {filter}</span>
            </div>
          </div>
        </FoundationCard>

        <FoundationCard title="Disabled Option" description="Individual items can be disabled.">
          <div className={styles.showcase}>
            <div className={styles.showcaseItem}>
              <SegmentedControl value="option1" onValueChange={() => {}} aria-label="Options with disabled">
                <SegmentedControl.Item value="option1">Available</SegmentedControl.Item>
                <SegmentedControl.Item value="option2" disabled>
                  Disabled
                </SegmentedControl.Item>
                <SegmentedControl.Item value="option3">Available</SegmentedControl.Item>
              </SegmentedControl>
              <span className={styles.showcaseLabel}>Middle item disabled</span>
            </div>
          </div>
        </FoundationCard>

        <FoundationCard title="Disabled Control" description="Entire control can be disabled.">
          <div className={styles.showcase}>
            <div className={styles.showcaseItem}>
              <SegmentedControl value={view} onValueChange={(v) => setView(v as typeof view)} disabled aria-label="Disabled control">
                <SegmentedControl.Item value="list">List</SegmentedControl.Item>
                <SegmentedControl.Item value="grid">Grid</SegmentedControl.Item>
                <SegmentedControl.Item value="table">Table</SegmentedControl.Item>
              </SegmentedControl>
              <span className={styles.showcaseLabel}>Fully disabled</span>
            </div>
          </div>
        </FoundationCard>

        <FoundationCard
          title="Surface Context & variant matrix"
          description="Columns = track emphasis (high · medium · low). Rows = item attention (high · medium · low). Includes page root, all surface modes, bold × 9 roles, and subtle × 9 roles."
        >
          <SegmentedControlSurfaceContext />
        </FoundationCard>

        <FoundationCard title="Usage" description="Import and use the SegmentedControl compound API." collapsible>
          <pre className={styles.codeBlock}>
{`import { SegmentedControl } from '@oneui/ui';

const [view, setView] = useState<'list' | 'grid' | 'table'>('list');

<SegmentedControl
  value={view}
  onValueChange={setView}
  aria-label="View mode"
>
  <SegmentedControl.Item value="list">List</SegmentedControl.Item>
  <SegmentedControl.Item value="grid">Grid</SegmentedControl.Item>
  <SegmentedControl.Item value="table">Table</SegmentedControl.Item>
</SegmentedControl>

// Track emphasis + attention
<SegmentedControl
  value={view}
  onValueChange={setView}
  trackEmphasis="medium"
  attention="low"
  aria-label="View mode"
>
  ...
</SegmentedControl>

// Disabled item
<SegmentedControl.Item value="archived" disabled>
  Archived
</SegmentedControl.Item>`}
          </pre>
        </FoundationCard>

        <FoundationCard title="Props" description="Available props for SegmentedControl." collapsible>
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
                <td><code>value</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Controlled selected value</td>
              </tr>
              <tr>
                <td><code>defaultValue</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Uncontrolled initial value</td>
              </tr>
              <tr>
                <td><code>onValueChange</code></td>
                <td><code>(value: string) =&gt; void</code></td>
                <td>-</td>
                <td>Called when selection changes</td>
              </tr>
              <tr>
                <td><code>size</code></td>
                <td><code>&apos;s&apos; | &apos;m&apos; | &apos;l&apos;</code></td>
                <td><code>&apos;m&apos;</code></td>
                <td>Segment size</td>
              </tr>
              <tr>
                <td><code>attention</code></td>
                <td><code>&apos;high&apos; | &apos;medium&apos; | &apos;low&apos;</code></td>
                <td><code>&apos;high&apos;</code></td>
                <td>Selected segment prominence (high=bold; medium/low=subtle)</td>
              </tr>
              <tr>
                <td><code>trackEmphasis</code></td>
                <td><code>&apos;high&apos; | &apos;medium&apos; | &apos;low&apos;</code></td>
                <td><code>&apos;high&apos;</code></td>
                <td>Track container emphasis</td>
              </tr>
              <tr>
                <td><code>appearance</code></td>
                <td><code>ComponentAppearance</code></td>
                <td><code>&apos;auto&apos;</code></td>
                <td>Active segment colour role</td>
              </tr>
              <tr>
                <td><code>equalWidth</code></td>
                <td><code>boolean</code></td>
                <td><code>true</code></td>
                <td>Distribute equal width to segments</td>
              </tr>
              <tr>
                <td><code>disabled</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Disable entire control</td>
              </tr>
            </tbody>
          </table>
        </FoundationCard>
      </div>
    </div>
  );
}
