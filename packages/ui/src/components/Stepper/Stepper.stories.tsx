/**
 * Stepper.stories.tsx
 * Storybook documentation for Stepper component
 *
 * Mirrors the Switch/Button docs pattern:
 * - Same section structure
 * - Surface context uses <Surface> component for proper CSS cascade remapping
 * - Brand CSS tokens provided by BrandStyleDecorator (select a brand in toolbar)
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect, userEvent } from 'storybook/test';
import { Stepper } from './Stepper';
import { Surface } from '../Surface';
import { IconButton } from '../IconButton';
import React from 'react';
import {
  StepperSizes,
  StepperAttentionLevels,
  StepperStates,
  StepperInteractiveStates,
  StepperCondensed,
} from './Stepper.showcase';

/** Shared label style using brand foundation typography tokens */
const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary, inherit)',
  fontSize: 'var(--Body-S-FontSize, var(--Typography-Size-XS))',
  lineHeight: 'var(--Body-S-LineHeight)',
  fontWeight: 'var(--Body-FontWeight-Medium, var(--Typography-Weight-Medium))',
  color: 'var(--Text-Low)',
};

const rowLabelStyle: React.CSSProperties = {
  ...labelStyle,
  minWidth: 'var(--Spacing-9)',
  margin: 0,
};

/** Default 9 appearance roles */
const DEFAULT_APPEARANCE_ROLES = [
  'primary', 'neutral', 'secondary', 
  'positive', 'negative', 'warning', 'informative',
] as const;

const meta = {
  title: 'Components/Inputs/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Stepper allows users to increase or decrease a numeric value in small increments. Supports 3 attention levels (high/medium/low), 3 sizes (S/M/L), multi-accent appearance roles, condensed mode, and surface-context awareness. Omit `appearance` or use `auto` to inherit the nearest `<Surface>` role (see `useSurfaceAppearance`), else `secondary` at the page root.',
      },
    },
  },
  argTypes: {
    size: {
      control: 'radio',
      options: ['s', 'm', 'l'],
      description: 'Size preset',
      table: { defaultValue: { summary: 'm' } },
    },
    attention: {
      control: 'radio',
      options: ['high', 'medium', 'low'],
      description: 'Attention level — controls visual weight',
      table: { defaultValue: { summary: 'medium' } },
    },
    appearance: {
      control: 'select',
      options: [
        'auto', 'primary', 'secondary', 
        'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative',
      ],
      description:
        'Appearance role — controls all tokens. auto or omit: inherit nearest Surface, else secondary.',
      table: { defaultValue: { summary: 'secondary' } },
    },
    accent: {
      control: 'radio',
      options: ['primary', 'secondary', 'sparkle'],
      description: 'Accent role — controls fill color at high attention',
      table: { defaultValue: { summary: 'primary' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the stepper is disabled',
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the stepper is read-only',
    },
    condensed: {
      control: 'boolean',
      description: 'Whether to use condensed height',
    },
    direction: {
      control: 'radio',
      options: ['ltr', 'rtl'],
      description: 'Visual direction — ltr keeps decrement left / increment right; rtl mirrors the order',
      table: { defaultValue: { summary: 'ltr' } },
    },
    value: {
      control: 'number',
      description: 'Controlled value',
    },
    min: {
      control: 'number',
      description: 'Minimum allowed value',
    },
    max: {
      control: 'number',
      description: 'Maximum allowed value',
    },
    step: {
      control: 'number',
      description: 'Step increment',
      table: { defaultValue: { summary: '1' } },
    },
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof Stepper>;

/* ========================================
   1. DEFAULT
   ======================================== */

export const Default: Story = {
  args: {
    defaultValue: 5,
    size: 'm',
  },
};

/* ========================================
   2. SIZES
   ======================================== */

export const Sizes: Story = {
  name: 'Sizes',
  render: () => <StepperSizes />,
};

/* ========================================
   3. ATTENTION LEVELS
   ======================================== */

export const AttentionLevels: Story = {
  name: 'Attention Levels',
  render: () => <StepperAttentionLevels />,
};

/* ========================================
   4. STATES
   ======================================== */

export const States: Story = {
  name: 'States',
  render: () => <StepperStates />,
};

/* ========================================
   4b. INTERACTIVE STATES — idle / focus
   Focus halo uses Informative-Bold at Focus-Outline-Width with a
   Stroke-XL gap, matching the Slider focus spec.
   ======================================== */

export const InteractiveStates: Story = {
  name: 'Interactive States',
  parameters: {
    docs: {
      description: {
        story:
          'Visual preview of idle and focus. The focus row uses `data-force-state="focus"` on the group slot to render the halo without real keyboard focus — matching the Slider showcase pattern. Focus ring is always `--Informative-Bold` at `--Focus-Outline-Width`, with a `--Stroke-XL` inner gap that adapts to the surface context.',
      },
    },
  },
  render: () => <StepperInteractiveStates />,
};

/* ========================================
   5. APPEARANCES
   ======================================== */

export const Appearances: Story = {
  name: 'Appearances',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      {DEFAULT_APPEARANCE_ROLES.map((role) => (
        <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)' }}>
          <span style={{ ...rowLabelStyle, textTransform: 'capitalize' }}>{role}</span>
          {(['high', 'medium', 'low'] as const).map((attention) => (
            <Stepper key={attention} appearance={role} attention={attention} defaultValue={5} />
          ))}
        </div>
      ))}
    </div>
  ),
};

/* ========================================
   6. ACCENTS
   ======================================== */

export const Accents: Story = {
  name: 'Accents',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      {(['primary', 'secondary', 'sparkle'] as const).map((accent) => (
        <div key={accent} style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)' }}>
          <span style={{ ...rowLabelStyle, textTransform: 'capitalize' }}>{accent}</span>
          <Stepper appearance="neutral" accent={accent} attention="high" defaultValue={5} />
          <Stepper appearance="neutral" accent={accent} attention="medium" defaultValue={5} />
          <Stepper appearance="neutral" accent={accent} attention="low" defaultValue={5} />
        </div>
      ))}
    </div>
  ),
};

