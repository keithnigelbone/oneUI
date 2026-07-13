/**
 * Radio.stories.tsx
 * Storybook documentation for Radio component
 *
 * Layout: left-aligned columns with consistent widths.
 * Brand CSS tokens provided by BrandStyleDecorator (select a brand in toolbar).
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect, userEvent } from 'storybook/test';
import { Radio } from './Radio';
import { RadioGroup } from './Radio';
import type { RadioProps } from './Radio.shared';
import { Surface } from '../Surface';
import React from 'react';
import {
  RadioSizes,
  RadioStates,
  RadioFocusState,
  RadioAccents,
  RadioAccentOverride,
  RadioReadOnly,
  RadioWithLabel,
  RadioSurfaceContext,
} from './Radio.showcase';

/** Column layout: label + unchecked + checked, centered in canvas */
const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '100px 80px 80px',
  gap: 'var(--Spacing-3-5) var(--Spacing-3)',
  alignItems: 'center',
  justifyItems: 'center',
};

/** Row label — small, low emphasis, left-aligned */
const cellLabel: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary, inherit)',
  fontSize: 'var(--Label-S-FontSize, var(--Typography-Size-XS))',
  lineHeight: 'var(--Label-S-LineHeight)',
  fontWeight: 'var(--Typography-Weight-Regular, 400)',
  color: 'var(--Text-Low)',
  textTransform: 'capitalize',
  justifySelf: 'start',
};

/** Column header */
const headerCell: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary, inherit)',
  fontSize: 'var(--Label-S-FontSize, var(--Typography-Size-XS))',
  lineHeight: 'var(--Label-S-LineHeight)',
  fontWeight: 'var(--Typography-Weight-Regular, 400)',
  color: 'var(--Text-Medium)',
  justifySelf: 'start',
};

/** Descriptive label used outside grids */
const descLabel: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary, inherit)',
  fontSize: 'var(--Label-S-FontSize, var(--Typography-Size-XS))',
  lineHeight: 'var(--Label-S-LineHeight)',
  fontWeight: 'var(--Typography-Weight-Regular, 400)',
  color: 'var(--Text-Low)',
};

/** Default 9 appearance roles */
const DEFAULT_APPEARANCE_ROLES = [
  'primary', 'neutral', 'secondary', 
  'positive', 'negative', 'warning', 'informative',
] as const;

