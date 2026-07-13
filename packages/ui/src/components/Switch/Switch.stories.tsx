/**
 * Switch.stories.tsx
 * Storybook documentation for Switch component
 *
 * Mirrors the Checkbox/Button docs pattern:
 * - Same section structure
 * - Surface context uses <Surface> component for proper CSS cascade remapping
 * - Brand CSS tokens provided by BrandStyleDecorator (select a brand in toolbar)
 */

import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { within, expect, userEvent } from 'storybook/test';
import { Switch } from './Switch';
import type { SwitchAccent, SwitchProps } from './Switch.shared';
import { Surface } from '../Surface';
import React from 'react';
import {
  SwitchSizes,
  SwitchStates,
  SwitchFocusState,
  SwitchAccents,
  SwitchReadOnly,
  SwitchWithLabel,
  SwitchSurfaceContext,
} from './Switch.showcase';

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

const appearanceTableStyle: React.CSSProperties = {
  borderCollapse: 'separate',
  borderSpacing: 'var(--Spacing-5) var(--Spacing-3-5)',
};

const appearanceCellStyle: React.CSSProperties = {
  textAlign: 'center',
};

const appearanceSurfaceStyle: React.CSSProperties = {
  padding: 'var(--Spacing-5)',
  borderRadius: 'var(--Shape-4)',
};

function AppearanceMatrix() {
  return (
    <table style={appearanceTableStyle}>
      <thead>
        <tr>
          <th style={rowLabelStyle}>Appearance prop</th>
          <th style={{ ...rowLabelStyle, textAlign: 'center' }}>Unchecked</th>
          <th style={{ ...rowLabelStyle, textAlign: 'center' }}>Checked</th>
          <th style={{ ...rowLabelStyle, textAlign: 'center' }}>ReadOnly unchecked</th>
          <th style={{ ...rowLabelStyle, textAlign: 'center' }}>ReadOnly checked</th>
        </tr>
      </thead>
      <tbody>
        {DEFAULT_APPEARANCE_ROLES.map((role) => (
          <tr key={role}>
            <td style={{ ...rowLabelStyle, color: 'var(--Text-High)' }}>{role}</td>
            <td style={appearanceCellStyle}><Switch appearance={role} /></td>
            <td style={appearanceCellStyle}><Switch appearance={role} checked /></td>
            <td style={appearanceCellStyle}><Switch appearance={role} readOnly /></td>
            <td style={appearanceCellStyle}><Switch appearance={role} readOnly checked /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/** Docs-only `accent` sentinel: Storybook radios default to the first option, which made `accent="primary"` stick and overrode checked fill while `appearance` still drove the unchecked rail. */
type SwitchStoryArgs = Omit<SwitchProps, 'accent'> & {
  accent?: SwitchAccent | 'inherit';
  subtleMotion?: boolean;
};

function argsToSwitchProps(args: SwitchStoryArgs): SwitchProps {
  const { accent, subtleMotion: _subtleMotion, ...rest } = args;
  return {
    ...rest,
    accent: accent === 'inherit' ? undefined : accent,
  };
}

const meta = {
  title: 'Components/Inputs/Switch',
  // Storybook args widen `accent` with `inherit`; `argsToSwitchProps` maps to real `Switch` props.
  // @ts-expect-error — `Switch` props omit Storybook-only `accent: 'inherit'`.
  component: Switch,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Switch with state-specific appearance resolution: interactive checked follows the Switch appearance, interactive unchecked follows the nearest Surface appearance or neutral, and readonly is neutral. Supports 3 sizes (S/M/L), multi-accent roles, readonly state, and surface-context awareness.',
      },
    },
  },
  decorators: [
    ((Story) => (
      <Surface
        mode="default"
        appearance="neutral"
        style={{
          padding: 'var(--Spacing-6)',
          borderRadius: 'var(--Shape-4)',
        }}
      >
        <Story />
      </Surface>
    )) as Decorator,
  ],
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
      description: 'Appearance role for interactive checked fill. Interactive unchecked ignores this prop and follows parent Surface appearance or neutral. Readonly is neutral.',
      table: { defaultValue: { summary: 'secondary' } },
    },
    accent: {
      control: 'select',
      options: ['inherit', 'primary', 'secondary', 'sparkle'],
      description:
        'Checked fill override. **inherit** = on state follows `appearance` (default). Other values pin the track to that accent even when `appearance` changes.',
      table: { defaultValue: { summary: 'inherit' } },
    },
    checked: {
      control: 'boolean',
      description: 'Whether the switch is on (controlled)',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the switch is disabled',
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the switch is read-only',
    },
    children: {
      control: 'text',
      description: 'Label text',
    },
  },
} satisfies Meta<SwitchStoryArgs>;