/* ========================================
   7. CONDENSED
   ======================================== */

export const Condensed: Story = {
  name: 'Condensed',
  render: () => <StepperCondensed />,
};

/* ========================================
   7b. START / END SLOTS (custom buttons)
   ======================================== */

export const StartEndSlots: Story = {
  name: 'Start / end slots',
  parameters: {
    docs: {
      description: {
        story:
          'Figma “code only” `start` / `end`: pass one `<IconButton />` element each. Base UI merges NumberField handlers and ref onto that element (`render` on `Decrement` / `Increment`). **Layout:** `direction="ltr"` keeps decrement left / increment right; `direction="rtl"` mirrors the visual order while semantics stay fixed.',
      },
    },
  },
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-4)',
        alignItems: 'flex-start',
        maxWidth: 'var(--Spacing-40)',
      }}
    >
      <p style={{ ...labelStyle, margin: 0 }}>
        Custom <code style={{ fontFamily: 'var(--Typography-Font-Code)' }}>IconButton</code> elements
        replace the default icons; props and ref are merged by Base UI.
      </p>
      <Stepper
        appearance="secondary"
        defaultValue={3}
        start={
          <IconButton
            icon="remove"
            attention="low"
            appearance="secondary"
            aria-label="Decrease value"
          />
        }
        end={
          <IconButton
            icon="add"
            attention="low"
            appearance="secondary"
            aria-label="Increase value"
          />
        }
      />
    </div>
  ),
};

/* ========================================
   7c. DIRECTION
   ======================================== */

export const Direction: Story = {
  name: 'Direction',
  parameters: {
    docs: {
      description: {
        story:
          '`direction` controls only visual order. In `ltr`, decrement is left and increment is right. In `rtl`, the controls are mirrored while the same buttons still decrease/increase.',
      },
    },
  },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)', alignItems: 'flex-start' }}>
      {(['ltr', 'rtl'] as const).map((direction) => (
        <div key={direction} style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)' }}>
          <span style={{ ...rowLabelStyle, textTransform: 'uppercase' }}>{direction}</span>
          <Stepper appearance="secondary" defaultValue={5} direction={direction} />
        </div>
      ))}
    </div>
  ),
};

/* ========================================
   7d. START / END — IconButton variants
   ======================================== */

const slotSectionStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-3)',
  alignItems: 'flex-start',
};

const slotCaptionStyle: React.CSSProperties = {
  ...labelStyle,
  margin: 0,
};