const meta = {
  title: 'Components/Inputs/Radio',
  component: Radio,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    controls: {
      exclude: [
        'accent',
        'children',
        'labelAssociation',
        'supplementaryDescribedById',
        'errorHighlight',
        'labelWrapper',
        'required',
      ],
    },
    docs: {
      description: {
        component:
          '`appearance` drives border, hover, and checked-state fill tokens (`auto` resolves to the secondary stack). Selection is owned by **`RadioGroup`** via `value` / `defaultValue`; the **`checked`** control below only remounts the demo group for documentation. Three sizes (S/M/L), readonly state, surface-context awareness. Always circular (`Shape-Pill`).',
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
    appearance: {
      control: 'select',
      options: [
        'auto', 'primary', 'secondary', 
        'neutral', 'sparkle', 'brand-bg', 'positive', 'negative', 'warning', 'informative',
      ],
      description: 'Appearance role — border, hover, and fill (including checked dot).',
      table: { defaultValue: { summary: 'neutral' } },
    },
    checked: {
      control: 'boolean',
      description:
        'Demo only: when true, the group’s initial value matches this item’s `value` (radio shows checked). Real apps control this with `RadioGroup` `value` / `defaultValue`.',
      table: { defaultValue: { summary: 'true' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the radio is disabled',
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the radio is read-only',
    },
    label: {
      control: 'text',
      description: 'Visible label beside the control',
    },
    description: {
      control: 'text',
      description: 'Supplementary copy below the label row',
    },
    children: {
      table: { disable: true },
      control: false,
    },
  },
} satisfies Meta<typeof Radio>;

export default meta;
type Story = StoryObj<typeof Radio>;

// ============================================================================
// 1. Default — Interactive with all controls
// ============================================================================
export const Default: Story = {
  args: {
    label: 'Option A',
    value: 'a',
    size: 'm',
    appearance: 'neutral',
    checked: true,
  },
  render: (args: RadioProps) => {
    const {
      checked,
      labelAssociation: _la,
      supplementaryDescribedById: _sb,
      errorHighlight: _eh,
      labelWrapper: _lw,
      required: _rq,
      accent: _ac,
      value,
      appearance: groupAppearance,
      size: groupSize,
      disabled: groupDisabled,
      readOnly: groupReadOnly,
      ...radioForward
    } = args;
    const resolvedValue = typeof value === 'string' ? value : 'a';
    const selected = (checked ?? true) ? resolvedValue : '';
    // Bug fix (alpha.3): forward `appearance` / `size` / `disabled` / `readOnly`
    // onto the RadioGroup so they cascade to every option (B/C) — previously
    // only Option A picked up the storybook control, producing visually
    // inconsistent active states across siblings.
    return (
      <RadioGroup
        key={selected === resolvedValue ? 'on' : 'off'}
        defaultValue={selected}
        aria-label="Default example"
        appearance={groupAppearance}
        size={groupSize}
        disabled={groupDisabled}
        readOnly={groupReadOnly}
      >
        <Radio {...radioForward} value={resolvedValue} />
        <Radio value="b" label="Option B" />
        <Radio value="c" label="Option C" />
      </RadioGroup>
    );
  },
};

// ============================================================================
// 2. Sizes — S/M/L in aligned columns
// ============================================================================
export const Sizes: Story = {
  render: () => <RadioSizes />,
};

// ============================================================================
// 3. States — aligned columns
// ============================================================================
export const States: Story = {
  render: () => <RadioStates />,
};

// ============================================================================
// 3b. Focus State — force-renders the Informative focus ring via data-force-state
// ============================================================================
export const FocusState: Story = {
  name: 'Focus State',
  render: () => <RadioFocusState />,
};

// ============================================================================
// 4. Appearances — All 9 roles, aligned columns
// ============================================================================
export const Appearances: Story = {
  render: () => (
    <div style={gridStyle}>
      {/* Header row */}
      <span />
      <span style={headerCell}>Unchecked</span>
      <span style={headerCell}>Checked</span>

      {DEFAULT_APPEARANCE_ROLES.map((role) => (
        <React.Fragment key={role}>
          <span style={cellLabel}>{role}</span>
          <RadioGroup value="" aria-label={`${role} unchecked`}>
            <Radio value="x" appearance={role} />
          </RadioGroup>
          <RadioGroup value="x" aria-label={`${role} checked`}>
            <Radio value="x" appearance={role} />
          </RadioGroup>
        </React.Fragment>
      ))}
    </div>
  ),
};

// ============================================================================
// 5. Appearance (primary / secondary / sparkle fill) — aligned columns
// ============================================================================
export const Accents: Story = {
  name: 'Appearance (fill roles)',
  render: () => <RadioAccents />,
};

// ============================================================================
// 6. Surface Context — standard backgrounds + tinted surfaces
// ============================================================================
export const SurfaceContext: Story = {
  name: 'Surface Context',
  render: () => <RadioSurfaceContext />,
};

// ============================================================================
// 7. Themes — BG surface modes
// ============================================================================
export const Themes: Story = {
  render: () => {
    const cellStyle: React.CSSProperties = {
      display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4)',
      padding: 'var(--Spacing-4-5)', borderRadius: 'var(--Shape-4)', flex: 1,
    };
    const secondaryFills: Record<string, string> = {
      '--Surface-Fill-Minimal': 'var(--Secondary-Fill-Minimal)',
      '--Surface-Fill-Subtle': 'var(--Secondary-Fill-Subtle)',
      '--Surface-Fill-Bold': 'var(--Secondary-Fill-Bold)',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)', maxWidth: 'var(--Spacing-40)' }}>
        {[
          { mode: 'default' as const, label: 'default' },
          { mode: 'minimal' as const, label: 'minimal' },
          { mode: 'subtle' as const, label: 'subtle' },
          { mode: 'bold' as const, label: 'bold' },
          { mode: 'elevated' as const, label: 'elevated' },
        ].map(({ mode, label }) => (
          <div key={mode} style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4)' }}>
            <span style={{ ...descLabel, minWidth: 80, flexShrink: 0 }}>{label}</span>
            <Surface mode={mode} style={{ ...cellStyle, ...secondaryFills as React.CSSProperties }}>
              <RadioGroup defaultValue="a" orientation="horizontal" aria-label={`${label} surface`}>
                <Radio value="a" appearance="secondary" label="Checked" />
                <Radio value="b" appearance="secondary" label="Unchecked" />
              </RadioGroup>
            </Surface>
          </div>
        ))}
      </div>
    );
  },
};

// ============================================================================
// 8. WithLabel — Short labels, body font, max 3 lines
// ============================================================================
export const WithLabel: Story = {
  name: 'With Label',
  render: () => <RadioWithLabel />,
};

