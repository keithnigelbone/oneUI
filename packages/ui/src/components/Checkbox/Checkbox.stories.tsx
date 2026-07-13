/**
 * Checkbox.stories.tsx
 * Storybook documentation for Checkbox component
 *
 * Mirrors the platform docs page pattern:
 * - Same section structure as Avatar/Button stories
 * - Surface context uses <Surface> component for proper CSS cascade remapping
 * - Brand CSS tokens provided by BrandStyleDecorator (select a brand in toolbar)
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect, userEvent } from 'storybook/test';
import { Checkbox } from './Checkbox';
import { Surface } from '../Surface';
import { computeResponsiveDensityOverrides } from '@oneui/shared';
import type { BreakpointId, DensityId } from '@oneui/shared';
import React from 'react';
import {
  CheckboxSizes,
  CheckboxStates,
  CheckboxFocusState,
  CheckboxAccents,
  CheckboxAccentOverride,
  CheckboxReadOnly,
  CheckboxWithLabel,
  CheckboxSurfaceContext,
} from './Checkbox.showcase';

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

/** Default 9 appearance roles (excluding sparkle/brand-bg which may not be configured) */
const DEFAULT_APPEARANCE_ROLES = [
  'primary', 'neutral', 'secondary', 
  'positive', 'negative', 'warning', 'informative',
] as const;

const meta = {
  title: 'Components/Inputs/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    controls: {
      exclude: [
        'accent',
        'children',
        'labelAssociation',
        'supplementaryDescribedById',
        'labelSuffixInside',
        'labelTrailing',
        'errorHighlight',
        'labelWrapper',
        'required',
      ],
    },
    docs: {
      description: {
        component:
          '`appearance` drives border, hover, and checked-state fill (`auto` resolves to the secondary stack). Use **`label`** and optional **`description`** for visible copy beside the control. Three sizes (S/M/L), indeterminate and readonly states, surface-context awareness.',
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
      description: 'Appearance role — border, hover, and fill (including checked state).',
      table: { defaultValue: { summary: 'neutral' } },
    },
    label: {
      control: 'text',
      description: 'Visible label beside the control',
    },
    description: {
      control: 'text',
      description: 'Supplementary copy below the label row',
    },
    checked: {
      control: 'boolean',
      description: 'Whether the checkbox is checked (controlled)',
    },
    indeterminate: {
      control: 'boolean',
      description: 'Whether the checkbox is in indeterminate state',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the checkbox is disabled',
    },
    readOnly: {
      control: 'boolean',
      description: 'Whether the checkbox is read-only',
    },
    children: {
      table: { disable: true },
      control: false,
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof Checkbox>;

// ============================================================================
// 1. Default — Interactive with all controls
// ============================================================================
export const Default: Story = {
  args: {
    label: 'Accept terms and conditions',
    size: 'm',
    appearance: 'neutral',
  },
};

// ============================================================================
// 2. Sizes — S/M/L × (unchecked, checked, indeterminate) matrix
// ============================================================================
export const Sizes: Story = {
  render: () => <CheckboxSizes />,
};

// ============================================================================
// 3. States — Default, Checked, Indeterminate, ReadOnly, Disabled
// ============================================================================
export const States: Story = {
  render: () => <CheckboxStates />,
};

// ============================================================================
// 3b. Focus State — force-renders the Informative focus ring via data-force-state
// ============================================================================
export const FocusState: Story = {
  name: 'Focus State',
  render: () => <CheckboxFocusState />,
};

// ============================================================================
// 4. Appearances — All 9 roles × (unchecked, checked, indeterminate)
// ============================================================================
export const Appearances: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
      {DEFAULT_APPEARANCE_ROLES.map((role) => (
        <div key={role} style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-5)' }}>
          <span style={{ ...rowLabelStyle, width: 'var(--Spacing-24)', flexShrink: 0 }}>{role}</span>
          <Checkbox appearance={role} aria-label={`${role}, unchecked`} />
          <Checkbox appearance={role} checked aria-label={`${role}, checked`} />
          <Checkbox appearance={role} indeterminate aria-label={`${role}, indeterminate`} />
        </div>
      ))}
    </div>
  ),
};