export const StartEndSlotVariations: Story = {
  name: 'Start / end slot variations',
  parameters: {
    docs: {
      description: {
        story:
          'Same fixed semantics: `start` always decreases and `end` always increases. Use `direction="rtl"` to mirror the visual order without changing those behaviours.',
      },
    },
  },
  render: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-5)',
        alignItems: 'flex-start',
      }}
    >
      <div style={slotSectionStyle}>
        <p style={slotCaptionStyle}>
          <strong>Chevron</strong> — contained subtle <code style={{ fontFamily: 'var(--Typography-Font-Code)' }}>IconButton</code>, navigation-style icons.
        </p>
        <Stepper
          appearance="secondary"
          defaultValue={2}
          start={
            <IconButton
              icon="chevronLeft"
              attention="low"
              appearance="secondary"
              aria-label="Decrease value"
            />
          }
          end={
            <IconButton
              icon="chevronRight"
              attention="low"
              appearance="secondary"
              aria-label="Increase value"
            />
          }
        />
      </div>

      <div style={slotSectionStyle}>
        <p style={slotCaptionStyle}>
          <strong>Bold</strong> — contained <code style={{ fontFamily: 'var(--Typography-Font-Code)' }}>IconButton</code>{' '}
          controls (discrete fills on the track); decrease / increase behaviour unchanged.
        </p>
        <Stepper
          attention="high"
          appearance="secondary"
          defaultValue={4}
          start={
            <IconButton
              icon="heart"
              attention="high"
              appearance="secondary"
              aria-label="Decrease value"
            />
          }
          end={
            <IconButton
              icon="star"
              attention="high"
              appearance="secondary"
              aria-label="Increase value"
            />
          }
        />
      </div>

      <div style={slotSectionStyle}>
        <p style={slotCaptionStyle}>
          <strong>Low + icon only</strong> — compact contained ghost <code style={{ fontFamily: 'var(--Typography-Font-Code)' }}>IconButton</code> (size S, matches Stepper <code style={{ fontFamily: 'var(--Typography-Font-Code)' }}>size=&quot;s&quot;</code>).
        </p>
        <Stepper
          size="s"
          attention="low"
          appearance="neutral"
          defaultValue={6}
          start={
            <IconButton
              icon="arrowDown"
              attention="low"
              appearance="neutral"
              size={8}
              aria-label="Decrease value"
            />
          }
          end={
            <IconButton
              icon="arrowUp"
              attention="low"
              appearance="neutral"
              size={8}
              aria-label="Increase value"
            />
          }
        />
      </div>
    </div>
  ),
};

/* ========================================
   8. SURFACE CONTEXT
   ======================================== */

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

    /** `secondary` matches Stepper’s page-root default — Steppers omit `appearance` so they inherit this strip’s role via `useSurfaceAppearance` (same pattern as Badge). */
    const surfaceStripAppearance = 'secondary' as const;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
        {surfaceModes.map(({ mode, label, desc }) => (
          <div key={mode} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
            <span style={labelStyle}>{label} — {desc}</span>
            <Surface mode={mode} appearance={surfaceStripAppearance} style={contentStyle}>
              <Stepper attention="high" defaultValue={5} />
              <Stepper attention="medium" defaultValue={5} />
              <Stepper attention="low" defaultValue={5} />
            </Surface>
          </div>
        ))}
      </div>
    );
  },
};


/* ========================================
   10. WITH MIN/MAX
   ======================================== */

export const WithMinMax: Story = {
  name: 'Min/Max Bounds',
  args: {
    defaultValue: 5,
    min: 0,
    max: 10,
    step: 1,
  },
};

/* ========================================
   11. INTERACTIVE (play function)
   ======================================== */

export const Interactive: Story = {
  name: 'Interactive',
  args: {
    defaultValue: 5,
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox');
    const incrementButton = canvas.getByLabelText('Increase value');
    const decrementButton = canvas.getByLabelText('Decrease value');

    // Initial value
    await expect(input).toHaveValue('5');

    // Click increment
    await userEvent.click(incrementButton);
    await expect(input).toHaveValue('6');

    // Click decrement
    await userEvent.click(decrementButton);
    await expect(input).toHaveValue('5');
  },
};

/* ========================================
   12. READ ONLY
   ======================================== */

export const ReadOnly: Story = {
  name: 'Read Only',
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-5)', alignItems: 'center' }}>
      {(['high', 'medium', 'low'] as const).map((attention) => (
        <div key={attention} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
          <Stepper attention={attention} defaultValue={5} readOnly />
          <span style={labelStyle}>{attention.charAt(0).toUpperCase() + attention.slice(1)}</span>
        </div>
      ))}
    </div>
  ),
};

/* ========================================
   13. FORMATTED
   ======================================== */

export const Formatted: Story = {
  name: 'Formatted',
  args: {
    defaultValue: 1200,
    step: 100,
  },
};