// ============================================================================
// 9. Interactive — Play function: click selects, verify aria-checked
// ============================================================================
export const Interactive: Story = {
  render: () => (
    <RadioGroup defaultValue="" aria-label="Interactive test">
      <Radio value="first" label="First option" />
      <Radio value="second" label="Second option" />
    </RadioGroup>
  ),
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole('radio');
    await expect(radios).toHaveLength(2);
    await expect(radios[0]).not.toBeChecked();
    await expect(radios[1]).not.toBeChecked();

    await userEvent.click(radios[0]);
    await expect(radios[0]).toBeChecked();
    await expect(radios[1]).not.toBeChecked();

    await userEvent.click(radios[1]);
    await expect(radios[0]).not.toBeChecked();
    await expect(radios[1]).toBeChecked();
  },
};

// ============================================================================
// 10. Motion — Tap scale + knob burst/fade demo, with subtle-motion toggle
// ============================================================================

/** Subtle-motion override (Accessibility / reduced-motion). Mirrors the Button story
 *  pattern: a wrapper class neutralises every transform-based animation AND remaps the
 *  duration / offset / easing tokens to their Subtle equivalents — same remap the token
 *  system does at :root inside @media (prefers-reduced-motion: reduce). BaseUI's
 *  Radio.Root renders a <span> with role="radio", and the indicator is its only span child. */
const radioMotionSubtleCSS = `
  .radio-motion-subtle {
    /* Only the tokens Radio actually uses — S / M / L durations, L offset, Transition easing.
       L collapses to M Subtle (no L durations or offsets in Subtle mode). */
    --Motion-Duration-S: var(--Motion-Duration-Subtle-S);
    --Motion-Duration-M: var(--Motion-Duration-Subtle-M);
    --Motion-Duration-L: var(--Motion-Duration-Subtle-M);
    --Motion-Offset-L: var(--Motion-Offset-Subtle-M);
    --Motion-Easing-Transition-Moderate: var(--Motion-Easing-Transition-Subtle);
  }
  /* Disable the press scale on the radio root. */
  .radio-motion-subtle [role="radio"]:active {
    transform: none !important;
  }
  /* Lock the indicator at dot-size, drop the L-offset delay, and run opacity at M duration so
     knob and surface stay in sync (both M Subtle = 135ms, no delay) in either direction. */
  .radio-motion-subtle [role="radio"] > span {
    transform: scale(1) !important;
    transition: opacity var(--Motion-Duration-M) var(--Motion-Easing-Transition-Moderate) !important;
  }
`;

export const Motion: Story = {
  name: 'Motion',
  parameters: {
    docs: {
      description: {
        story:
          'Tap-down scales the radio 100% → 107% over M; tap-up settles back to 100% over L. Surface colour transitions across hover and pressed. Knob entry (unchecked → checked) bursts from box-size to dot-size over L and fades in over S. Knob exit (checked → unchecked) is the same in reverse with an L-offset delay on the fade-out. Toggle "Subtle motion" to preview the reduced-motion behaviour (colours and opacity only, no scale).',
      },
    },
  },
  args: {
    subtleMotion: false,
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
    <>
      <style>{radioMotionSubtleCSS}</style>
      <div
        className={args.subtleMotion ? 'radio-motion-subtle' : undefined}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)', alignItems: 'flex-start' }}
      >
        <span style={descLabel}>Click and hold any radio to see the scale-up tap animation. Toggle the Subtle motion control to compare.</span>
        <RadioGroup defaultValue="a" orientation="horizontal" aria-label="Motion demo">
          <Radio value="a" size="l" appearance="primary" label="Primary" />
          <Radio value="b" size="l" appearance="secondary" label="Secondary" />
          <Radio value="c" size="l" appearance="sparkle" label="Sparkle" />
        </RadioGroup>
        <RadioGroup defaultValue="" orientation="horizontal" aria-label="Motion demo unchecked">
          <Radio value="a" size="l" appearance="primary" label="Primary" />
          <Radio value="b" size="l" appearance="secondary" label="Secondary" />
          <Radio value="c" size="l" appearance="sparkle" label="Sparkle" />
        </RadioGroup>
      </div>
    </>
  ),
};

// ============================================================================
// 11. Responsive — Viewport testing
// ============================================================================
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
      {(['s', 'm', 'l'] as const).map((size) => (
        <RadioGroup key={size} defaultValue="on" aria-label={`Responsive ${size}`}>
          <Radio value="off" size={size} label={`Unchecked ${size.toUpperCase()}`} />
          <Radio value="on" size={size} label={`Checked ${size.toUpperCase()}`} />
        </RadioGroup>
      ))}
    </div>
  ),
};

// ============================================================================
// 11. ReadOnly — All sizes, aligned columns
// ============================================================================
export const ReadOnly: Story = {
  name: 'Read Only',
  render: () => <RadioReadOnly />,
};
