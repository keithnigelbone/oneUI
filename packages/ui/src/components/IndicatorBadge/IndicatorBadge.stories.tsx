/**
 * IndicatorBadge.stories.tsx
 * Storybook documentation for IndicatorBadge component
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect, userEvent } from 'storybook/test';
import { IndicatorBadge } from './IndicatorBadge';
import type { IndicatorBadgeSize } from './IndicatorBadge.shared';
import { Surface } from '../Surface';
import React from 'react';

/** Figma API appearance values (node 10212:20316). */
const FIGMA_APPEARANCES = [
  'auto',
  'neutral',
  'primary',
  'secondary',
  'sparkle',
  'negative',
  'positive',
  'informative',
  'warning',
] as const;

/** Figma component container size order (node 2540:21183). */
const FIGMA_SIZE_ORDER: Array<{ size: IndicatorBadgeSize; label: string }> = [
  { size: 'm', label: 'M' },
  { size: 'xs', label: 'XS' },
  { size: 's', label: 'S' },
  { size: 'l', label: 'L' },
  { size: 'xl', label: 'XL' },
];

const meta = {
  title: 'Components/Display/IndicatorBadge',
  component: IndicatorBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Non-interactive status/presence indicator dot. Supports multi-accent appearance roles and five sizes (XS/S/M/L/XL).',
      },
    },
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 's', 'm', 'l', 'xl'],
      description: 'Indicator size',
      table: { defaultValue: { summary: 'm' } },
    },
    appearance: {
      control: 'radio',
      options: [...FIGMA_APPEARANCES, 'brand-bg'],
      description: 'Multi-accent appearance role (`brand-bg` is code-only extension)',
      table: { defaultValue: { summary: 'auto' } },
    },
  },
};

export default meta;
type Story = StoryObj<typeof IndicatorBadge>;

/** Label style for section headers */
const sectionLabelStyle: React.CSSProperties = {
  fontSize: 'var(--Label-S-FontSize)',
  color: 'var(--Text-Low)',
};

// 1. Default
export const Default: Story = {
  args: {
    'aria-label': 'New',
    size: 'm',
  },
};

// 2. Sizes — Figma container order (M, XS, S, L, XL)
export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-4)',
        alignItems: 'flex-start',
      }}
    >
      {FIGMA_SIZE_ORDER.map(({ size, label }) => (
        <div
          key={label}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--Spacing-5)',
            minHeight: 'var(--Spacing-10)',
          }}
        >
          <IndicatorBadge size={size} appearance="negative" aria-label={`Size ${label}`} />
          <span
            style={{
              fontFamily: 'var(--Typography-Font-Primary)',
              fontSize: 'var(--Label-XS-FontSize)',
              lineHeight: 'var(--Label-XS-LineHeight)',
              color: 'var(--Text-Low)',
            }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  ),
};

// 3. Appearances — Figma API table order
export const Appearances: Story = {
  name: 'Appearances',
  render: () => (
    <div className="story-column" style={{ gap: 'var(--Spacing-4-5)' }}>
      {FIGMA_APPEARANCES.filter((role) => role !== 'auto').map((role) => (
        <div
          key={role}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--Spacing-4)',
          }}
        >
          <IndicatorBadge appearance={role} aria-label={`${role} status`} />
          <span
            style={{
              fontFamily: 'var(--Typography-Font-Primary)',
              fontSize: 'var(--Label-S-FontSize)',
              lineHeight: 'var(--Label-S-LineHeight)',
              color: 'var(--Text-Low)',
              textTransform: 'capitalize',
            }}
          >
            {role}
          </span>
        </div>
      ))}
    </div>
  ),
};

// 3b. Code-only API — Figma "dev / value" row (N/A in design tool)
export const CodeOnlyApi: Story = {
  name: 'Code only (value)',
  parameters: {
    docs: {
      description: {
        story:
          'Figma lists a code-only **dev → value** row (N/A in the design file). IndicatorBadge is intentionally non-numeric — it does not expose a `value` prop. Use CounterBadge when a count must be shown or announced.',
      },
    },
  },
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-4)',
        maxWidth: 'var(--Spacing-40)',
        fontFamily: 'var(--Typography-Font-Primary)',
        fontSize: 'var(--Body-S-FontSize)',
        lineHeight: 'var(--Body-S-LineHeight)',
        color: 'var(--Text-Medium)',
      }}
    >
      <IndicatorBadge appearance="negative" aria-label="Unread status" />
      <p>
        No <code>value</code> prop — status is conveyed via <code>aria-label</code> only. Code-only
        extensions: <code>className</code>, <code>style</code>, <code>data-testid</code>,{' '}
        <code>brand-bg</code> appearance.
      </p>
    </div>
  ),
};

