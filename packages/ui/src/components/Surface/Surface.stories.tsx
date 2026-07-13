/**
 * Surface.stories.tsx
 * Storybook documentation for the Surface primitive — the entry point
 * into the [data-surface] CSS token-remapping cascade.
 *
 * Rules:
 * - Token-only styling (no literal colors, pixels, or opacities)
 * - Uses in-system components (Button) to demonstrate surface adaptation
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';
import { Surface, type SurfaceMode } from './Surface';
import { Button } from '../Button';
import { MaterialFoundationProvider } from '../../contexts/MaterialFoundationContext';

const meta: Meta<typeof Surface> = {
  title: 'Components/Containers/Surface',
  component: Surface,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Surface is the container primitive that opts into the OneUI surface-context cascade. Setting `mode` applies the matching `data-surface` attribute, which remaps every role token (`--Primary-*`, `--Secondary-*`, `--Text-*`, etc.) for descendants. Components inside a Surface automatically adapt — no per-component changes needed.',
      },
    },
  },
  argTypes: {
    mode: {
      control: 'select',
      options: [
        'default', 'ghost', 'minimal', 'subtle', 'moderate', 'bold', 'elevated', 'blend',
      ],
      description: 'Surface mode. One of the 8 canonical surface tokens.',
      table: { defaultValue: { summary: 'ghost' } },
    },
    as: {
      control: 'text',
      description: 'Polymorphic element type',
      table: { defaultValue: { summary: 'div' } },
    },
  },
} satisfies Meta<typeof Surface>;

export default meta;
type Story = StoryObj<typeof Surface>;

// ─── Shared layout tokens ─────────────────────────────────────────────────────

const padStyle: React.CSSProperties = {
  padding: 'var(--Spacing-5)',
  borderRadius: 'var(--Shape-4)',
};

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--Typography-Font-Primary, inherit)',
  fontSize: 'var(--Body-S-FontSize)',
  lineHeight: 'var(--Body-S-LineHeight)',
  fontWeight: 'var(--Body-FontWeight-Medium)',
  color: 'var(--Text-Low)',
};

const stackStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--Spacing-4-5)',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 'var(--Spacing-4)',
  alignItems: 'center',
};

// ─── Stories ──────────────────────────────────────────────────────────────────

/* ========================================
   1. DEFAULT — single surface with children
   ======================================== */

export const Default: Story = {
  args: {
    mode: 'subtle',
  },
  render: (args) => (
    <Surface {...args} style={padStyle}>
      <p style={{ ...labelStyle, color: 'var(--Text-High)', margin: 0 }}>
        Surface mode: <strong>{args.mode}</strong>
      </p>
    </Surface>
  ),
};

/* ========================================
   2. ALL MODES — gallery of the 8 unified modes
   ======================================== */

const UNIFIED_MODES: Array<{ mode: SurfaceMode; description: string }> = [
  { mode: 'default',  description: 'Page background; no remapping' },
  { mode: 'minimal',  description: 'Lightest tint; subtle surface lift' },
  { mode: 'subtle',   description: 'Medium tint; card / panel fill' },
  { mode: 'moderate', description: 'Heavier tint; emphasised card' },
  { mode: 'bold',     description: 'Full accent fill; hero / CTA container' },
  { mode: 'elevated', description: 'Floating surface; popover / dialog' },
  { mode: 'blend',    description: 'Parent-step fill for media/material blending' },
  { mode: 'ghost',    description: 'Transparent; inherits parent surface' },
];

export const AllModes: Story = {
  name: 'All Modes',
  parameters: {
    docs: {
      description: {
        story:
          'Every unified surface mode rendered side by side. The `bold` mode triggers the brand-bold inversion so descendant components adapt to the accent fill.',
      },
    },
  },
  render: () => (
    <div style={stackStyle}>
      {UNIFIED_MODES.map(({ mode, description }) => (
        <div key={mode} style={stackStyle}>
          <span style={labelStyle}>
            <strong style={{ color: 'var(--Text-High)' }}>{mode}</strong>
            {' — '}
            {description}
          </span>
          <Surface mode={mode} style={padStyle}>
            <div style={rowStyle}>
              <Button attention="high" appearance="primary">Primary</Button>
              <Button attention="medium" appearance="primary">Medium</Button>
              <Button attention="low" appearance="primary">Ghost</Button>
            </div>
          </Surface>
        </div>
      ))}
    </div>
  ),
};

/* ========================================
   3. COMPONENT ADAPTATION — Buttons in every mode
   Shows how a single component set adapts automatically.
   ======================================== */