// ============================================================================
// 5. Appearance (primary / secondary / sparkle fill)
// ============================================================================
export const Accents: Story = {
  name: 'Appearance (fill roles)',
  render: () => <CheckboxAccents />,
};

// ============================================================================
// 6. Surface Context — standard backgrounds + tinted surfaces
// ============================================================================
export const SurfaceContext: Story = {
  name: 'Surface Context',
  render: () => <CheckboxSurfaceContext />,
};

// ============================================================================
// 7. Themes — BG surface modes × checked/unchecked/indeterminate
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
            <Surface mode={mode} style={{ ...cellStyle, ...secondaryFills as React.CSSProperties }}>
              <Checkbox appearance="secondary" aria-label={`${label} surface, unchecked`} />
              <Checkbox appearance="secondary" checked aria-label={`${label} surface, checked`} />
              <Checkbox appearance="secondary" indeterminate aria-label={`${label} surface, indeterminate`} />
              <Checkbox appearance="secondary" label="Label" />
              <Checkbox appearance="secondary" checked label="Label" />
              <Checkbox appearance="secondary" indeterminate label="Label" />
            </Surface>
          </div>
        ))}
      </div>
    );
  },
};

// ============================================================================
// 8. WithLabel — Different label lengths, multiline labels
// ============================================================================
export const WithLabel: Story = {
  name: 'With Label',
  render: () => <CheckboxWithLabel />,
};

// ============================================================================
// 9. Interactive — Play function: click toggles check, verify aria-checked
// ============================================================================
export const Interactive: Story = {
  args: {
    label: 'Toggle me',
    size: 'm',
  },
  play: async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox');
    await expect(checkbox).toBeInTheDocument();
    await expect(checkbox).not.toBeChecked();

    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();

    await userEvent.click(checkbox);
    await expect(checkbox).not.toBeChecked();
  },
};

// ============================================================================
// 10. Motion — Tap scale + surface tint demo, with subtle-motion toggle
// ============================================================================

/** Subtle-motion override (Accessibility / reduced-motion). Mirrors the Radio story
 *  pattern: a wrapper class neutralises the press scale AND remaps the duration / easing
 *  tokens to their Subtle equivalents — same remap the token system does at :root inside
 *  @media (prefers-reduced-motion: reduce). BaseUI's Checkbox renders an element with
 *  role="checkbox". */
const checkboxMotionSubtleCSS = `
  .checkbox-motion-subtle {
    --Motion-Duration-S: var(--Motion-Duration-Subtle-S);
    --Motion-Duration-M: var(--Motion-Duration-Subtle-M);
    --Motion-Duration-L: var(--Motion-Duration-Subtle-M);
    --Motion-Offset-L: var(--Motion-Offset-Subtle-M);
    --Motion-Easing-Transition-Moderate: var(--Motion-Easing-Transition-Subtle);
  }
  /* Disable the press scale on the checkbox root. */
  .checkbox-motion-subtle [role="checkbox"]:active {
    transform: none !important;
  }
  /* Lock the indicator at icon-size and drop the rotation on the inner icons so
     determinate ↔ indeterminate is a pure opacity crossfade in subtle mode. */
  .checkbox-motion-subtle [role="checkbox"] > span {
    transform: scale(1) !important;
  }
  .checkbox-motion-subtle [role="checkbox"] > span > span > span {
    transform: rotate(0deg) !important;
  }
`;

