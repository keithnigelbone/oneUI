/**
 * IconButton.stories.tsx
 * Storybook documentation for IconButton component
 *
 * Uses Figma terminology: Attention (High/Medium/Low) instead of variant (bold/subtle/ghost).
 * The `attention` prop is the primary API; `variant` is kept internally for CSS class resolution.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, expect } from 'storybook/test';
import { IconButton } from './IconButton';
import { Surface } from '../Surface';
import { computeResponsiveDensityOverrides } from '@oneui/shared';
import type { BreakpointId, DensityId } from '@oneui/shared';
import React from 'react';

// Placeholder icon — no inline size styles so the IconButton's
// .icon svg CSS rules (--_ib-icon-size tokens) control the size.
const PreviewIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
  </svg>
);

// Use explicit args type to avoid Storybook inference issues
type IconButtonStoryArgs = {
  attention?: 'high' | 'medium' | 'low';
  size?: number | string;
  appearance?: string;
  condensed?: boolean;
  layout?: '1:1' | '3:2';
  contained?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
};

const meta = {
  title: 'Components/Actions/IconButton',
  component: IconButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Icon-only interactive element for compact actions. Uses Attention levels (High/Medium/Low) aligned with Figma. 6 sizes, condensed mode, 1:1/3:2 shape layouts. Requires aria-label for accessibility.',
      },
    },
  },
  argTypes: {
    attention: {
      control: 'radio',
      options: ['high', 'medium', 'low'],
      description: 'Attention level — High (filled), Medium (tinted), Low (transparent)',
      table: {
        defaultValue: { summary: 'high' },
      },
    },
    size: {
      control: 'select',
      options: ['2xs', 'xs', 's', 'm', 'l', 'xl'],
      description: 'Icon button size — 2XS to XL (default: M)',
      table: {
        defaultValue: { summary: 'm' },
      },
    },
    appearance: {
      control: 'radio',
      options: ['auto', 'primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'],
      description: 'Multi-accent appearance role',
      table: {
        defaultValue: { summary: 'auto' },
      },
    },
    condensed: {
      control: 'boolean',
      description: 'Condensed mode — reduced container size, same icon size',
    },
    layout: {
      control: 'radio',
      options: ['1:1', '3:2'],
      description: 'Shape layout — 1:1 (square) or 3:2 (wide rectangle). Only when contained=true.',
      table: {
        defaultValue: { summary: '1:1' },
      },
    },
    contained: {
      control: 'boolean',
      description: 'Contained chip (default) vs icon-only uncontained form',
      table: {
        defaultValue: { summary: 'true' },
      },
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretch to fill container width. Only when contained=true.',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
    loading: {
      control: 'boolean',
      description: 'Loading state',
    },
  },
};

export default meta;
type Story = StoryObj<IconButtonStoryArgs>;

/** Label style for section headers */
const sectionLabelStyle: React.CSSProperties = { fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' };

// 1. Default — with attention/size/appearance/condensed/layout controls
export const Default: Story = {
  args: {
    attention: 'high',
    size: 'm',
    condensed: false,
    layout: '1:1',
  },
  render: ({ ...args }: any) => (
    <IconButton
      {...args}
      icon={<PreviewIcon />}
      aria-label="Add item"
    />
  ),
};

// 2. Attention Levels (Figma: High / Medium / Low)
export const AttentionLevels: Story = {
  name: 'Attention Levels',
  render: () => (
    <div className="story-row">
      <IconButton icon={<PreviewIcon />} attention="high" aria-label="High" />
      <IconButton icon={<PreviewIcon />} attention="medium" aria-label="Medium" />
      <IconButton icon={<PreviewIcon />} attention="low" aria-label="Low" />
    </div>
  ),
};

// 3. Sizes — All 6 sizes in a row
export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div className="story-row" style={{ alignItems: 'center' }}>
      <IconButton icon={<PreviewIcon />} size="2xs" aria-label="2XS" />
      <IconButton icon={<PreviewIcon />} size="xs" aria-label="XS" />
      <IconButton icon={<PreviewIcon />} size="s" aria-label="S" />
      <IconButton icon={<PreviewIcon />} size="m" aria-label="M" />
      <IconButton icon={<PreviewIcon />} size="l" aria-label="L" />
      <IconButton icon={<PreviewIcon />} size="xl" aria-label="XL" />
    </div>
  ),
};