export default meta;
type Story = StoryObj<SwitchStoryArgs>;

// ============================================================================
// 1. Default — Interactive with all controls
// ============================================================================
export const Default: Story = {
  args: {
    children: 'Enable notifications',
    size: 'm',
    accent: 'inherit',
  },
  /** Explicit render so Autodocs / Controls always forward args to the component. */
  render: (args) => <Switch {...argsToSwitchProps(args)} />,
};

// ============================================================================
// 2. Sizes — S/M/L × (unchecked, checked) matrix
// ============================================================================
export const Sizes: Story = {
  render: () => <SwitchSizes />,
};

// ============================================================================
// 3. States — Default, Checked, ReadOnly, Disabled
// ============================================================================
export const States: Story = {
  render: () => <SwitchStates />,
};

// ============================================================================
// 3b. Focus State — force-renders the Informative focus ring via data-force-state
// ============================================================================
export const FocusState: Story = {
  name: 'Focus State',
  render: () => <SwitchFocusState />,
};

// ============================================================================
// 3c. Motion — manual interaction (no autoplay toggle)
// ============================================================================
export const Motion: Story = {
  name: 'Motion',
  args: {
    children: 'Motion',
    accent: 'inherit',
    subtleMotion: false,
  },
  argTypes: {
    subtleMotion: {
      control: 'boolean',
      description:
        'Subtle motion — state changes are instant and touch-down has no scale feedback. Sets `--Switch-motionDuration: 0s` (no transitions) and `--Switch-thumbPressScale: 1` (no press deformation).',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  parameters: {
    docs: {
      source: {
        code: `<Switch>Motion</Switch>

/* Switch.module.css (internal motion implementation) */
.switch {
  --_sw-duration: var(--Switch-motionDuration, var(--Motion-Duration-L));
  --_sw-easing:   var(--Switch-motionEasing,   var(--Motion-Easing-Transition-Moderate));
  transition: background-color var(--_sw-duration) var(--_sw-easing);
}

.thumb {
  transform: translateX(var(--_sw-thumb-translate-x));
  transition:
    transform         var(--_sw-duration) var(--_sw-easing),
    background-color  var(--_sw-duration) var(--_sw-easing);
}

.thumb::before {
  scale: var(--_sw-thumb-scale);
  transition:
    scale             var(--_sw-duration) var(--_sw-easing),
    background-color  var(--_sw-duration) var(--_sw-easing);
}

/* Subtle motion — instant state change, no position or scale movement */
<Switch style={{
  '--Switch-motionDuration': '0s',
  '--Switch-thumbPressScale': '1',
}}>Subtle</Switch>`,
      },
    },
  },
  render: (args) => {
    const subtleStyle: React.CSSProperties = args.subtleMotion
      ? ({
          '--Switch-motionDuration': '0s',
          '--Switch-thumbPressScale': '1',
        } as React.CSSProperties)
      : {};
    return <Switch {...argsToSwitchProps(args)} style={subtleStyle} />;
  },
};

// ============================================================================
// 4. Appearances — role × interactive/readOnly unchecked/checked
// ============================================================================
export const Appearances: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)' }}>
      <AppearanceMatrix />
      <Surface mode="subtle" appearance="primary" style={appearanceSurfaceStyle}>
        <AppearanceMatrix />
      </Surface>
      <Surface mode="bold" appearance="primary" style={appearanceSurfaceStyle}>
        <AppearanceMatrix />
      </Surface>
      <Surface mode="subtle" appearance="secondary" style={appearanceSurfaceStyle}>
        <AppearanceMatrix />
      </Surface>
      <Surface mode="bold" appearance="secondary" style={appearanceSurfaceStyle}>
        <AppearanceMatrix />
      </Surface>
    </div>
  ),
};

