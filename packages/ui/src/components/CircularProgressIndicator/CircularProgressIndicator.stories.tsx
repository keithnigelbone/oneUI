/**
 * CircularProgressIndicator.stories.tsx
 * Storybook documentation for CircularProgressIndicator component
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect } from 'storybook/test';
import { CircularProgressIndicator } from './CircularProgressIndicator';
import { Icon } from '../Icon/Icon';
import { Surface } from '../Surface/Surface';
import React, { useEffect, useState } from 'react';

const meta: Meta<typeof CircularProgressIndicator> = {
  title: 'Components/Feedback/CircularProgressIndicator',
  component: CircularProgressIndicator,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Circular progress indicators provide a visual representation of the current progress of a task, such as a file upload or content loading. Supports determinate (value-driven) and indeterminate (spinning) variants with 10 size presets and 9 multi-accent appearance roles.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'radio',
      options: ['determinate', 'indeterminate'],
      description: 'Determinate shows arc proportional to value; indeterminate shows spinning animation',
      table: { defaultValue: { summary: 'determinate' } },
    },
    size: {
      control: 'select',
      options: ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'],
      description: 'Size preset — maps to spacing dimension tokens',
      table: { defaultValue: { summary: 'M' } },
    },
    appearance: {
      control: 'radio',
      options: ['auto', 'primary', 'secondary', 'sparkle', 'brand-bg', 'neutral', 'positive', 'negative', 'warning', 'informative'],
      description: 'Multi-accent appearance role',
      table: { defaultValue: { summary: 'auto' } },
    },
    content: {
      control: 'radio',
      options: ['none', 'icon', 'text'],
      description: 'Center content type',
      table: { defaultValue: { summary: 'none' } },
    },
    value: {
      control: { type: 'range', min: 0, max: 100, step: 1 },
      description: 'Current progress value (determinate only)',
    },
    min: {
      control: 'number',
      description: 'Minimum value',
      table: { defaultValue: { summary: '0' } },
    },
    max: {
      control: 'number',
      description: 'Maximum value',
      table: { defaultValue: { summary: '100' } },
    },
  },
};

export default meta;
type Story = StoryObj<typeof CircularProgressIndicator>;

/** Label style for section headers */
const sectionLabelStyle: React.CSSProperties = {
  fontSize: 'var(--Typography-Size-S)',
  color: 'var(--Text-Low)',
};

// ========================================
// 1. Default
// ========================================
export const Default: Story = {
  args: {
    value: 25,
    size: 'M',
    appearance: 'secondary',
    'aria-label': 'Task progress',
  },
};

// ========================================
// 2. Variants — Determinate vs Indeterminate
// ========================================
export const Variants: Story = {
  name: 'Variants',
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-6)', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
        <CircularProgressIndicator
          variant="determinate"
          value={65}
          size="3XL"
          aria-label="Determinate progress"
        />
        <span style={sectionLabelStyle}>Determinate</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
        <CircularProgressIndicator
          variant="indeterminate"
          size="3XL"
          aria-label="Indeterminate progress"
        />
        <span style={sectionLabelStyle}>Indeterminate</span>
      </div>
    </div>
  ),
};

// ========================================
// 3. Sizes — All 10 presets
// ========================================
export const Sizes: Story = {
  name: 'Sizes',
  render: () => {
    const sizes = ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'] as const;
    return (
      <div style={{ display: 'flex', gap: 'var(--Spacing-4-5)', alignItems: 'end' }}>
        {sizes.map((size) => (
          <div
            key={size}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--Spacing-3)',
            }}
          >
            <CircularProgressIndicator
              value={65}
              size={size}
              aria-label={`${size} progress`}
            />
            <span style={sectionLabelStyle}>{size}</span>
          </div>
        ))}
      </div>
    );
  },
};

// ========================================
// 4. Appearances — All 9 multi-accent roles
// ========================================
export const Appearances: Story = {
  name: 'Appearances',
  render: () => {
    const appearances = [
      'primary',
      'secondary',
      'sparkle',
      'brand-bg',
      'neutral',
      'positive',
      'negative',
      'warning',
      'informative',
    ] as const;
    return (
      <div style={{ display: 'flex', gap: 'var(--Spacing-6)', flexWrap: 'wrap', alignItems: 'center' }}>
        {appearances.map((appearance) => (
          <div
            key={appearance}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--Spacing-3)',
            }}
          >
            <CircularProgressIndicator
              value={65}
              size="3XL"
              appearance={appearance}
              aria-label={`${appearance} progress`}
            />
            <span style={sectionLabelStyle}>{appearance}</span>
          </div>
        ))}
      </div>
    );
  },
};