// 4. Condensed — Default vs condensed comparison
export const Condensed: Story = {
  name: 'Condensed',
  render: () => (
    <div className="story-column" style={{ gap: 'var(--Spacing-4-5)' }}>
      <div>
        <span style={sectionLabelStyle}>Normal</span>
        <div className="story-row" style={{ alignItems: 'center' }}>
          <IconButton icon={<PreviewIcon />} size="s" aria-label="S" />
          <IconButton icon={<PreviewIcon />} size="m" aria-label="M" />
          <IconButton icon={<PreviewIcon />} size="l" aria-label="L" />
        </div>
      </div>
      <div>
        <span style={sectionLabelStyle}>Condensed (same icon size, reduced container)</span>
        <div className="story-row" style={{ alignItems: 'center' }}>
          <IconButton icon={<PreviewIcon />} size="s" condensed aria-label="S condensed" />
          <IconButton icon={<PreviewIcon />} size="m" condensed aria-label="M condensed" />
          <IconButton icon={<PreviewIcon />} size="l" condensed aria-label="L condensed" />
        </div>
      </div>
    </div>
  ),
};

// 4b. Contained vs Uncontained (Figma `contained` axis)
export const ContainedUncontained: Story = {
  name: 'Contained vs Uncontained',
  render: () => (
    <div className="story-column" style={{ gap: 'var(--Spacing-4-5)' }}>
      <div>
        <span style={sectionLabelStyle}>Contained (default) — sized chip with fill</span>
        <div className="story-row" style={{ alignItems: 'center' }}>
          <IconButton icon={<PreviewIcon />} attention="high" aria-label="Contained high" />
          <IconButton icon={<PreviewIcon />} attention="medium" aria-label="Contained medium" />
          <IconButton icon={<PreviewIcon />} attention="low" aria-label="Contained low" />
        </div>
      </div>
      <div>
        <span style={sectionLabelStyle}>Uncontained — icon only, attention drives icon colour</span>
        <div className="story-row" style={{ alignItems: 'center' }}>
          <IconButton icon={<PreviewIcon />} contained={false} attention="high" aria-label="Uncontained high" />
          <IconButton icon={<PreviewIcon />} contained={false} attention="medium" aria-label="Uncontained medium" />
          <IconButton icon={<PreviewIcon />} contained={false} attention="low" aria-label="Uncontained low" />
        </div>
      </div>
    </div>
  ),
};

// 5. States — Default/Disabled/Loading
export const States: Story = {
  render: () => (
    <div className="story-row">
      <IconButton icon={<PreviewIcon />} attention="high" aria-label="Default" />
      <IconButton icon={<PreviewIcon />} attention="high" disabled aria-label="Disabled" />
      <IconButton icon={<PreviewIcon />} attention="high" loading aria-label="Loading" />
    </div>
  ),
};

// 5b. Focus State — force-renders the focus ring via data-force-state
export const FocusState: Story = {
  name: 'Focus State',
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-5)', alignItems: 'flex-end' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)', alignItems: 'center' }}>
        <IconButton icon={<PreviewIcon />} attention="high" aria-label="Default" />
        <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)' }}>Idle</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)', alignItems: 'center' }}>
        <div data-force-state="focus" style={{ display: 'inline-flex' }}>
          <IconButton icon={<PreviewIcon />} attention="high" aria-label="Focused" />
        </div>
        <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)' }}>Focus</span>
      </div>
    </div>
  ),
};

// 6. Appearances — All 9 roles x 3 attention levels grid
export const Appearances: Story = {
  name: 'Appearances',
  render: () => (
    <div className="story-column" style={{ gap: 'var(--Spacing-4-5)' }}>
      {(['primary', 'secondary', 'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative'] as const).map((role) => (
        <div key={role} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
          <span style={{ ...sectionLabelStyle, textTransform: 'capitalize' }}>
            {role}
          </span>
          <div className="story-row">
            <IconButton icon={<PreviewIcon />} appearance={role} attention="high" aria-label={`${role} high`} />
            <IconButton icon={<PreviewIcon />} appearance={role} attention="medium" aria-label={`${role} medium`} />
            <IconButton icon={<PreviewIcon />} appearance={role} attention="low" aria-label={`${role} low`} />
          </div>
        </div>
      ))}
    </div>
  ),
};