export const ComponentAdaptation: Story = {
  name: 'Component Adaptation',
  parameters: {
    docs: {
      description: {
        story:
          'The same three Buttons are rendered inside every Surface. The CSS cascade remaps the role tokens — the components themselves are unchanged.',
      },
    },
  },
  render: () => (
    <div style={stackStyle}>
      {UNIFIED_MODES.map(({ mode }) => (
        <div
          key={mode}
          style={{ display: 'grid', gridTemplateColumns: 'var(--Spacing-18) 1fr', alignItems: 'center', gap: 'var(--Spacing-4-5)' }}
        >
          <span style={labelStyle}>{mode}</span>
          <Surface mode={mode} style={padStyle}>
            <div style={rowStyle}>
              <Button attention="high">Bold</Button>
              <Button attention="medium">Subtle</Button>
              <Button attention="low">Ghost</Button>
            </div>
          </Surface>
        </div>
      ))}
    </div>
  ),
};

/* ========================================
   4. NESTED — Surfaces inside Surfaces
   ======================================== */

export const Nested: Story = {
  name: 'Nested Surfaces',
  parameters: {
    docs: {
      description: {
        story:
          'Surfaces can be nested. Each level applies its own `data-surface` attribute, and the token cascade follows the closest ancestor.',
      },
    },
  },
  render: () => (
    <Surface mode="bold" style={padStyle}>
      <span style={{ ...labelStyle, color: 'var(--Text-OnBold-High, var(--Text-High))' }}>Outer: bold</span>
      <div style={{ marginTop: 'var(--Spacing-4-5)' }}>
        <Surface mode="subtle" style={padStyle}>
          <span style={labelStyle}>Middle: subtle</span>
          <div style={{ marginTop: 'var(--Spacing-4-5)' }}>
            <Surface mode="elevated" style={padStyle}>
              <span style={labelStyle}>Inner: elevated</span>
              <div style={{ marginTop: 'var(--Spacing-4)', ...rowStyle }}>
                <Button attention="high">Bold</Button>
                <Button attention="medium">Subtle</Button>
                <Button attention="low">Ghost</Button>
              </div>
            </Surface>
          </div>
        </Surface>
      </div>
    </Surface>
  ),
};

/* ========================================
   5. POLYMORPHIC — Surface as a semantic element
   ======================================== */

export const Polymorphic: Story = {
  name: 'Polymorphic `as`',
  parameters: {
    docs: {
      description: {
        story:
          'Surface accepts an `as` prop so the rendered element carries the correct semantics (e.g. `section`, `article`, `aside`).',
      },
    },
  },
  render: () => (
    <div style={stackStyle}>
      <Surface mode="subtle" as="section" style={padStyle} aria-label="Hero section">
        <span style={labelStyle}>Rendered as <code>&lt;section&gt;</code></span>
      </Surface>
      <Surface mode="elevated" as="article" style={padStyle} aria-label="Card">
        <span style={labelStyle}>Rendered as <code>&lt;article&gt;</code></span>
      </Surface>
      <Surface mode="minimal" as="aside" style={padStyle} aria-label="Sidebar callout">
        <span style={labelStyle}>Rendered as <code>&lt;aside&gt;</code></span>
      </Surface>
    </div>
  ),
};

/* ========================================
   6. TRANSPARENT MATERIAL — over arbitrary media
   ======================================== */

// Simple synthetic media backgrounds (not actual photos — tokens only, no URL).
// Each "photo" is a gradient tinted for its context so the transparent surfaces
// have something to composite over.
//
// TODO(visual-fidelity): the `dynamic` backdrop is most convincing over a real
// photo with rich chroma variation. Swap for a committed stock image once a
// licensed asset is in hand (e.g. packages/ui/src/components/Surface/assets/
// transparent-material-backdrop.webp). Gradient retained as a deterministic
// placeholder so Chromatic baselines stay stable until then.
const mediaBgStyle: Record<'dynamic' | 'dark' | 'light', React.CSSProperties> = {
  // Dynamic = arbitrary media (unknown brightness/tone). 4-stop radial + linear
  // composite gives the transparent surfaces more varied chroma to composite
  // against than a single linear sweep.
  dynamic: {
    backgroundImage: [
      'radial-gradient(circle at 20% 30%, var(--Positive-Bold) 0%, transparent 55%)',
      'radial-gradient(circle at 80% 70%, var(--Informative-Bold) 0%, transparent 55%)',
      'linear-gradient(135deg, var(--Primary-Bold) 0%, var(--Negative-Bold) 50%, var(--Warning-Bold) 100%)',
    ].join(', '),
  },
  // Dark = known dark media
  dark: {
    backgroundImage:
      'linear-gradient(135deg, var(--Neutral-Bold) 0%, var(--Primary-Bold) 100%)',
  },
  // Light = known light media
  light: {
    backgroundImage:
      'linear-gradient(135deg, var(--Surface-Default) 0%, var(--Neutral-Minimal) 100%)',
  },
};

