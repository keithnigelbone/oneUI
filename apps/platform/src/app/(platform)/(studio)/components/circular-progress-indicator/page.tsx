/**
 * components/circular-progress-indicator/page.tsx
 *
 * CircularProgressIndicator component showcase page
 * Displays variants, sizes, appearances, content modes, and usage examples
 */

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { CircularProgressIndicator } from '@oneui/ui/components/CircularProgressIndicator';
import { Icon } from '@oneui/ui/components/Icon';
import { Surface } from '@oneui/ui/components/Surface';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import { useSurfaceTokenVarsNew as useSurfaceTokenVars } from '@oneui/ui/hooks/useSurfaceTokenVarsNew';
import { useFoundationData } from '@/components/FoundationStyleProvider';
import { usePlatformContext } from '@/contexts/PlatformContext';
import styles from '../component.module.css';

const sizes = ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'] as const;
const appearances = ['primary', 'secondary', 'sparkle', 'neutral', 'positive', 'negative', 'warning', 'informative'] as const;

function AnimatedDemo({ allRoleSurfaceVars }: { allRoleSurfaceVars: Record<string, string> }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setValue((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 50);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className={styles.showcase} style={{ ...allRoleSurfaceVars }}>
      <div className={styles.showcaseItem}>
        <CircularProgressIndicator value={value} size="4XL" content="text" aria-label="Animated progress" />
        <span className={styles.showcaseLabel}>Animated</span>
      </div>
    </div>
  );
}

interface CircularProgressIndicatorContentProps {
  allRoleSurfaceVars: Record<string, string>;
}