// ============================================================================
// 5. Accents — each accent fill color (unchecked, checked)
// ============================================================================
export const Accents: Story = {
  render: () => <SwitchAccents />,
};

// ============================================================================
// 6. Surface Context — standard backgrounds + accent surfaces
// ============================================================================
export const SurfaceContext: Story = {
  name: 'Surface Context',
  render: () => <SwitchSurfaceContext />,
};

// ============================================================================
// 7. Themes — BG surface modes × checked/unchecked
// ============================================================================
export const Themes: Story = {
  render: () => {
    const surfaceModes = [
      { mode: 'default' as const, label: 'default' },
      { mode: 'minimal' as const, label: 'minimal' },
      { mode: 'subtle' as const, label: 'subtle' },
      { mode: 'bold' as const, label: 'bold' },
      { mode: 'elevated' as const, label: 'elevated' },
    ];

    const cellStyle: React.CSSProperties = {
      display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--Spacing-3-5)',
      padding: 'var(--Spacing-4-5)', borderRadius: 'var(--Shape-4)',
    };
    const secondaryFills: Record<string, string> = {
      '--Surface-Fill-Minimal': 'var(--Secondary-Fill-Minimal)',
      '--Surface-Fill-Subtle': 'var(--Secondary-Fill-Subtle)',
      '--Surface-Fill-Bold': 'var(--Secondary-Fill-Bold)',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
        {surfaceModes.map(({ mode, label }) => (
          <div key={mode} style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4)' }}>
            <span style={{ ...rowLabelStyle, width: 80 }}>{label}</span>
            <Surface
              mode={mode}
              appearance="neutral"
              style={{ ...cellStyle, ...secondaryFills as React.CSSProperties }}
            >
              <Switch appearance="secondary" />
              <Switch appearance="secondary" checked />
              <Switch appearance="secondary">Label</Switch>
              <Switch appearance="secondary" checked>Label</Switch>
            </Surface>
          </div>
        ))}
      </div>
    );
  },
};

// ============================================================================
// 8. WithLabel — Different label lengths
// ============================================================================
export const WithLabel: Story = {
  name: 'With Label',
  render: () => <SwitchWithLabel />,
};

// ============================================================================
// 9. Interactive — Play function: click toggles state, verify aria-checked
// ============================================================================
export const Interactive: Story = {
  args: {
    children: 'Toggle me',
    size: 'm',
    accent: 'inherit',
  },
  render: (args) => <Switch {...argsToSwitchProps(args)} />,
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const switchEl = canvas.getByRole('switch');
    await expect(switchEl).toBeInTheDocument();
    await expect(switchEl).not.toBeChecked();

    await userEvent.click(switchEl);
    await expect(switchEl).toBeChecked();

    await userEvent.click(switchEl);
    await expect(switchEl).not.toBeChecked();
  },
};

// ============================================================================
// 10. Responsive — Viewport testing
// ============================================================================
export const Responsive: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
      {(['s', 'm', 'l'] as const).map((size) => (
        <div key={size} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3-5)' }}>
          <Switch size={size}>Unchecked {size}</Switch>
          <Switch size={size} checked>Checked {size}</Switch>
        </div>
      ))}
    </div>
  ),
};


// ============================================================================
// 12. ReadOnly — each appearance × unchecked / checked (read-only)
// ============================================================================
export const ReadOnly: Story = {
  name: 'Read Only',
  render: () => <SwitchReadOnly />,
};
