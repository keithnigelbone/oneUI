/**
 * components/chip-group/page.tsx
 *
 * ChipGroup component showcase page.
 * Groups multiple Chip components with shared selection state,
 * keyboard navigation, and optional single/multi-select constraints.
 *
 * ChipGroup is layout-only — all visual styling lives on Chip itself.
 * Hover/pressed states (Neutral overlay for unselected, brand accent
 * for selected) are inherited automatically from Chip.module.css.
 */

'use client';

import React from 'react';
import { ChipGroup } from '@oneui/ui/components/ChipGroup';
import { Chip } from '@oneui/ui/components/Chip';
import { Surface } from '@oneui/ui/components/Surface';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import styles from '../component.module.css';

/**
 * Chip defaults to `appearance="secondary"`, so ChipGroup's surface-context
 * demo uses secondary-scoped surface fills. These `--Secondary-Fill-*` tokens
 * are emitted ONLY at `:root` and never remapped inside `[data-surface]`
 * blocks — the container keeps its true fill while the chip cascade inside
 * still remaps to the inverted / on-colour values for each context. Using
 * `--Secondary-Bold` here would fail because it's remapped to the bold
 * inversion inside `[data-surface="bold"]`, making the chip invisible.
 */
const SECONDARY_SURFACE_BG: Record<string, string> = {
  default: 'var(--Surface-Default, var(--Surface-Main))',
  minimal: 'var(--Secondary-Fill-Minimal, var(--Surface-Minimal))',
  subtle: 'var(--Secondary-Fill-Subtle, var(--Surface-Subtle))',
  moderate: 'var(--Secondary-Fill-Moderate, var(--Surface-Subtle))',
  bold: 'var(--Secondary-Fill-Bold, var(--Surface-Bold))',
  elevated: 'var(--Secondary-Fill-Elevated, var(--Surface-Elevated))',
};