function CircularProgressIndicatorContent({ allRoleSurfaceVars }: CircularProgressIndicatorContentProps) {
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>CircularProgressIndicator</h1>
        <p className={styles.description}>
          Circular progress indicators provide a visual representation of the current progress
          of a task, such as a file upload or content loading. Supports determinate and
          indeterminate variants with 10 size presets and 9 multi-accent appearance roles.
        </p>
      </div>
      <div className={styles.content}>
        {/* Variants */}
        <FoundationCard title="Variants" description="Determinate shows arc proportional to value; indeterminate shows a spinning animation.">
          <div className={styles.showcase} style={{ ...allRoleSurfaceVars }}>
            <div className={styles.showcaseItem}>
              <CircularProgressIndicator variant="determinate" value={65} size="3XL" aria-label="Determinate" />
              <span className={styles.showcaseLabel}>Determinate</span>
            </div>
            <div className={styles.showcaseItem}>
              <CircularProgressIndicator variant="indeterminate" size="3XL" aria-label="Indeterminate" />
              <span className={styles.showcaseLabel}>Indeterminate</span>
            </div>
          </div>
        </FoundationCard>

        {/* Sizes */}
        <FoundationCard title="Sizes" description="10 size presets mapping to spacing dimension tokens (2XS through 5XL).">
          <div className={styles.showcase} style={{ ...allRoleSurfaceVars }}>
            {sizes.map((size) => (
              <div key={size} className={styles.showcaseItem}>
                <CircularProgressIndicator value={65} size={size} aria-label={`${size} progress`} />
                <span className={styles.showcaseLabel}>{size}</span>
              </div>
            ))}
          </div>
        </FoundationCard>

        {/* Appearances */}
        <FoundationCard title="Appearances" description="Multi-accent appearance roles control indicator and track color.">
          <div className={styles.showcase} style={{ ...allRoleSurfaceVars }}>
            {appearances.map((appearance) => (
              <div key={appearance} className={styles.showcaseItem}>
                <CircularProgressIndicator value={65} size="3XL" appearance={appearance} aria-label={`${appearance} progress`} />
                <span className={styles.showcaseLabel}>{appearance}</span>
              </div>
            ))}
          </div>
        </FoundationCard>

        {/* Content Modes */}
        <FoundationCard title="Content" description="Center content can show auto-computed percentage text or a custom icon.">
          <div className={styles.showcaseColumn}>
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars }}>
              {(['L', 'XL', '2XL', '3XL', '4XL', '5XL'] as const).map((size) => (
                <div key={size} className={styles.showcaseItem}>
                  <CircularProgressIndicator value={25} size={size} content="text" aria-label={`Text ${size}`} />
                  <span className={styles.showcaseLabel}>{size} text</span>
                </div>
              ))}
            </div>
            <div className={styles.showcase} style={{ ...allRoleSurfaceVars }}>
              {(['XL', '2XL', '3XL', '4XL', '5XL'] as const).map((size) => (
                <div key={size} className={styles.showcaseItem}>
                  <CircularProgressIndicator value={50} size={size} content="icon" aria-label={`Icon ${size}`}>
                    <Icon icon="download" emphasis="high" size="3" />
                  </CircularProgressIndicator>
                  <span className={styles.showcaseLabel}>{size} icon</span>
                </div>
              ))}
            </div>
          </div>
        </FoundationCard>

        {/* States */}
        <FoundationCard title="States" description="Different progress values showing the arc fill.">
          <div className={styles.showcase} style={{ ...allRoleSurfaceVars }}>
            {[0, 25, 50, 75, 100].map((v) => (
              <div key={v} className={styles.showcaseItem}>
                <CircularProgressIndicator value={v} size="3XL" content="text" aria-label={`${v}% complete`} />
                <span className={styles.showcaseLabel}>{v}%</span>
              </div>
            ))}
          </div>
        </FoundationCard>

        {/* Animated */}
        <FoundationCard title="Interactive" description="Animated progress demonstrating smooth transitions.">
          <AnimatedDemo allRoleSurfaceVars={allRoleSurfaceVars} />
        </FoundationCard>

        {/* Surface Context */}
        <FoundationCard title="Surface Context" description="Indicator adapts when placed on different surface modes.">
          <div className={styles.showcase} style={{ ...allRoleSurfaceVars }}>
            {([
              { mode: 'default' as const, label: 'Default' },
              { mode: 'minimal' as const, label: 'Minimal' },
              { mode: 'subtle' as const, label: 'Subtle' },
              { mode: 'moderate' as const, label: 'Moderate' },
              { mode: 'bold' as const, label: 'Bold' },
              { mode: 'elevated' as const, label: 'Elevated' },
            ]).map(({ mode, label }) => (
              <Surface key={mode} mode={mode} style={{ borderRadius: 'var(--Shape-3)' }}>
                <div className={styles.showcaseItem} style={{ padding: 'var(--Spacing-4-5)' }}>
                  <CircularProgressIndicator value={65} size="3XL" aria-label={`${label} surface`} />
                  <span className={styles.showcaseLabel}>{label}</span>
                </div>
              </Surface>
            ))}
          </div>
        </FoundationCard>

        {/* Usage */}
        <FoundationCard title="Usage" description="Import and use the CircularProgressIndicator component." collapsible>
          <pre className={styles.codeBlock}>
{`import { CircularProgressIndicator } from '@oneui/ui';
import { Icon } from '@oneui/ui';

// Basic determinate (25%)
<CircularProgressIndicator value={25} aria-label="25% complete" />

// Indeterminate (loading spinner)
<CircularProgressIndicator variant="indeterminate" aria-label="Loading" />

// With auto-percentage text
<CircularProgressIndicator value={75} size="3XL" content="text" aria-label="75%" />

// With custom icon
<CircularProgressIndicator value={50} size="2XL" content="icon" aria-label="Downloading">
  <Icon icon="download" />
</CircularProgressIndicator>

// Appearance role
<CircularProgressIndicator value={90} appearance="positive" aria-label="Almost done" />

// Custom range
<CircularProgressIndicator value={7} min={0} max={10} aria-label="7 of 10" />`}
          </pre>
        </FoundationCard>

        {/* Props */}
        <FoundationCard title="Props" description="Available props for the CircularProgressIndicator component." collapsible>
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
                <td><code>variant</code></td>
                <td><code>&apos;determinate&apos; | &apos;indeterminate&apos;</code></td>
                <td><code>&apos;determinate&apos;</code></td>
                <td>Loading mode</td>
              </tr>
              <tr>
                <td><code>size</code></td>
                <td><code>&apos;2XS&apos; | &apos;XS&apos; | &apos;S&apos; | &apos;M&apos; | &apos;L&apos; | &apos;XL&apos; | &apos;2XL&apos; | &apos;3XL&apos; | &apos;4XL&apos; | &apos;5XL&apos;</code></td>
                <td><code>&apos;M&apos;</code></td>
                <td>Size preset (maps to spacing tokens)</td>
              </tr>
              <tr>
                <td><code>appearance</code></td>
                <td><code>&apos;auto&apos; | &apos;primary&apos; | &apos;secondary&apos; | &apos;sparkle&apos; | &apos;neutral&apos; | &apos;positive&apos; | &apos;negative&apos; | &apos;warning&apos; | &apos;informative&apos;</code></td>
                <td><code>&apos;auto&apos;</code></td>
                <td>Multi-accent appearance role</td>
              </tr>
              <tr>
                <td><code>content</code></td>
                <td><code>&apos;none&apos; | &apos;icon&apos; | &apos;text&apos;</code></td>
                <td><code>&apos;none&apos;</code></td>
                <td>Center content mode</td>
              </tr>
              <tr>
                <td><code>value</code></td>
                <td><code>number</code></td>
                <td>-</td>
                <td>Current value. Omit for indeterminate.</td>
              </tr>
              <tr>
                <td><code>min</code></td>
                <td><code>number</code></td>
                <td><code>0</code></td>
                <td>Minimum value</td>
              </tr>
              <tr>
                <td><code>max</code></td>
                <td><code>number</code></td>
                <td><code>100</code></td>
                <td>Maximum value</td>
              </tr>
              <tr>
                <td><code>children</code></td>
                <td><code>ReactNode</code></td>
                <td>-</td>
                <td>Icon slot (when content=&apos;icon&apos;)</td>
              </tr>
              <tr>
                <td><code>aria-label</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Accessible label (required)</td>
              </tr>
              <tr>
                <td><code>aria-labelledby</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>ID of labelling element</td>
              </tr>
            </tbody>
          </table>
        </FoundationCard>
      </div>
    </div>
  );
}

export default function CircularProgressIndicatorPage() {
  const foundationData = useFoundationData();
  const { theme } = usePlatformContext();
  const themeKey: 'light' | 'dark' = theme === 'dark' ? 'dark' : 'light';

  const { surfaceVars: allRoleSurfaceVars } = useSurfaceTokenVars({
    foundationData,
    theme: themeKey,
  });

  return <CircularProgressIndicatorContent allRoleSurfaceVars={allRoleSurfaceVars} />;
}