// 7. Shapes — 1:1 vs 3:2 comparison
export const Shapes: Story = {
  name: 'Shape Layouts',
  render: () => (
    <div className="story-column" style={{ gap: 'var(--Spacing-4-5)' }}>
      <div>
        <span style={sectionLabelStyle}>1:1 (square, default)</span>
        <div className="story-row" style={{ alignItems: 'center' }}>
          <IconButton icon={<PreviewIcon />} layout="1:1" attention="high" aria-label="1:1 high" />
          <IconButton icon={<PreviewIcon />} layout="1:1" attention="medium" aria-label="1:1 medium" />
          <IconButton icon={<PreviewIcon />} layout="1:1" attention="low" aria-label="1:1 low" />
        </div>
      </div>
      <div>
        <span style={sectionLabelStyle}>3:2 (wide rectangle)</span>
        <div className="story-row" style={{ alignItems: 'center' }}>
          <IconButton icon={<PreviewIcon />} layout="3:2" attention="high" aria-label="3:2 high" />
          <IconButton icon={<PreviewIcon />} layout="3:2" attention="medium" aria-label="3:2 medium" />
          <IconButton icon={<PreviewIcon />} layout="3:2" attention="low" aria-label="3:2 low" />
        </div>
      </div>
    </div>
  ),
};

// 8. Full Width
export const FullWidth: Story = {
  render: () => (
    <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3-5)' }}>
      <IconButton icon={<PreviewIcon />} fullWidth attention="high" aria-label="Full width high" />
      <IconButton icon={<PreviewIcon />} fullWidth attention="medium" aria-label="Full width medium" />
      <IconButton icon={<PreviewIcon />} fullWidth attention="low" aria-label="Full width low" />
    </div>
  ),
};

// 9. Interactive
export const Interactive: Story = {
  args: {
    attention: 'high',
    size: 'm',
  },
  render: ({ ...args }: any) => (
    <IconButton
      {...args}
      icon={<PreviewIcon />}
      aria-label="Add item"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Verify button exists and is accessible
    await expect(button).toBeInTheDocument();
    await expect(button).toHaveAccessibleName('Add item');

    // Test click
    await userEvent.click(button);

    // Test keyboard navigation
    await userEvent.tab();
    await expect(button).toHaveFocus();

    // Test keyboard activation
    await userEvent.keyboard('{Enter}');
    await userEvent.keyboard(' ');
  },
};

// 10. Responsive
export const Responsive: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => (
    <div className="story-row" style={{ width: '100%', justifyContent: 'space-between' }}>
      <IconButton icon={<PreviewIcon />} aria-label="Menu" />
      <IconButton icon={<PreviewIcon />} aria-label="Search" />
      <IconButton icon={<PreviewIcon />} aria-label="Notifications" />
      <IconButton icon={<PreviewIcon />} aria-label="Profile" />
    </div>
  ),
};

// 11. Themes — BG surface modes
export const Themes: Story = {
  render: () => {
    const bgModes = [
      { mode: 'default' as const, label: 'default' },
      { mode: 'minimal' as const, label: 'minimal' },
      { mode: 'subtle' as const, label: 'subtle' },
      { mode: 'elevated' as const, label: 'elevated' },
    ];

    const cellStyle: React.CSSProperties = {
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--Spacing-4)',
      padding: 'var(--Spacing-4-5)', borderRadius: 'var(--Shape-4)',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
        {bgModes.map(({ mode, label }) => (
          <div key={mode} style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4-5)' }}>
            <span style={{ ...sectionLabelStyle, width: 90 }}>{label}</span>
            <Surface mode={mode} style={cellStyle}>
              <IconButton icon={<PreviewIcon />} attention="high" aria-label={`${label} high`} />
              <IconButton icon={<PreviewIcon />} attention="medium" aria-label={`${label} medium`} />
              <IconButton icon={<PreviewIcon />} attention="low" aria-label={`${label} low`} />
            </Surface>
          </div>
        ))}
      </div>
    );
  },
};