function DeterminateIndeterminateDemo() {
  const [isIndeterminate, setIndeterminate] = React.useState(false);
  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-5)', alignItems: 'center' }}>
      <Checkbox size="l" appearance="primary" checked={!isIndeterminate} indeterminate={isIndeterminate} label="Primary" />
      <Checkbox size="l" appearance="secondary" checked={!isIndeterminate} indeterminate={isIndeterminate} label="Secondary" />
      <Checkbox size="l" appearance="sparkle" checked={!isIndeterminate} indeterminate={isIndeterminate} label="Sparkle" />
      <button
        type="button"
        onClick={() => setIndeterminate((v) => !v)}
        style={{
          appearance: 'none',
          border: 'var(--Stroke-M) solid var(--Border-Default)',
          borderRadius: 'var(--Shape-Pill)',
          padding: 'var(--Spacing-2) var(--Spacing-4)',
          background: 'transparent',
          color: 'var(--Text-High)',
          fontFamily: 'var(--Typography-Font-Primary)',
          fontSize: 'var(--Label-S-FontSize)',
          lineHeight: 'var(--Label-S-LineHeight)',
          cursor: 'pointer',
        }}
      >
        {isIndeterminate ? 'Switch to checked' : 'Switch to indeterminate'}
      </button>
    </div>
  );
}

export const Motion: Story = {
  name: 'Motion',
  parameters: {
    docs: {
      description: {
        story:
          'Tap-down scales the checkbox 100% → 107% over M; tap-up settles back to 100% over L. Surface colour transitions across hover and pressed. Tick burst on check fades in over S while scaling from box-size to icon-size over L. Determinate ↔ indeterminate is a paired rotation crossfade: tick 0°↔45°, minus -45°↔0°, both over L with Transition Moderate easing. Toggle "Subtle motion" to preview the reduced-motion behaviour (colours and opacity only, no scale or rotation).',
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
      <style>{checkboxMotionSubtleCSS}</style>
      <div
        className={args.subtleMotion ? 'checkbox-motion-subtle' : undefined}
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)', alignItems: 'flex-start' }}
      >
        <div style={{ display: 'flex', gap: 'var(--Spacing-5)', alignItems: 'center' }}>
          <Checkbox size="l" appearance="primary" defaultChecked label="Primary" />
          <Checkbox size="l" appearance="secondary" defaultChecked label="Secondary" />
          <Checkbox size="l" appearance="sparkle" defaultChecked label="Sparkle" />
          <Checkbox size="l" appearance="primary" indeterminate label="Indeterminate" />
        </div>
        <DeterminateIndeterminateDemo />
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
        <div key={size} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3-5)' }}>
          <Checkbox size={size} label={`Unchecked ${size}`} />
          <Checkbox size={size} checked label={`Checked ${size}`} />
        </div>
      ))}
    </div>
  ),
};

// ============================================================================
// 11. Density — Compact/default/open with full cascade isolation
// ============================================================================
export const Density: Story = {
  render: () => {
    const platform: BreakpointId = 'S';
    const densities: { id: DensityId; label: string }[] = [
      { id: 'compact', label: 'compact' },
      { id: 'default', label: 'default' },
      { id: 'open', label: 'open' },
    ];

    return (
      <div style={{ display: 'flex', gap: 'var(--Spacing-5)' }}>
        {densities.map(({ id, label }) => (
          <div
            key={id}
            className="density-card"
            data-density={id}
            data-Breakpoint={platform}
            data-6-Density={id}
            style={computeResponsiveDensityOverrides(platform, id)}
          >
            <span style={labelStyle}>{label}</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)', marginTop: 'var(--Spacing-3)' }}>
              <Checkbox size="s" checked label="Small" />
              <Checkbox size="m" checked label="Medium" />
              <Checkbox size="l" checked label="Large" />
            </div>
          </div>
        ))}
      </div>
    );
  },
};

// ============================================================================
// 12. ReadOnly — Readonly matrix: all sizes × unchecked/checked/indeterminate
// ============================================================================
export const ReadOnly: Story = {
  name: 'Read Only',
  render: () => <CheckboxReadOnly />,
};
