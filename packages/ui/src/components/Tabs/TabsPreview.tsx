/**
 * TabsPreview.tsx
 *
 * Single-source-of-truth preview component for Tabs.
 * Renders an orientation × size grid (showAllVariations) or a single-orientation column.
 * Used by both the docs page and the advanced token editor.
 */

'use client';

import React, { useState } from 'react';
import { TabGroup } from './TabGroup';
import { TabItem } from './TabItem';
import type { TabsOrientation, TabsSize } from './Tabs.shared';
import type { ComponentAppearance } from '@oneui/shared';

const ORIENTATIONS: readonly TabsOrientation[] = ['horizontal', 'vertical'];
const SIZES: readonly { size: TabsSize; label: string }[] = [
  { size: 's', label: 'S' },
  { size: 'm', label: 'M' },
  { size: 'l', label: 'L' },
];

export interface TabsPreviewProps {
  /** CSS custom property overrides applied to the preview container. */
  tokens: Record<string, string>;
  /** Currently highlighted orientation (single mode). */
  selectedVariant?: string;
  /** Currently highlighted size. */
  selectedSize?: string;
  /** Show full orientation × size grid. */
  showAllVariations?: boolean;
  /** Appearance role to preview. */
  appearance?: ComponentAppearance;
  /** Called when a grid cell is clicked. */
  onCellSelect?: (variant: string, size: string) => void;
  onVariantSelect?: (variant: string) => void;
  onSizeSelect?: (size: string) => void;
}

function PreviewTabs({
  orientation,
  size,
  appearance,
}: {
  orientation: TabsOrientation;
  size: TabsSize;
  appearance?: ComponentAppearance;
}) {
  const [value, setValue] = useState<string | number | null>('one');
  return (
    <TabGroup
      value={value}
      onValueChange={setValue}
      orientation={orientation}
      size={size}
      appearance={appearance}
    >
      <TabItem value="one">Tab 1</TabItem>
      <TabItem value="two">Tab 2</TabItem>
      <TabItem value="three">Tab 3</TabItem>
    </TabGroup>
  );
}

export function TabsPreview({
  tokens,
  selectedVariant,
  selectedSize = 'm',
  showAllVariations = false,
  appearance,
  onCellSelect,
  onVariantSelect,
}: TabsPreviewProps) {
  if (showAllVariations) {
    return (
      <div style={tokens} data-draggable="false">
        <table style={{ borderCollapse: 'separate', borderSpacing: 'var(--Spacing-4)' }}>
          <thead>
            <tr>
              <th />
              {SIZES.map(({ size, label }) => (
                <th
                  key={size}
                  style={{
                    fontSize: 'var(--Label-XS-FontSize)',
                    fontWeight: 'var(--Label-FontWeight-Medium)',
                    color: 'var(--Text-Low)',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    padding: 'var(--Spacing-3-5)',
                  }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ORIENTATIONS.map((orientation) => (
              <tr key={orientation}>
                <td
                  style={{
                    fontSize: 'var(--Label-XS-FontSize)',
                    fontWeight: 'var(--Label-FontWeight-Medium)',
                    color: 'var(--Text-Low)',
                    paddingRight: 'var(--Spacing-4-5)',
                    verticalAlign: 'middle',
                    textTransform: 'capitalize',
                  }}
                >
                  {orientation}
                </td>
                {SIZES.map(({ size }) => {
                  const variantMatch = selectedVariant === undefined || selectedVariant === orientation;
                  const sizeMatch = selectedSize === undefined || selectedSize === size;
                  const isSelected = variantMatch && sizeMatch;
                  const isExactCell = selectedVariant === orientation && selectedSize === size;
                  return (
                    <td
                      key={`${orientation}-${size}`}
                      data-selected={isSelected || undefined}
                      onClick={onCellSelect ? () => onCellSelect(orientation, size) : undefined}
                      style={{
                        padding: 'var(--Spacing-3-5)',
                        verticalAlign: 'middle',
                        textAlign: 'center',
                        cursor: onCellSelect ? 'pointer' : undefined,
                        outline: isSelected
                          ? `${isExactCell ? '2px' : '1px'} solid var(--Primary-Tinted, var(--Surface-Bold))`
                          : undefined,
                        outlineOffset: isSelected ? '2px' : undefined,
                        borderRadius: isSelected ? 'var(--Shape-3-5)' : undefined,
                        minWidth: orientation === 'vertical' ? '120px' : undefined,
                      }}
                    >
                      <PreviewTabs orientation={orientation} size={size} appearance={appearance} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const orientation = (selectedVariant || 'horizontal') as TabsOrientation;
  const size = (selectedSize || 'm') as TabsSize;

  return (
    <div
      style={{
        ...tokens,
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-4-5)',
        alignItems: 'center',
        minWidth: '200px',
      }}
    >
      {ORIENTATIONS.map((o) => (
        <div
          key={o}
          onClick={onVariantSelect ? () => onVariantSelect(o) : undefined}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--Spacing-3)',
            padding: 'var(--Spacing-3-5)',
            borderRadius: 'var(--Shape-4)',
            cursor: onVariantSelect ? 'pointer' : 'default',
            border:
              orientation === o
                ? 'var(--Stroke-M) solid var(--Border-Subtle)'
                : 'var(--Stroke-M) solid transparent',
            transition: 'all var(--Motion-Duration-M) var(--Motion-Easing-Transition-Moderate)',
          }}
        >
          <PreviewTabs orientation={o} size={size} appearance={appearance} />
          <span
            style={{
              fontSize: 'var(--Label-XS-FontSize)',
              color: orientation === o ? 'var(--Text-High)' : 'var(--Text-Low)',
              textTransform: 'capitalize',
            }}
          >
            {o}
          </span>
        </div>
      ))}
    </div>
  );
}

export default TabsPreview;