// 12. Surface Context — all 5 surface modes in a flat list
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
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--Spacing-4)',
      padding: 'var(--Spacing-5)', borderRadius: 'var(--Shape-4)',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
        {surfaceModes.map(({ mode, label, desc }) => (
          <div key={mode} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
            <span style={sectionLabelStyle}>{label} — {desc}</span>
            <Surface mode={mode} style={contentStyle}>
              <IconButton icon={<PreviewIcon />} attention="high" aria-label={`${label} high`} />
              <IconButton icon={<PreviewIcon />} attention="medium" aria-label={`${label} medium`} />
              <IconButton icon={<PreviewIcon />} attention="low" aria-label={`${label} low`} />
            </Surface>
          </div>
        ))}
      </div>
    );
  },
};

// 13. Density — Compact/default/open
export const Density: Story = {
  render: () => {
    const platform: BreakpointId = 'S';
    const densities: { id: DensityId; label: string }[] = [
      { id: 'compact', label: 'compact' },
      { id: 'default', label: 'default' },
      { id: 'open', label: 'open' },
    ];

    return (
      <div className="story-row">
        {densities.map(({ id, label }) => (
          <div
            key={id}
            className="density-card"
            data-density={id}
            data-Breakpoint={platform}
            data-6-Density={id}
            style={computeResponsiveDensityOverrides(platform, id)}
          >
            <span>{label}</span>
            <div className="story-column">
              <IconButton icon={<PreviewIcon />} size="s" aria-label={`${label} S`} />
              <IconButton icon={<PreviewIcon />} size="m" aria-label={`${label} M`} />
              <IconButton icon={<PreviewIcon />} size="l" aria-label={`${label} L`} />
            </div>
          </div>
        ))}
      </div>
    );
  },
};

// 14. Loading States — Loading across sizes
export const LoadingStates: Story = {
  name: 'Loading States',
  render: () => (
    <div className="story-column" style={{ gap: 'var(--Spacing-4-5)' }}>
      <div className="story-row">
        <IconButton icon={<PreviewIcon />} loading attention="high" aria-label="Loading high" />
        <IconButton icon={<PreviewIcon />} loading attention="medium" aria-label="Loading medium" />
        <IconButton icon={<PreviewIcon />} loading attention="low" aria-label="Loading low" />
      </div>
      <div className="story-row" style={{ alignItems: 'center' }}>
        <IconButton icon={<PreviewIcon />} loading size="2xs" aria-label="Loading 2XS" />
        <IconButton icon={<PreviewIcon />} loading size="xs" aria-label="Loading XS" />
        <IconButton icon={<PreviewIcon />} loading size="s" aria-label="Loading S" />
        <IconButton icon={<PreviewIcon />} loading size="m" aria-label="Loading M" />
        <IconButton icon={<PreviewIcon />} loading size="l" aria-label="Loading L" />
        <IconButton icon={<PreviewIcon />} loading size="xl" aria-label="Loading XL" />
      </div>
    </div>
  ),
};

// Motion — Tap interaction: surface colour change + scale up
//
// From Convex motion foundations (JIO_INTERACTION_PATTERNS → tap → Scale Up):
//   Surface Colour: background-color, Duration-M, Transition easing
//   Scale Up: 7% (1.07), Duration-M, Transition easing, interruptible
//
// Subtle: surface colour only, no scale/transform.

const iconButtonMotionCSS = `
  .ib-motion-wrap {
    display: flex;
    transition: opacity var(--Motion-Duration-M) var(--Motion-Easing-Transition-Moderate);
  }
  .ib-motion-wrap.ib-motion-disabled {
    opacity: 0.3;
    pointer-events: none;
  }
  .ib-motion-subtle button:active {
    transform: none !important;
  }
`;