const TRANSPARENT_MODES = ['default', 'ghost', 'minimal', 'subtle', 'moderate', 'bold', 'elevated', 'blend'] as const;

const mediaPadStyle: React.CSSProperties = {
  padding: 'var(--Spacing-6)',
  borderRadius: 'var(--Shape-4-5)',
  minHeight: 140,
};

function TransparentRow({ ctx }: { ctx: 'dynamic' | 'dark' | 'light' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3-5)' }}>
      <span style={labelStyle}>
        <strong style={{ color: 'var(--Text-High)' }}>mediaContext="{ctx}"</strong>
      </span>
      <div
        style={{
          ...mediaBgStyle[ctx],
          borderRadius: 'var(--Shape-4-5)',
          padding: 'var(--Spacing-4-5)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 'var(--Spacing-4)',
        }}
      >
        {TRANSPARENT_MODES.map((mode) => (
          <Surface
            key={mode}
            mode={mode}
            material="transparent"
            mediaContext={ctx}
            style={mediaPadStyle}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3-5)' }}>
              <code style={{ fontSize: 'var(--Label-XS-FontSize)', fontFamily: 'var(--Typography-Font-Code)' }}>
                mode="{mode}"
              </code>
              <div style={rowStyle}>
                <Button attention="high" size="small">Bold</Button>
                <Button attention="medium" size="small">Subtle</Button>
                <Button attention="low" size="small">Ghost</Button>
              </div>
            </div>
          </Surface>
        ))}
      </div>
    </div>
  );
}

export const TransparentMaterial: Story = {
  name: 'Transparent Material',
  parameters: {
    docs: {
      description: {
        story:
          '`material="transparent"` composites a Surface over arbitrary media (photos, video, hero backgrounds). The engine resolves the fill as a partially-opaque neutral whose alpha is derived from the step; the caller picks `mediaContext="dynamic|dark|light"` based on what the underlying media looks like. `dynamic` is the safest default — it uses more opaque fills so surfaces stay readable against unpredictable imagery. Inside a transparent Surface, buttons and other components pick up alpha-composited content tokens automatically. **Requires a brand selected in the Storybook toolbar** so brand CSS injects the `[data-material="transparent"]` lookup blocks.',
      },
    },
  },
  render: () => (
    <div style={stackStyle}>
      <TransparentRow ctx="dynamic" />
      <TransparentRow ctx="dark" />
      <TransparentRow ctx="light" />
    </div>
  ),
};

export const TransparentMaterialDefaults: Story = {
  name: 'Transparent Material Defaults',
  parameters: {
    docs: {
      description: {
        story:
          'Brand-level Material foundation defaults can make ordinary `<Surface>` usage render as transparent material. This mirrors the platform/Convex configuration path: callers can still override a specific Surface with `material="solid"`.',
      },
    },
  },
  render: () => (
    <MaterialFoundationProvider
      value={{ defaultMaterialMode: 'transparent', defaultMediaContext: 'dynamic' }}
    >
      <div style={stackStyle}>
        <TransparentRow ctx="dynamic" />
        <div
          style={{
            ...mediaBgStyle.dark,
            borderRadius: 'var(--Shape-4-5)',
            padding: 'var(--Spacing-4-5)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 'var(--Spacing-4)',
          }}
        >
          <Surface mode="subtle" style={mediaPadStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3-5)' }}>
              <code style={{ fontSize: 'var(--Label-XS-FontSize)', fontFamily: 'var(--Typography-Font-Code)' }}>
                provider default
              </code>
              <div style={rowStyle}>
                <Button attention="high" size="small">Bold</Button>
                <Button attention="medium" size="small">Subtle</Button>
                <Button attention="low" size="small">Ghost</Button>
              </div>
            </div>
          </Surface>
          <Surface mode="subtle" material="solid" style={mediaPadStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3-5)' }}>
              <code style={{ fontSize: 'var(--Label-XS-FontSize)', fontFamily: 'var(--Typography-Font-Code)' }}>
                explicit solid
              </code>
              <div style={rowStyle}>
                <Button attention="high" size="small">Bold</Button>
                <Button attention="medium" size="small">Subtle</Button>
                <Button attention="low" size="small">Ghost</Button>
              </div>
            </div>
          </Surface>
        </div>
      </div>
    </MaterialFoundationProvider>
  ),
};
