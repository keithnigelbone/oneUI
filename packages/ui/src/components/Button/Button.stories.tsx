/**
 * Button.stories.tsx
 * Storybook documentation for Button component
 *
 * Uses Figma terminology: Attention (High/Medium/Low) instead of variant (bold/subtle/ghost).
 * The `attention` prop is the primary API; `variant` is kept internally for CSS class resolution.
 *
 * Variant display logic lives in Button.showcase.tsx — imported here and in the platform
 * documentation page so both stay in sync with zero duplication.
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, expect } from 'storybook/test';
import { Button } from './Button';
import { Surface } from '../Surface';
import { computeResponsiveDensityOverrides } from '@oneui/shared';
import type { BreakpointId, DensityId } from '@oneui/shared';
import React from 'react';
import {
  ButtonAttentionLevels,
  ButtonSizes,
  ButtonCondensed,
  ButtonStates,
  ButtonFocusState,
  ButtonWithSlots,
  ButtonAppearances,
  ButtonFullWidth,
  ButtonSurfaceContext,
  ButtonSurfaceShowcase,
} from './Button.showcase';

// Placeholder icon for slot controls — no inline size styles so the Button's
// .start svg / .end svg CSS rules (--Button-iconSize tokens) control the size.
const SlotIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
      fill="currentColor"
    />
  </svg>
);

const meta: Meta<typeof Button> = {
  title: 'Components/Actions/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Primary interactive element for triggering actions. Uses Attention levels (High/Medium/Low) aligned with Figma. Supports multi-accent appearance roles and f-step sizing.',
      },
    },
  },
  argTypes: {
    // --- Primary props ---
    children: {
      control: 'text',
      description: 'Button label text',
    },
    attention: {
      control: 'radio',
      options: ['high', 'medium', 'low'],
      description: 'Attention level — High (filled bold), Medium (tinted subtle), Low (transparent ghost)',
      table: { defaultValue: { summary: 'high' } },
    },
    size: {
      control: 'select',
      options: ['xs', 's', 'm', 'l'],
      description: 'Button size — XS (f6), S (f8), M (f10, default), L (f12)',
      table: { defaultValue: { summary: 'm' } },
    },
    appearance: {
      control: 'radio',
      options: [
        'auto',
        'primary',
        'secondary',
        'neutral',
        'sparkle',
        'brand-bg',
        'positive',
        'negative',
        'warning',
        'informative',
      ],
      description: 'Multi-accent appearance role — auto resolves to primary',
      table: { defaultValue: { summary: 'auto' } },
    },
    // --- Slots ---
    start: {
      control: 'boolean',
      description: 'Content before the label (icon, avatar, badge). Boolean in controls — passes a placeholder icon.',
      table: { defaultValue: { summary: 'false' } },
    },
    end: {
      control: 'boolean',
      description: 'Content after the label (icon, avatar, badge). Boolean in controls — passes a placeholder icon.',
      table: { defaultValue: { summary: 'false' } },
    },
    // --- State ---
    disabled: {
      control: 'boolean',
      description: 'Disabled state — prevents interaction and applies reduced opacity',
    },
    loading: {
      control: 'boolean',
      description: 'Loading state — shows spinner, disables interaction',
    },
    contained: {
      control: 'boolean',
      description: 'Figma `Contained` variant. true = filled pill (default). false = delegates to LinkButton for the transparent text-link form. Dropping to false ignores condensed / fullWidth / decoration. For label-less icon buttons use `<IconButton>` directly.',
      table: { defaultValue: { summary: 'true' } },
    },
    condensed: {
      control: 'boolean',
      description: 'Condensed mode — reduced height and padding, same typography. For dense layouts. Only applies when contained=true.',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Stretch to fill container width',
    },
    // --- Events ---
    onPress: {
      action: 'pressed',
      description: 'Called when the button is activated (click or keyboard)',
      table: { category: 'Events' },
    },
    onClick: {
      action: 'clicked',
      description: 'Web alias for onPress — prefer onPress for cross-platform compatibility',
      table: { category: 'Events' },
    },
    // --- Accessibility ---
    'aria-label': {
      control: 'text',
      description: 'Accessible label override — optional; Button always has a visible label.',
      table: { category: 'Accessibility' },
    },
    // --- HTML ---
    type: {
      control: 'radio',
      options: ['button', 'submit', 'reset'],
      description: 'HTML button type attribute',
      table: { defaultValue: { summary: 'button' }, category: 'HTML' },
    },
    // --- Hidden (internal / deprecated) ---
    leftIcon: { table: { disable: true } },
    rightIcon: { table: { disable: true } },
    decoration: { table: { disable: true } },
    className: { table: { disable: true } },
    style: { table: { disable: true } },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// 1. Default — start/end controls are boolean toggles that map to ReactNode slots in render()
export const Default: Story = {
  args: {
    children: 'Button',
    attention: 'high',
    size: 'm',
    start: false,
    end: false,
    condensed: false,
  },
  render: ({ start, end, ...rest }: React.ComponentProps<typeof Button> & { start?: unknown; end?: unknown }) => (
    <Button
      {...rest}
      start={start ? <SlotIcon /> : undefined}
      end={end ? <SlotIcon /> : undefined}
    />
  ),
};

// 2. Attention Levels (Figma: High / Medium / Low)
export const AttentionLevels: Story = {
  name: 'Attention Levels',
  render: () => <ButtonAttentionLevels />,
};

// 3. Sizes — XS/S/M/L aligned with Figma spec
export const Sizes: Story = {
  name: 'Sizes',
  render: () => <ButtonSizes />,
};

// 3b. Condensed Mode — reduced height + padding, same typography
export const Condensed: Story = {
  name: 'Condensed',
  render: () => <ButtonCondensed />,
};

// 3c. Contained — filled pill vs transparent text form. `contained={true}`
// (default) renders the filled pill; `contained={false}` renders the
// transparent accent-text form (delegates to LinkButton so the uncontained
// form stays consistent with the canonical text-link primitive).
export const Contained: Story = {
  name: 'Contained',
  render: () => (
    <div className="story-column" style={{ gap: 'var(--Spacing-4-5)' }}>
      <div className="story-row" style={{ alignItems: 'center', gap: 'var(--Spacing-4)' }}>
        <span style={{ minWidth: 120, fontSize: 'var(--Label-S-FontSize)', lineHeight: 'var(--Label-S-LineHeight)', color: 'var(--Text-Low)' }}>
          contained=true
        </span>
        <Button size="xs">Extra Small</Button>
        <Button size="s">Small</Button>
        <Button size="m">Medium</Button>
        <Button size="l">Large</Button>
      </div>
      <div className="story-row" style={{ alignItems: 'center', gap: 'var(--Spacing-4)' }}>
        <span style={{ minWidth: 120, fontSize: 'var(--Label-S-FontSize)', lineHeight: 'var(--Label-S-LineHeight)', color: 'var(--Text-Low)' }}>
          contained=false
        </span>
        <Button size="xs" contained={false}>Extra Small</Button>
        <Button size="s" contained={false}>Small</Button>
        <Button size="m" contained={false}>Medium</Button>
        <Button size="l" contained={false}>Large</Button>
      </div>
    </div>
  ),
};

// 3c. Slot-Aware Padding — padding automatically reduces when icons are present
export const SlotPadding: Story = {
  name: 'Slot-Aware Padding',
  render: () => (
    <div className="story-column" style={{ gap: 'var(--Spacing-4-5)' }}>
      <div>
        <span style={{ fontSize: 'var(--Label-S-FontSize)', lineHeight: 'var(--Label-S-LineHeight)', color: 'var(--Text-Low)' }}>
          Without slots (wider padding)
        </span>
        <div className="story-row" style={{ alignItems: 'center' }}>
          <Button size="xs">Extra Small</Button>
          <Button size="s">Small</Button>
          <Button size="m">Medium</Button>
          <Button size="l">Large</Button>
        </div>
      </div>
      <div>
        <span style={{ fontSize: 'var(--Label-S-FontSize)', lineHeight: 'var(--Label-S-LineHeight)', color: 'var(--Text-Low)' }}>
          With start slot (reduced padding + size-specific gap)
        </span>
        <div className="story-row" style={{ alignItems: 'center' }}>
          <Button size="xs" start={<SlotIcon />}>Extra Small</Button>
          <Button size="s" start={<SlotIcon />}>Small</Button>
          <Button size="m" start={<SlotIcon />}>Medium</Button>
          <Button size="l" start={<SlotIcon />}>Large</Button>
        </div>
      </div>
      <div>
        <span style={{ fontSize: 'var(--Label-S-FontSize)', lineHeight: 'var(--Label-S-LineHeight)', color: 'var(--Text-Low)' }}>
          With both slots
        </span>
        <div className="story-row" style={{ alignItems: 'center' }}>
          <Button size="xs" start={<SlotIcon />} end={<SlotIcon />}>Extra Small</Button>
          <Button size="s" start={<SlotIcon />} end={<SlotIcon />}>Small</Button>
          <Button size="m" start={<SlotIcon />} end={<SlotIcon />}>Medium</Button>
          <Button size="l" start={<SlotIcon />} end={<SlotIcon />}>Large</Button>
        </div>
      </div>
    </div>
  ),
};

// 4. States
export const States: Story = {
  render: () => <ButtonStates />,
};

// 4b. Focus State — force-renders the keyboard focus ring via data-force-state
export const FocusState: Story = {
  name: 'Focus State',
  render: () => <ButtonFocusState />,
};

// 5. With Slots (start/end)
export const WithSlots: Story = {
  name: 'With Start/End Slots',
  render: () => <ButtonWithSlots />,
};

// 6. Appearances — all 9 multi-accent roles × 3 attention levels
export const Appearances: Story = {
  name: 'Appearances',
  render: () => <ButtonAppearances />,
};

// 7. Full Width
export const FullWidth: Story = {
  render: () => (
    <div style={{ width: '320px' }}>
      <ButtonFullWidth />
    </div>
  ),
};

// 8. Interactive
export const Interactive: Story = {
  args: {
    children: 'Click me',
    attention: 'high',
    size: 'm',
  },
  play: async ({ canvasElement }: any) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');

    // Verify button exists
    await expect(button).toBeInTheDocument();

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

// 9. Responsive
export const Responsive: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => (
    <div className="story-column" style={{ width: '100%' }}>
      <Button size="l" fullWidth>
        Full-Width Action
      </Button>
      <div className="story-row">
        <Button size="s" attention="low">
          Cancel
        </Button>
        <Button size="s" attention="high">
          Confirm
        </Button>
      </div>
    </div>
  ),
};

// 10. Themes — all BG surface modes × attention levels (theme via toolbar)
export const Themes: Story = {
  render: () => {
    const bgModes = [
      { mode: 'default' as const, label: 'default' },
      { mode: 'minimal' as const, label: 'minimal' },
      { mode: 'subtle' as const, label: 'subtle' },
      { mode: 'moderate' as const, label: 'moderate' },
      { mode: 'bold' as const, label: 'bold' },
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
        {bgModes.map(({ mode, label }) => (
          <div
            key={mode}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4-5)' }}
          >
            <span style={{ ...sectionLabelStyle, width: 90 }}>{label}</span>
            <Surface mode={mode} style={cellStyle}>
              <Button attention="high">High</Button>
              <Button attention="medium">Medium</Button>
              <Button attention="low">Low</Button>
            </Surface>
          </div>
        ))}
      </div>
    );
  },
};

// 11. Loading with Icons
export const LoadingWithSlots: Story = {
  name: 'Loading with Slots',
  render: () => (
    <div className="story-column" style={{ gap: 'var(--Spacing-4-5)' }}>
      <div className="story-row">
        <Button loading attention="high">
          Loading
        </Button>
        <Button loading attention="medium">
          Loading
        </Button>
        <Button loading attention="low">
          Loading
        </Button>
      </div>
      <div className="story-row">
        <Button loading start={<SlotIcon />}>
          With Start
        </Button>
        <Button loading end={<SlotIcon />}>
          With End
        </Button>
        <Button loading start={<SlotIcon />} end={<SlotIcon />}>
          Both
        </Button>
      </div>
      <div className="story-row">
        <Button loading size="s">
          Small
        </Button>
        <Button loading size="m">
          Medium
        </Button>
        <Button loading size="l">
          Large
        </Button>
      </div>
    </div>
  ),
};

/** Label style for section headers */
const sectionLabelStyle: React.CSSProperties = {
  fontSize: 'var(--Label-S-FontSize)',
  lineHeight: 'var(--Label-S-LineHeight)',
  color: 'var(--Text-Low)',
};