// 4. Surface Context — all 5 surface modes in a flat list
export const SurfaceContext: Story = {
  name: 'Surface Context',
  render: () => {
    const surfaceModes = [
      { mode: 'default' as const, label: 'default', desc: 'page background' },
      { mode: 'minimal' as const, label: 'minimal', desc: 'light tint' },
      { mode: 'subtle' as const, label: 'subtle', desc: 'medium tint' },
      { mode: 'moderate' as const, label: 'moderate', desc: 'heavier tint' },
      { mode: 'bold' as const, label: 'bold', desc: 'full accent colour' },
      { mode: 'elevated' as const, label: 'elevated', desc: 'floating card / popover' },
    ];

    const contentStyle: React.CSSProperties = {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 'var(--Spacing-4)',
      padding: 'var(--Spacing-5)',
      borderRadius: 'var(--Shape-4)',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
        {surfaceModes.map(({ mode, label, desc }) => (
          <div key={mode} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
            <span style={sectionLabelStyle}>{label} — {desc}</span>
            <Surface mode={mode} style={contentStyle}>
              <IndicatorBadge aria-label="Status" />
              <IndicatorBadge appearance="positive" aria-label="Online" />
              <IndicatorBadge appearance="negative" aria-label="Offline" />
            </Surface>
          </div>
        ))}
      </div>
    );
  },
};

// 5. Interactive
export const Interactive: Story = {
  args: {
    'aria-label': 'New notification',
    size: 'm',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByRole('status');

    // Verify badge exists
    await expect(badge).toBeInTheDocument();

    // Verify accessible label
    await expect(badge).toHaveAttribute('aria-label', 'New notification');
  },
};

// 6. Responsive
export const Responsive: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => (
    <div className="story-row" style={{ gap: 'var(--Spacing-4-5)', alignItems: 'center' }}>
      <IndicatorBadge size="xs" aria-label="XS indicator" />
      <IndicatorBadge size="s" aria-label="S indicator" />
      <IndicatorBadge size="m" aria-label="M indicator" />
      <IndicatorBadge size="l" aria-label="L indicator" />
      <IndicatorBadge size="xl" aria-label="XL indicator" />
    </div>
  ),
};

// 7. Themes
export const Themes: Story = {
  render: () => {
    const bgModes = [
      { mode: 'default' as const, label: 'default' },
      { mode: 'minimal' as const, label: 'minimal' },
      { mode: 'subtle' as const, label: 'subtle' },
      { mode: 'elevated' as const, label: 'elevated' },
    ];

    const cellStyle: React.CSSProperties = {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 'var(--Spacing-4)',
      padding: 'var(--Spacing-4-5)',
      borderRadius: 'var(--Shape-4)',
    };

    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--Spacing-4)',
        }}
      >
        {bgModes.map(({ mode, label }) => (
          <div
            key={mode}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--Spacing-4-5)',
            }}
          >
            <span style={{ ...sectionLabelStyle, width: 90 }}>{label}</span>
            <Surface mode={mode} style={cellStyle}>
              <IndicatorBadge aria-label="Primary" />
              <IndicatorBadge appearance="positive" aria-label="Positive" />
              <IndicatorBadge appearance="negative" aria-label="Negative" />
              <IndicatorBadge appearance="warning" aria-label="Warning" />
              <IndicatorBadge appearance="informative" aria-label="Info" />
            </Surface>
          </div>
        ))}
      </div>
    );
  },
};