export default function ChipGroupPage() {
  const [single, setSingle] = React.useState<string[]>(['all']);
  const [multi, setMulti] = React.useState<string[]>(['react', 'typescript']);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>ChipGroup</h1>
        <p className={styles.description}>
          Container for multiple Chip components with shared selection state, arrow-key
          navigation, and optional single/multi-select constraints. Chip visuals — including
          the hover and pressed states that embrace the chip&rsquo;s appearance role — are
          inherited automatically from Chip.
        </p>
      </div>

      <div className={styles.content}>
        {/* Single select */}
        <FoundationCard
          title="Single Select (default)"
          description="Only one chip can be selected at a time. Use ChipGroup with no `multiple` prop."
        >
          <div className={styles.showcase}>
            <ChipGroup value={single} onValueChange={setSingle} aria-label="Category">
              <Chip value="all" attention="high">All</Chip>
              <Chip value="news" attention="high">News</Chip>
              <Chip value="sport" attention="high">Sport</Chip>
              <Chip value="tech" attention="high">Tech</Chip>
              <Chip value="culture" attention="high">Culture</Chip>
            </ChipGroup>
          </div>
        </FoundationCard>

        {/* Multi select */}
        <FoundationCard
          title="Multi Select"
          description="Pass `multiple` to allow several chips to be active simultaneously."
        >
          <div className={styles.showcase}>
            <ChipGroup
              multiple
              value={multi}
              onValueChange={setMulti}
              aria-label="Tech stack"
            >
              <Chip value="react" attention="medium">React</Chip>
              <Chip value="vue" attention="medium">Vue</Chip>
              <Chip value="angular" attention="medium">Angular</Chip>
              <Chip value="svelte" attention="medium">Svelte</Chip>
              <Chip value="typescript" attention="medium">TypeScript</Chip>
            </ChipGroup>
          </div>
        </FoundationCard>

        {/* Attention levels */}
        <FoundationCard
          title="Attention Levels"
          description="Each ChipGroup can use a different attention level — high, medium, or low — applied to its chips. Group-level props propagate via ChipGroupContext."
        >
          <div className={styles.showcaseColumn}>
            <ChipGroup defaultValue={['react']} aria-label="High">
              <Chip value="react" attention="high">React</Chip>
              <Chip value="vue" attention="high">Vue</Chip>
              <Chip value="angular" attention="high">Angular</Chip>
            </ChipGroup>
            <ChipGroup defaultValue={['react']} aria-label="Medium">
              <Chip value="react" attention="medium">React</Chip>
              <Chip value="vue" attention="medium">Vue</Chip>
              <Chip value="angular" attention="medium">Angular</Chip>
            </ChipGroup>
            <ChipGroup defaultValue={['react']} aria-label="Low">
              <Chip value="react" attention="low">React</Chip>
              <Chip value="vue" attention="low">Vue</Chip>
              <Chip value="angular" attention="low">Angular</Chip>
            </ChipGroup>
          </div>
        </FoundationCard>

        {/* Sizes */}
        <FoundationCard
          title="Sizes"
          description="Set size on the group and every chip inherits it via context."
        >
          <div className={styles.showcaseColumn}>
            <ChipGroup size="s" defaultValue={['all']} aria-label="Small">
              <Chip value="all" attention="high">All</Chip>
              <Chip value="news" attention="high">News</Chip>
              <Chip value="sport" attention="high">Sport</Chip>
            </ChipGroup>
            <ChipGroup size="m" defaultValue={['all']} aria-label="Medium">
              <Chip value="all" attention="high">All</Chip>
              <Chip value="news" attention="high">News</Chip>
              <Chip value="sport" attention="high">Sport</Chip>
            </ChipGroup>
            <ChipGroup size="l" defaultValue={['all']} aria-label="Large">
              <Chip value="all" attention="high">All</Chip>
              <Chip value="news" attention="high">News</Chip>
              <Chip value="sport" attention="high">Sport</Chip>
            </ChipGroup>
          </div>
        </FoundationCard>

        {/* Disabled group */}
        <FoundationCard
          title="Disabled Group"
          description="Disable the entire group with a single prop — all chips and keyboard navigation go inactive."
        >
          <div className={styles.showcase}>
            <ChipGroup disabled defaultValue={['all']} aria-label="Disabled">
              <Chip value="all" attention="high">All</Chip>
              <Chip value="news" attention="high">News</Chip>
              <Chip value="sport" attention="high">Sport</Chip>
            </ChipGroup>
          </div>
        </FoundationCard>

        {/* Surface Context */}
        <FoundationCard
          title="Surface Context"
          description="ChipGroup adapts when placed on different surface backgrounds."
        >
          <div className={styles.showcase} style={{ flexDirection: 'column', gap: 'var(--Spacing-3-5)' }}>
            {([
              { mode: 'default' as const, label: 'Default' },
              { mode: 'minimal' as const, label: 'Minimal' },
              { mode: 'subtle' as const, label: 'Subtle' },
              { mode: 'moderate' as const, label: 'Moderate' },
              { mode: 'bold' as const, label: 'Bold' },
              { mode: 'elevated' as const, label: 'Elevated' },
            ]).map(({ mode, label }) => (
              <Surface
                key={mode}
                mode={mode}
                style={{
                  padding: 'var(--Spacing-4)',
                  borderRadius: 'var(--Shape-4)',
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 'var(--Spacing-4)',
                  width: '100%',
                  backgroundColor: SECONDARY_SURFACE_BG[mode],
                }}
              >
                <span style={{ color: 'var(--Text-High)', minWidth: '100px', margin: 0, fontWeight: 'var(--Typography-Weight-Medium)', fontSize: 'var(--Typography-Size-S)' }}>
                  {label}
                </span>
                <ChipGroup defaultValue={['all']} aria-label={`${label} surface`}>
                  <Chip value="all" attention="high">All</Chip>
                  <Chip value="news" attention="high">News</Chip>
                  <Chip value="sport" attention="high">Sport</Chip>
                </ChipGroup>
              </Surface>
            ))}
          </div>
        </FoundationCard>

        {/* Usage */}
        <FoundationCard
          title="Usage"
          description="Import ChipGroup together with Chip. Chip visuals, including hover/pressed state layers, come from Chip.module.css — no extra configuration."
          collapsible
        >
          <pre className={styles.codeBlock}>{`import { ChipGroup, Chip } from '@oneui/ui';

function CategoryFilter() {
  const [selected, setSelected] = React.useState<string[]>(['all']);

  return (
    <ChipGroup
      value={selected}
      onValueChange={setSelected}
      aria-label="Category"
    >
      <Chip value="all" attention="high">All</Chip>
      <Chip value="news" attention="high">News</Chip>
      <Chip value="sport" attention="high">Sport</Chip>
    </ChipGroup>
  );
}

// Multi-select with constraint
<ChipGroup multiple maxSelections={3} defaultValue={['react']}>
  <Chip value="react" attention="medium">React</Chip>
  <Chip value="vue" attention="medium">Vue</Chip>
  <Chip value="angular" attention="medium">Angular</Chip>
</ChipGroup>`}</pre>
        </FoundationCard>

        {/* Props */}
        <FoundationCard
          title="Props"
          description="Available props for ChipGroup component."
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
                <td><code>children</code></td>
                <td><code>ReactNode</code></td>
                <td>-</td>
                <td>Chip items (required)</td>
              </tr>
              <tr>
                <td><code>value</code></td>
                <td><code>string[]</code></td>
                <td>-</td>
                <td>Selected values (controlled)</td>
              </tr>
              <tr>
                <td><code>defaultValue</code></td>
                <td><code>string[]</code></td>
                <td>-</td>
                <td>Default values (uncontrolled)</td>
              </tr>
              <tr>
                <td><code>onValueChange</code></td>
                <td><code>(value: string[]) =&gt; void</code></td>
                <td>-</td>
                <td>Called when values change</td>
              </tr>
              <tr>
                <td><code>multiple</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Allow multiple chips to be selected</td>
              </tr>
              <tr>
                <td><code>maxSelections</code></td>
                <td><code>number</code></td>
                <td>-</td>
                <td>Cap on number of selected chips (multi only)</td>
              </tr>
              <tr>
                <td><code>required</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Prevent deselecting the last selected chip</td>
              </tr>
              <tr>
                <td><code>orientation</code></td>
                <td><code>'horizontal' | 'vertical'</code></td>
                <td><code>'horizontal'</code></td>
                <td>Layout direction</td>
              </tr>
              <tr>
                <td><code>wrap</code></td>
                <td><code>boolean</code></td>
                <td><code>true</code></td>
                <td>Wrap chips to next line; when false, group scrolls horizontally</td>
              </tr>
              <tr>
                <td><code>size</code></td>
                <td><code>'s' | 'm' | 'l'</code></td>
                <td><code>'m'</code></td>
                <td>Shared size for all chips</td>
              </tr>
              <tr>
                <td><code>variant</code></td>
                <td><code>'bold' | 'subtle' | 'ghost'</code></td>
                <td>-</td>
                <td>Shared variant for all chips (overridable per chip)</td>
              </tr>
              <tr>
                <td><code>appearance</code></td>
                <td><code>ChipAppearance</code></td>
                <td>-</td>
                <td>Shared appearance role for all chips</td>
              </tr>
              <tr>
                <td><code>disabled</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Disable the entire group</td>
              </tr>
            </tbody>
          </table>
        </FoundationCard>
      </div>
    </div>
  );
}