// 12. Surface Context — standard backgrounds + accent surfaces
export const SurfaceContext: Story = {
  name: 'Surface Context',
  render: () => <ButtonSurfaceContext />,
};

// 12a. Surfaces — the full surface ladder (default → elevated). Identical to
// the platform docs "Variants on Surfaces" section (both render the shared
// ButtonSurfaceShowcase), so Storybook and the platform never drift.
export const Surfaces: Story = {
  name: 'Surfaces',
  render: () => <ButtonSurfaceShowcase />,
};

// 12b. Metallic Material — simulates a brand material assignment. The brand
// engine emits --{Role}-Material-Fill / --{Role}-Material-Text only when the
// role has an active metal assigned (Materials foundation → Metals tab +
// Appearance → material assignments). Bold buttons then pick the metallic
// fill via the --_btn-material-* fallback chain; subtle/ghost are unaffected.
export const MetallicMaterial: Story = {
  name: 'Metallic Material',
  render: () => (
    <div className="story-column" style={{ gap: 'var(--Spacing-4)' }}>
      {([
        ['Gold', 'Gold'],
        ['Silver', 'Silver'],
        ['Bronze', 'Bronze'],
      ] as const).map(([label, metal]) => (
        <div
          key={metal}
          className="story-row"
          style={{
            gap: 'var(--Spacing-4)',
            alignItems: 'center',
            '--Primary-Material-Fill': `var(--Material-Metallic-${metal}-Fill)`,
            '--Primary-Material-Text': `var(--Material-Metallic-${metal}-Text)`,
          } as React.CSSProperties}
        >
          <Button attention="high">{label} bold</Button>
          <Button attention="medium">Subtle unchanged</Button>
          <Button attention="low">Ghost unchanged</Button>
        </div>
      ))}
    </div>
  ),
};