function IconButtonMotionDemo({
  appearance,
  size,
  condensed,
  layout,
  fullWidth,
  disabled,
  loading,
  reducedMotion = false,
}: {
  appearance?: React.ComponentProps<typeof IconButton>['appearance'];
  size?: React.ComponentProps<typeof IconButton>['size'];
  condensed?: boolean;
  layout?: React.ComponentProps<typeof IconButton>['layout'];
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  reducedMotion?: boolean;
}) {
  const columnStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--Spacing-3)',
  };

  const sectionLabel: React.CSSProperties = {
    fontSize: 'var(--Typography-Size-S)',
    color: 'var(--Text-Low)',
  };

  return (
    <>
      <style>{iconButtonMotionCSS}</style>
      <div
        className={`story-column${reducedMotion ? ' ib-motion-subtle' : ''}`}
        style={{ gap: 'var(--Spacing-5)', alignItems: fullWidth ? 'stretch' : 'center', width: fullWidth ? '320px' : undefined }}
      >
        <div
          className="story-column"
          style={{ gap: 'var(--Spacing-3-5)', alignItems: fullWidth ? 'stretch' : 'center', width: '100%' }}
        >
          {(['high', 'medium', 'low'] as const).map((attention) => (
            <div key={attention} style={columnStyle}>
              <span style={sectionLabel}>{attention[0].toUpperCase() + attention.slice(1)}</span>
              <div className={`ib-motion-wrap${disabled ? ' ib-motion-disabled' : ''}`} style={fullWidth ? { width: '100%' } : undefined}>
                <IconButton icon={<PreviewIcon />} attention={attention} appearance={appearance} size={size} condensed={condensed} layout={layout} fullWidth={fullWidth} loading={loading} aria-label={`${attention} icon button`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export const Motion: Story = {
  name: 'Motion',
  parameters: {
    docs: {
      source: {
        language: 'css',
        code: `/* Tap interaction — in IconButton.module.css (component-level)
   Scale tokens (overridable per brand via Convex):
     --Motion-Tap-Scale-Up: 7        (default 1:1 + condensed — scale UP)
     --Motion-Tap-Scale-Default: 3   (wide 3:2 — scale DOWN)
     --Motion-Tap-Scale-FullWidth: 1 (full-width — scale DOWN)
   Duration: M, Easing: Transition-Moderate */

.iconButton {
  --_tap-scale: var(--Motion-Tap-Scale-Up, 7);
  --_tap-direction: 1; /* 1 = up, -1 = down */
  transition:
    background-color var(--Motion-Duration-M) var(--Motion-Easing-Transition-Moderate),
    transform var(--Motion-Duration-M) var(--Motion-Easing-Transition-Moderate),
    opacity var(--Motion-Duration-M) var(--Motion-Easing-Transition-Moderate);
}
/* Wide (3:2): Scale Down 3% */
.iconButton[data-layout="3:2"] {
  --_tap-scale: var(--Motion-Tap-Scale-Default, 3);
  --_tap-direction: -1;
}
/* Full-width: Scale Down 1% */
.fullWidth {
  --_tap-scale: var(--Motion-Tap-Scale-FullWidth, 1);
  --_tap-direction: -1;
}
.iconButton:active:not(.disabled) {
  transform: scale(calc(1 + var(--_tap-direction) * var(--_tap-scale) / 100));
}

/* Reduced motion: no scale */
@media (prefers-reduced-motion: reduce) {
  .iconButton:active:not(.disabled) { transform: none; }
}`,
      },
    },
  },
  args: {
    appearance: 'auto' as any,
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
  // @ts-expect-error — subtleMotion is a story-level arg
  render: (args) => <IconButtonMotionDemo appearance={args.appearance} size={args.size} condensed={args.condensed} layout={args.layout} fullWidth={args.fullWidth} disabled={args.disabled} loading={args.loading} reducedMotion={args.subtleMotion} />,
  play: async ({ canvasElement, args }) => {
    // @ts-expect-error — subtleMotion is a story-level arg
    if (!args.subtleMotion) return;

    const assertNoTransformMotion = (label: string) => {
      canvasElement.querySelectorAll('*').forEach((el) => {
        const styles = getComputedStyle(el);

        const animName = styles.animationName;
        if (animName && animName !== 'none' && animName !== 'iconButtonSpin') {
          expect(animName, `[${label}] Active CSS animation "${animName}" — must be disabled in subtle motion`).toBe('none');
        }

        const transitionProp = styles.transitionProperty;
        if (transitionProp && transitionProp !== 'none') {
          const hasTransform = transitionProp.split(',').some(
            (p) => p.trim() === 'transform' || p.trim() === 'all',
          );
          expect(hasTransform, `[${label}] Transitions "${transitionProp}" — transform must be disabled in subtle motion`).toBe(false);
        }
      });
    };

    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');
    for (const btn of buttons) {
      await userEvent.click(btn);
      assertNoTransformMotion('Tap');
    }
  },
};