// ========================================
// 5. WithContent — Icon and Text content modes
// ========================================
export const WithContent: Story = {
  name: 'With Content',
  render: () => (
    <div style={{ display: 'flex', gap: 'var(--Spacing-7)', alignItems: 'center' }}>
      {/* Text content at various sizes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)', alignItems: 'center' }}>
        <span style={sectionLabelStyle}>Text (auto percentage)</span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-4-5)', alignItems: 'center', flexWrap: 'wrap' }}>
          {(['L', 'XL', '2XL', '3XL', '4XL', '5XL'] as const).map((size) => (
            <CircularProgressIndicator
              key={size}
              value={25}
              size={size}
              content="text"
              aria-label={`${size} text progress`}
            />
          ))}
        </div>
      </div>

      {/* Icon content at various sizes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)', alignItems: 'center' }}>
        <span style={sectionLabelStyle}>Icon (children)</span>
        <div style={{ display: 'flex', gap: 'var(--Spacing-4-5)', alignItems: 'center', flexWrap: 'wrap' }}>
          {(['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL'] as const).map((size) => (
            <CircularProgressIndicator
              key={size}
              value={50}
              size={size}
              content="icon"
              aria-label={`${size} icon progress`}
            >
              <Icon icon="download" aria-hidden />
            </CircularProgressIndicator>
          ))}
        </div>
      </div>
    </div>
  ),
};

// ========================================
// 6. States — 0%, 25%, 50%, 75%, 100%
// ========================================
export const States: Story = {
  name: 'States',
  render: () => {
    const values = [0, 25, 50, 75, 100];
    return (
      <div style={{ display: 'flex', gap: 'var(--Spacing-6)', alignItems: 'center' }}>
        {values.map((v) => (
          <div
            key={v}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--Spacing-3)',
            }}
          >
            <CircularProgressIndicator
              value={v}
              size="3XL"
              content="text"
              aria-label={`${v}% progress`}
            />
            <span style={sectionLabelStyle}>{v}%</span>
          </div>
        ))}
      </div>
    );
  },
};

// ========================================
// 7. Interactive — Tracking mode vs Jump mode + Indeterminate
// ========================================
function AnimatedProgress() {
  // Tracking — rapid continuous updates (simulates a real loader).
  const [tracking, setTracking] = useState(0);
  // Jumping — value jumps to a new target every 2s (simulates discrete state changes).
  const [jumping, setJumping] = useState(25);

  useEffect(() => {
    const trackingInterval = setInterval(() => {
      setTracking((prev) => (prev >= 100 ? 0 : prev + 1));
    }, 50);
    const jumpingInterval = setInterval(() => {
      setJumping(() => Math.floor(Math.random() * 101));
    }, 2000);
    return () => {
      clearInterval(trackingInterval);
      clearInterval(jumpingInterval);
    };
  }, []);

  const columnStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--Spacing-3)',
  };

  return (
    <div style={{ display: 'flex', gap: 'var(--Spacing-6)', alignItems: 'center' }}>
      <div style={columnStyle}>
        <CircularProgressIndicator
          value={tracking}
          size="4XL"
          content="text"
          aria-label="Continuous tracking progress"
          // Continuous mode: instant updates — cumulative motion reads as linear.
          style={{ '--CircularProgressIndicator-valueTransitionDuration': '0s' } as React.CSSProperties}
        />
        <span style={sectionLabelStyle}>Tracking — continuous</span>
      </div>
      <div style={columnStyle}>
        <CircularProgressIndicator
          value={jumping}
          size="4XL"
          content="text"
          appearance="positive"
          aria-label="Jumping progress"
        />
        <span style={sectionLabelStyle}>Jumping — 3XL Transition</span>
      </div>
      <div style={columnStyle}>
        <CircularProgressIndicator
          variant="indeterminate"
          size="4XL"
          appearance="secondary"
          aria-label="Indeterminate loading"
        />
        <span style={sectionLabelStyle}>Indeterminate</span>
      </div>
    </div>
  );
}

export const Interactive: Story = {
  name: 'Interactive',
  render: () => <AnimatedProgress />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const indicators = canvas.getAllByRole('progressbar');
    expect(indicators.length).toBeGreaterThanOrEqual(1);
  },
};

// ========================================
// 8. Surface Context — all 5 surface modes in a flat list
// ========================================
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
      display: 'flex', alignItems: 'center', gap: 'var(--Spacing-6)',
      padding: 'var(--Spacing-5)', borderRadius: 'var(--Shape-4)',
    };

    const indicators = (
      <>
        <CircularProgressIndicator value={65} size="3XL" aria-label="Determinate" />
        <CircularProgressIndicator variant="indeterminate" size="3XL" aria-label="Indeterminate" />
      </>
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)', minWidth: 320 }}>
        {surfaceModes.map(({ mode, label, desc }) => (
          <div key={mode} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
            <span style={sectionLabelStyle}>{label} — {desc}</span>
            <Surface mode={mode} style={contentStyle}>{indicators}</Surface>
          </div>
        ))}
      </div>
    );
  },
};

// ========================================
// 9. Motion — switch between modes; Show code reflects the active one
// ========================================
type MotionMode = 'indeterminate' | 'jumping' | 'tracking';

const MOTION_SOURCE: Record<MotionMode, string> = {
  indeterminate: `/* Indeterminate — two independent trim tracks + rotation, all CSS */
@property --cpi-indeterminate-head { syntax: '<number>'; inherits: false; initial-value: 2; }
@property --cpi-indeterminate-tail { syntax: '<number>'; inherits: false; initial-value: 0; }

.indicator {
  animation:
    cpi-indeterminate-head 1500ms var(--Motion-Easing-Transition-Moderate) infinite,
    cpi-indeterminate-tail 1500ms var(--Motion-Easing-Transition-Moderate) infinite;
  stroke-dasharray:
    calc(var(--cpi-indeterminate-head) - var(--cpi-indeterminate-tail))
    calc(100 - (var(--cpi-indeterminate-head) - var(--cpi-indeterminate-tail)));
  stroke-dashoffset: calc(var(--cpi-indeterminate-tail) * -1);
}
.svg { animation: cpi-indeterminate-rotate 6000ms linear infinite; }

@keyframes cpi-indeterminate-head {
  0%      { --cpi-indeterminate-head: 2; }
  76.667% { --cpi-indeterminate-head: 100; }   /* @ 1150ms (AE keyframe) */
  100%    { --cpi-indeterminate-head: 102; }   /* 102 ≡ 2 mod 100 — seamless loop */
}
@keyframes cpi-indeterminate-tail {
  0%      { --cpi-indeterminate-tail: 0; }
  43.333% { --cpi-indeterminate-tail: 0; }     /* held until 650ms */
  100%    { --cpi-indeterminate-tail: 100; }   /* 100 ≡ 0 mod 100 — seamless loop */
}
@keyframes cpi-indeterminate-rotate {
  from { transform: rotate(0deg); }
  to   { transform: rotate(1080deg); }
}`,
  jumping: `/* Determinate — jumping (default): 3XL duration + Transition easing */
.indicator {
  transition:
    stroke-dashoffset
    var(--Motion-Duration-3XL)               /* 1015ms */
    var(--Motion-Easing-Transition-Moderate);
}`,
  tracking: `/* Determinate — tracking (continuous mode): consumer opts in per instance */
<CircularProgressIndicator
  value={uploadProgress}
  style={{ '--CircularProgressIndicator-valueTransitionDuration': '0s' }}
/>`,
};

// Code shown when the Entry & exit toggle is on — composes with any motion mode.
const ENTRY_EXIT_SOURCE = `/* Entry + exit — stroke 0 ↔ natural, scale 0.93 ↔ 1, XL duration, Transition easing.
   Opt-in via \`animate\`. */

/* Indeterminate — entry/exit driven by the \`show\` prop. */
<CircularProgressIndicator
  variant="indeterminate"
  animate
  show={loading}            // entry on false → true, exit on true → false
/>

/* Determinate — entry ONLY at value=0, exit ONLY when value reaches 100. */
<CircularProgressIndicator
  variant="determinate"
  animate
  value={progress}          // entry plays when progress is 0, exit when progress hits 100
/>

/* CSS that drives it */
.root[data-animate="true"][data-phase="entering"] {
  animation: cpi-enter var(--Motion-Duration-XL) var(--Motion-Easing-Transition-Moderate) backwards;
}
.root[data-animate="true"][data-phase="entering"] .track,
.root[data-animate="true"][data-phase="entering"] .indicator {
  animation: cpi-enter-stroke var(--Motion-Duration-XL) var(--Motion-Easing-Transition-Moderate) backwards;
}
.root[data-animate="true"][data-phase="exiting"] {
  animation: cpi-exit var(--Motion-Duration-XL) var(--Motion-Easing-Transition-Moderate) forwards;
}
.root[data-animate="true"][data-phase="exiting"] .track,
.root[data-animate="true"][data-phase="exiting"] .indicator {
  animation: cpi-exit-stroke var(--Motion-Duration-XL) var(--Motion-Easing-Transition-Moderate) forwards;
}

@keyframes cpi-enter        { from { transform: scale(0.93); } }
@keyframes cpi-exit         { to   { transform: scale(0.93); } }
@keyframes cpi-enter-stroke { from { stroke-width: 0; } }
@keyframes cpi-exit-stroke  { to   { stroke-width: 0; } }`;

function MotionShowcase({ mode, entryExit = false }: { mode: MotionMode; entryExit?: boolean }) {
  const [tracking, setTracking] = useState(0);
  const [jumping, setJumping] = useState(25);
  const [show, setShow] = useState(true);
  // Demo value driving determinate entry/exit when entryExit=true.
  // Cycles 0 → 100 (drives exit), holds long enough for the exit animation,
  // then drops back to 0 (drives re-entry).
  const [demoValue, setDemoValue] = useState(0);

  useEffect(() => {
    const cleanups: Array<() => void> = [];
    if (mode === 'tracking' && !entryExit) {
      const t = setInterval(() => setTracking((p) => (p >= 100 ? 0 : p + 1)), 50);
      cleanups.push(() => clearInterval(t));
    }
    if (mode === 'jumping' && !entryExit) {
      const j = setInterval(() => setJumping(() => Math.floor(Math.random() * 101)), 2000);
      cleanups.push(() => clearInterval(j));
    }
    if (entryExit) {
      if (mode === 'indeterminate') {
        setShow(true);
        const e = setInterval(() => setShow((s) => !s), 2000);
        cleanups.push(() => clearInterval(e));
      } else if (mode === 'tracking') {
        // Tracking cycle — 1% per 50ms (matches the regular tracking demo).
        // Instant value updates via the CSS variable override, so the cumulative
        // motion reads as a smooth continuous fill.
        setDemoValue(0);
        let progress = 0;
        let waiting = false;
        const interval = setInterval(() => {
          if (waiting) return;
          progress += 1;
          if (progress >= 100) {
            progress = 100;
            setDemoValue(100);
            waiting = true;
            setTimeout(() => {
              progress = 0;
              setDemoValue(0);
              waiting = false;
            }, 800);
          } else {
            setDemoValue(progress);
          }
        }, 50);
        cleanups.push(() => clearInterval(interval));
      } else {
        // Jumping cycle — forward-only jumps (0 → mid → 100) spaced wide enough
        // that each eased transition (3XL ≈ 1015ms) completes before the next.
        // Reset to 0 happens AFTER the component has fully exited (~1015 + 450ms),
        // so the user never sees a backward 100 → 0 transition on the arc.
        setDemoValue(0);
        let cancelled = false;
        let timeoutId: ReturnType<typeof setTimeout>;
        const runCycle = () => {
          if (cancelled) return;
          timeoutId = setTimeout(() => {
            if (cancelled) return;
            const mid = 30 + Math.floor(Math.random() * 50); // 30..79
            setDemoValue(mid);
            timeoutId = setTimeout(() => {
              if (cancelled) return;
              setDemoValue(100);
              // Wait for value transition (~1015ms) + exit (450ms) + small buffer
              // so the reset to 0 lands while the component is already hidden.
              timeoutId = setTimeout(() => {
                if (cancelled) return;
                setDemoValue(0);
                timeoutId = setTimeout(runCycle, 1500);
              }, 1700);
            }, 1500);
          }, 1500);
        };
        runCycle();
        cleanups.push(() => {
          cancelled = true;
          clearTimeout(timeoutId);
        });
      }
    } else if (!show) {
      setShow(true);
    }
    return () => cleanups.forEach((c) => c());
  }, [mode, entryExit]);

  if (mode === 'indeterminate') {
    return (
      <CircularProgressIndicator
        variant="indeterminate"
        size="4XL"
        aria-label="Indeterminate spinner"
        {...(entryExit ? { animate: true as const, show } : {})}
      />
    );
  }
  if (mode === 'jumping') {
    return (
      <CircularProgressIndicator
        value={entryExit ? demoValue : jumping}
        size="4XL"
        content="text"
        aria-label="Determinate jumping"
        {...(entryExit ? { animate: true as const } : {})}
      />
    );
  }
  return (
    <CircularProgressIndicator
      value={entryExit ? demoValue : tracking}
      size="4XL"
      content="text"
      aria-label="Determinate tracking"
      style={{ '--CircularProgressIndicator-valueTransitionDuration': '0s' } as React.CSSProperties}
      {...(entryExit ? { animate: true as const } : {})}
    />
  );
}

const hideAllControls = {
  controls: { exclude: ['variant', 'size', 'appearance', 'content', 'value', 'min', 'max'] },
};

// Sidebar shows a single "Motion" entry with a Motion mode radio control —
// switching it on the canvas updates both the demo and the Show code.
// The two extra demos use tags: ['!dev'] so they stay off the sidebar but
// still render on the Docs page — each with its own Show code button.
export const Motion: Story = {
  name: 'Motion',
  args: { motionMode: 'indeterminate', entryExit: false } as Story['args'],
  argTypes: {
    motionMode: {
      name: 'Motion mode',
      options: ['indeterminate', 'jumping', 'tracking'],
      control: {
        type: 'radio',
        labels: {
          indeterminate: 'indeterminate',
          jumping: 'determinate - jump',
          tracking: 'determinate - tracking',
        },
      },
      description: 'Which motion behavior to demonstrate.',
    },
    entryExit: {
      name: 'Entry & exit',
      control: { type: 'boolean' },
      description:
        'Toggle the entry + exit animation cycle on top of the active motion mode. Drives `animate` and a 2s show/hide cycle.',
    },
  } as Story['argTypes'],
  parameters: {
    ...hideAllControls,
    docs: {
      source: {
        transform: (_code: string, ctx: { args: { motionMode?: MotionMode; entryExit?: boolean } }) => {
          const motion = MOTION_SOURCE[ctx.args?.motionMode ?? 'indeterminate'];
          return ctx.args?.entryExit ? `${motion}\n\n${ENTRY_EXIT_SOURCE}` : motion;
        },
      },
    },
  },
  render: (args) => {
    const a = args as { motionMode?: MotionMode; entryExit?: boolean };
    return <MotionShowcase mode={a.motionMode ?? 'indeterminate'} entryExit={a.entryExit ?? false} />;
  },
};

export const MotionJumping: Story = {
  name: 'Motion — Determinate jumping',
  tags: ['!dev'],
  parameters: {
    ...hideAllControls,
    docs: {
      source: { code: MOTION_SOURCE.jumping, language: 'css' },
    },
  },
  render: () => <MotionShowcase mode="jumping" />,
};

export const MotionTracking: Story = {
  name: 'Motion — Determinate tracking',
  tags: ['!dev'],
  parameters: {
    ...hideAllControls,
    docs: {
      source: { code: MOTION_SOURCE.tracking, language: 'tsx' },
    },
  },
  render: () => <MotionShowcase mode="tracking" />,
};

export const MotionEntryExit: Story = {
  name: 'Motion — Entry & exit',
  tags: ['!dev'],
  parameters: {
    ...hideAllControls,
    docs: {
      source: { code: ENTRY_EXIT_SOURCE, language: 'tsx' },
    },
  },
  render: () => <MotionShowcase mode="indeterminate" entryExit />,
};