// 15. Density — each card uses resolved dimension overrides for full cascade isolation
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
              <Button size="s">Small</Button>
              <Button size="m">Medium</Button>
              <Button size="l">Large</Button>
            </div>
          </div>
        ))}
      </div>
    );
  },
};

// Motion — Tap interaction: surface colour change + scale down
//
// From Convex motion foundations (JIO_INTERACTION_PATTERNS → tap):
//   Surface Colour: background-color, Duration-M, Transition easing
//   Scale Down: 3% (0.97), Duration-M, Transition easing, interruptible
//
// Subtle: surface colour only, no scale/transform.

/** CSS for disable animation + subtle motion override in the story.
 *  Tap scale-down is now in Button.module.css (component-level). */
const buttonMotionCSS = `
  .btn-motion-wrap {
    display: flex;
    transition: opacity var(--Motion-Duration-M) var(--Motion-Easing-Transition-Moderate);
  }
  .btn-motion-wrap.btn-motion-disabled {
    opacity: 0.3;
    pointer-events: none;
  }
  /* Subtle: no scale on tap */
  .btn-motion-subtle button:active {
    transform: none !important;
  }
`;

function ButtonMotionDemo({
  appearance,
  size,
  fullWidth,
  disabled,
  loading,
  reducedMotion = false,
}: {
  appearance?: React.ComponentProps<typeof Button>['appearance'];
  size?: React.ComponentProps<typeof Button>['size'];
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
    fontSize: 'var(--Label-S-FontSize)',
    lineHeight: 'var(--Label-S-LineHeight)',
    color: 'var(--Text-Low)',
  };

  return (
    <>
      <style>{buttonMotionCSS}</style>
      <div
        className={`story-column${reducedMotion ? ' btn-motion-subtle' : ''}`}
        style={{ gap: 'var(--Spacing-5)', alignItems: fullWidth ? 'stretch' : 'center', width: fullWidth ? '320px' : undefined }}
      >
        <div
          className="story-column"
          style={{ gap: 'var(--Spacing-3-5)', alignItems: fullWidth ? 'stretch' : 'center', width: '100%' }}
        >
          {(['high', 'medium', 'low'] as const).map((attention) => (
            <div key={attention} style={columnStyle}>
              <span style={sectionLabel}>{attention[0].toUpperCase() + attention.slice(1)}</span>
              <div className={`btn-motion-wrap${disabled ? ' btn-motion-disabled' : ''}`} style={fullWidth ? { width: '100%' } : undefined}>
                <Button attention={attention} appearance={appearance} size={size} fullWidth={fullWidth} loading={loading}>
                  Tap me
                </Button>
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
        code: `/* Tap interaction — in Button.module.css (component-level)
   Scale tokens (overridable per brand via Convex):
     --Motion-Tap-Scale-XS: 7         (XS — data-size="6")
     --Motion-Tap-Scale-Default: 3    (S / M / L — default)
     --Motion-Tap-Scale-FullWidth: 1  (full-width)
   All scale DOWN. Duration: M, Easing: Transition-Moderate */

.button {
  --_tap-scale: var(--Motion-Tap-Scale-Default, 3);
  transition:
    background-color var(--Motion-Duration-M) var(--Motion-Easing-Transition-Moderate),
    transform var(--Motion-Duration-M) var(--Motion-Easing-Transition-Moderate),
    opacity var(--Motion-Duration-M) var(--Motion-Easing-Transition-Moderate);
}
.button[data-size="6"] { --_tap-scale: var(--Motion-Tap-Scale-XS, 7); }
.button.fullWidth { --_tap-scale: var(--Motion-Tap-Scale-FullWidth, 1); }
.button:active:not(.disabled) {
  transform: scale(calc(1 - var(--_tap-scale) / 100));
}

/* Reduced motion: no scale */
@media (prefers-reduced-motion: reduce) {
  .button:active:not(.disabled) { transform: none; }
}`,
      },
    },
  },
  args: {
    appearance: 'auto' as any,
    size: 'm',
    subtleMotion: false,
    fullWidth: true,
    attention: 'high',
  } as any,
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
  render: (args: any) => (
    <ButtonMotionDemo
      appearance={args.appearance}
      size={args.size}
      fullWidth={args.fullWidth}
      disabled={args.disabled}
      loading={args.loading}
      reducedMotion={args.subtleMotion}
    />
  ),
  play: async ({ canvasElement, args }: any) => {
    if (!args.subtleMotion) return;

    const assertNoTransformMotion = (label: string) => {
      const allElements = canvasElement.querySelectorAll('*');
      allElements.forEach((el: Element) => {
        const styles = getComputedStyle(el);

        const animName = styles.animationName;
        if (animName && animName !== 'none' && animName !== 'buttonSpin') {
          expect(
            animName,
            `[${label}] Active CSS animation "${animName}" — must be disabled in subtle motion`
          ).toBe('none');
        }

        const transitionProp = styles.transitionProperty;
        if (transitionProp && transitionProp !== 'none') {
          const hasTransform = transitionProp
            .split(',')
            .some((p) => p.trim() === 'transform' || p.trim() === 'all');
          expect(
            hasTransform,
            `[${label}] Transitions "${transitionProp}" — transform must be disabled in subtle motion`
          ).toBe(false);
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