// 8. Motion — Entry/exit with subtle motion accessibility
function IndicatorMotionDemo({
  appearance,
  size,
  reducedMotion = false,
}: Pick<React.ComponentProps<typeof IndicatorBadge>, 'appearance' | 'size'> & {
  reducedMotion?: boolean;
}) {
  const [visible, setVisible] = React.useState(true);

  const entryExitStyle: React.CSSProperties = reducedMotion
    ? {
        transition: `opacity var(--Motion-Duration-Subtle-M) var(--Motion-Easing-Transition-Subtle)`,
        opacity: visible ? 1 : 0,
      }
    : {
        transition: visible
          ? `opacity var(--Motion-Duration-L) var(--Motion-Easing-Entrance-Moderate), transform var(--Motion-Duration-L) var(--Motion-Easing-Entrance-Moderate)`
          : `opacity var(--Motion-Duration-M) var(--Motion-Easing-Exit-Moderate), transform var(--Motion-Duration-M) var(--Motion-Easing-Exit-Moderate)`,
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1)' : 'scale(0.5)',
      };

  const columnStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--Spacing-3)',
  };

  return (
    <div className="story-column" style={{ gap: 'var(--Spacing-5)', alignItems: 'center' }}>
      <div className="story-row" style={{ gap: 'var(--Spacing-3-5)', justifyContent: 'center' }}>
        <button onClick={() => setVisible(true)} style={indicatorMotionControlStyle}>Entry</button>
        <button onClick={() => setVisible(false)} style={indicatorMotionControlStyle}>Exit</button>
        <button onClick={() => setVisible(true)} style={indicatorMotionControlStyle}>Reset</button>
      </div>

      <div className="story-row" style={{ gap: 'var(--Spacing-4-5)', alignItems: 'center', justifyContent: 'center' }}>
        {(['primary', 'positive', 'negative'] as const).map((role) => (
          <div key={role} style={columnStyle}>
            <span style={sectionLabelStyle}>{role[0].toUpperCase() + role.slice(1)}</span>
            <div style={entryExitStyle}>
              <IndicatorBadge appearance={appearance === 'auto' ? role : appearance} size={size} aria-label={`${role} status`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const indicatorMotionControlStyle: React.CSSProperties = {
  padding: 'var(--Spacing-1) var(--Spacing-3-5)',
  borderRadius: 'var(--Shape-3)',
  border: 'var(--Stroke-M) solid var(--Primary-Stroke-Low)',
  background: 'var(--Primary-Subtle)',
  color: 'var(--Text-High)',
  cursor: 'pointer',
  fontSize: 'var(--Label-XS-FontSize)',
  fontFamily: 'var(--Typography-Font-Primary, inherit)',
};

export const Motion: Story = {
  name: 'Motion',
  parameters: {
    docs: {
      source: {
        language: 'css',
        code: `/* Entry: opacity + scale, L duration, Entrance easing */
.entry {
  transition:
    opacity var(--Motion-Duration-L) var(--Motion-Easing-Entrance-Moderate),
    transform var(--Motion-Duration-L) var(--Motion-Easing-Entrance-Moderate);
  opacity: 1;
  transform: scale(1);
}

/* Exit: opacity + scale, M duration, Exit easing */
.exit {
  transition:
    opacity var(--Motion-Duration-M) var(--Motion-Easing-Exit-Moderate),
    transform var(--Motion-Duration-M) var(--Motion-Easing-Exit-Moderate);
  opacity: 0;
  transform: scale(0.5);
}

/* Subtle motion (reduced motion) — opacity only */
.subtle .entry,
.subtle .exit {
  transition: opacity var(--Motion-Duration-Subtle-M) var(--Motion-Easing-Transition-Subtle);
  transform: none;
}`,
      },
    },
  },
  args: {
    appearance: 'auto',
    size: 'm',
  },
  argTypes: {
    subtleMotion: {
      name: 'Subtle motion',
      control: 'boolean',
      description: 'Subtle motion (reduced motion accessibility mode)',
      table: {
        category: 'Accessibility',
        defaultValue: { summary: 'false' },
      },
    },
  } as any,
  // @ts-expect-error — subtleMotion is a story-level arg not on IndicatorBadgeProps
  render: (args) => <IndicatorMotionDemo appearance={args.appearance} size={args.size} reducedMotion={args.subtleMotion} />,
  play: async ({ canvasElement, args }) => {
    // @ts-expect-error — subtleMotion is a story-level arg
    if (!args.subtleMotion) return;

    const canvas = within(canvasElement);

    const assertNoTransformMotion = (label: string) => {
      const allElements = canvasElement.querySelectorAll('*');
      allElements.forEach((el) => {
        const styles = getComputedStyle(el);

        const animName = styles.animationName;
        if (animName && animName !== 'none') {
          expect(animName, `[${label}] Element has active CSS animation "${animName}" — scale/position animations must be disabled in subtle motion`).toBe('none');
        }

        const transitionProp = styles.transitionProperty;
        if (transitionProp && transitionProp !== 'none') {
          const hasTransform = transitionProp.split(',').some(
            (p) => p.trim() === 'transform' || p.trim() === 'all',
          );
          expect(hasTransform, `[${label}] Element transitions "${transitionProp}" — transform transitions must be disabled in subtle motion`).toBe(false);
        }
      });
    };

    const entryBtn = canvas.getByText('Entry');
    await userEvent.click(entryBtn);
    assertNoTransformMotion('Entry');

    const exitBtn = canvas.getByText('Exit');
    await userEvent.click(exitBtn);
    assertNoTransformMotion('Exit');
  },
};

// 9. With Components — overlaid positioning example
export const WithComponents: Story = {
  name: 'With Components',
  render: () => (
    <div className="story-row" style={{ gap: 'var(--Spacing-6)', alignItems: 'center' }}>
      {/* Avatar-like container with indicator */}
      <div style={{ position: 'relative', display: 'inline-flex' }}>
        <div
          style={{
            width: 'var(--Spacing-10)',
            height: 'var(--Spacing-10)',
            borderRadius: 'var(--Shape-Pill)',
            backgroundColor: 'var(--Neutral-Subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--Label-M-FontSize)',
            color: 'var(--Text-High)',
          }}
        >
          A
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            border: 'var(--Spacing-0-5) solid var(--Surface-Default)',
            borderRadius: 'var(--Shape-Pill)',
          }}
        >
          <IndicatorBadge size="s" appearance="positive" aria-label="Online" />
        </div>
      </div>

      {/* Icon button-like container with notification dot */}
      <div style={{ position: 'relative', display: 'inline-flex' }}>
        <div
          style={{
            width: 'var(--Spacing-9)',
            height: 'var(--Spacing-9)',
            borderRadius: 'var(--Shape-Pill)',
            backgroundColor: 'var(--Neutral-Subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 'var(--Spacing-5)', height: 'var(--Spacing-5)' }}>
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
          </svg>
        </div>
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
          }}
        >
          <IndicatorBadge size="xs" appearance="negative" aria-label="3 notifications" />
        </div>
      </div>
    </div>
  ),
};
