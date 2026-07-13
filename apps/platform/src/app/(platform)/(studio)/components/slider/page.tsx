/**
 * components/slider/page.tsx
 *
 * Slider component showcase page
 * Displays sizes, range, orientation, and usage examples
 */

'use client';

import React from 'react';
import { Slider } from '@oneui/ui/components/Slider';
import { Surface } from '@oneui/ui/components/Surface';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import styles from '../component.module.css';

export default function SliderPage() {
  const [volume, setVolume] = React.useState(50);
  const [brightness, setBrightness] = React.useState(75);
  const [priceRange, setPriceRange] = React.useState<number[]>([25, 75]);
  const [verticalValue, setVerticalValue] = React.useState(30);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Slider</h1>
        <p className={styles.description}>
          Slider component for selecting numeric values or ranges with smooth dragging interaction and keyboard support.
        </p>
      </div>

      <div className={styles.content}>
        {/* Default */}
        <FoundationCard title="Default" description="Basic slider with single value.">
          <div className={styles.showcaseColumn}>
            <p style={{ color: 'var(--Text-Medium)', fontSize: 'var(--Typography-Size-S)', margin: 0 }}>
              Value: {volume}
            </p>
            <Slider
              value={volume}
              onValueChange={(val) => setVolume(val as number)}
              min={0}
              max={100}
              aria-label="Volume"
            />
          </div>
        </FoundationCard>

        {/* Sizes */}
        <FoundationCard title="Sizes" description="Three size presets for different UI contexts.">
          <div className={styles.showcaseColumn}>
            <div className={styles.showcaseItem}>
              <span className={styles.showcaseLabel}>Small</span>
              <Slider
                value={50}
                onValueChange={() => {}}
                aria-label="Small slider"
              />
            </div>
            <div className={styles.showcaseItem}>
              <span className={styles.showcaseLabel}>Medium</span>
              <Slider
                value={50}
                onValueChange={() => {}}
                aria-label="Medium slider"
              />
            </div>
            <div className={styles.showcaseItem}>
              <span className={styles.showcaseLabel}>Large</span>
              <Slider
                value={50}
                onValueChange={() => {}}
                aria-label="Large slider"
              />
            </div>
          </div>
        </FoundationCard>

        {/* Range Slider */}
        <FoundationCard title="Range" description="Slider with two handles for selecting a range.">
          <div className={styles.showcaseColumn}>
            <p style={{ color: 'var(--Text-Medium)', fontSize: 'var(--Typography-Size-S)', margin: 0 }}>
              Price range: ${priceRange[0]} - ${priceRange[1]}
            </p>
            <Slider
              value={priceRange}
              onValueChange={(val) => setPriceRange(val as number[])}
              min={0}
              max={100}
              aria-label="Price range"
            />
          </div>
        </FoundationCard>

        {/* States */}
        <FoundationCard title="States" description="Different slider states.">
          <div className={styles.showcaseColumn}>
            <div className={styles.showcaseItem}>
              <span className={styles.showcaseLabel}>Default</span>
              <Slider
                value={50}
                onValueChange={() => {}}
                aria-label="Default slider"
              />
            </div>
            <div className={styles.showcaseItem}>
              <span className={styles.showcaseLabel}>Disabled</span>
              <Slider
                value={50}
                onValueChange={() => {}}
                disabled
                aria-label="Disabled slider"
              />
            </div>
            <div className={styles.showcaseItem}>
              <span className={styles.showcaseLabel}>With Step</span>
              <Slider
                value={50}
                onValueChange={() => {}}
                step={10}
                min={0}
                max={100}
                aria-label="Slider with step"
              />
            </div>
          </div>
        </FoundationCard>

        {/* Vertical Orientation */}
        <FoundationCard title="Vertical Orientation" description="Slider can be oriented vertically.">
          <div className={styles.showcase}>
            <div style={{ height: '200px', display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4-5)' }}>
              <Slider
                value={verticalValue}
                onValueChange={(val) => setVerticalValue(val as number)}
                orientation="vertical"
                min={0}
                max={100}
                aria-label="Vertical slider"
              />
              <p style={{ color: 'var(--Text-Medium)', fontSize: 'var(--Typography-Size-S)', margin: 0 }}>
                Value: {verticalValue}
              </p>
            </div>
          </div>
        </FoundationCard>

        {/* Interactive Examples */}
        <FoundationCard title="Interactive - Volume Control" description="Adjust the volume level.">
          <div className={styles.showcaseColumn}>
            <p style={{ color: 'var(--Text-Medium)', fontSize: 'var(--Typography-Size-S)', margin: 0 }}>
              Volume: {volume}%
            </p>
            <Slider
              value={volume}
              onValueChange={(val) => setVolume(val as number)}
              min={0}
              max={100}
              aria-label="Volume control"
            />
          </div>
        </FoundationCard>

        <FoundationCard title="Interactive - Brightness" description="Adjust the screen brightness.">
          <div className={styles.showcaseColumn}>
            <p style={{ color: 'var(--Text-Medium)', fontSize: 'var(--Typography-Size-S)', margin: 0 }}>
              Brightness: {brightness}%
            </p>
            <Slider
              value={brightness}
              onValueChange={(val) => setBrightness(val as number)}
              min={0}
              max={100}
              aria-label="Brightness control"
            />
          </div>
        </FoundationCard>

        {/* Surface Context */}
        <FoundationCard
          title="Surface Context"
          description="Slider adapts when placed on different surface backgrounds."
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
                }}
              >
                <span style={{
                  color: 'var(--Text-High)',
                  minWidth: '100px',
                  margin: 0,
                  fontWeight: 'var(--Typography-Weight-Medium)',
                  fontSize: 'var(--Typography-Size-S)',
                }}>
                  {label}
                </span>
                <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
                  <Slider
                    value={50}
                    onValueChange={() => {}}
                    min={0}
                    max={100}
                    aria-label={`Slider on ${label}`}
                  />
                </div>
              </Surface>
            ))}
          </div>
        </FoundationCard>

        {/* Usage */}
        <FoundationCard title="Usage" description="Import and use the Slider component." collapsible>
          <pre className={styles.codeBlock}>{`import { Slider } from '@oneui/ui';

function VolumeControl() {
  const [volume, setVolume] = React.useState(50);

  return (
    <Slider
      value={volume}
      onValueChange={(val) => setVolume(val as number)}
      min={0}
      max={100}
      step={1}
      size="medium"
      aria-label="Volume"
    />
  );
}

// Range slider
function PriceFilter() {
  const [range, setRange] = React.useState<number[]>([25, 75]);

  return (
    <Slider
      value={range}
      onValueChange={(val) => setRange(val as number[])}
      min={0}
      max={100}
      aria-label="Price range"
    />
  );
}`}</pre>
        </FoundationCard>

        {/* Props */}
        <FoundationCard title="Props" description="Available props for Slider component." collapsible>
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
                <td><code>number | number[]</code></td>
                <td>-</td>
                <td>Current value (controlled). Array for range slider</td>
              </tr>
              <tr>
                <td><code>defaultValue</code></td>
                <td><code>number | number[]</code></td>
                <td>-</td>
                <td>Default value (uncontrolled)</td>
              </tr>
              <tr>
                <td><code>onValueChange</code></td>
                <td><code>(value: number | number[]) =&gt; void</code></td>
                <td>-</td>
                <td>Called when value changes</td>
              </tr>
              <tr>
                <td><code>onValueCommitted</code></td>
                <td><code>(value: number | number[]) =&gt; void</code></td>
                <td>-</td>
                <td>Called when user stops dragging</td>
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
                <td><code>step</code></td>
                <td><code>number</code></td>
                <td><code>1</code></td>
                <td>Step increment</td>
              </tr>
              <tr>
                <td><code>size</code></td>
                <td><code>'small' | 'medium' | 'large'</code></td>
                <td><code>'medium'</code></td>
                <td>Size preset</td>
              </tr>
              <tr>
                <td><code>disabled</code></td>
                <td><code>boolean</code></td>
                <td><code>false</code></td>
                <td>Whether the slider is disabled</td>
              </tr>
              <tr>
                <td><code>orientation</code></td>
                <td><code>'horizontal' | 'vertical'</code></td>
                <td><code>'horizontal'</code></td>
                <td>Slider orientation</td>
              </tr>
              <tr>
                <td><code>aria-label</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Accessible label</td>
              </tr>
              <tr>
                <td><code>className</code></td>
                <td><code>string</code></td>
                <td>-</td>
                <td>Additional class name</td>
              </tr>
            </tbody>
          </table>
        </FoundationCard>
      </div>
    </div>
  );
}
