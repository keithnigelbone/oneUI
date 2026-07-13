/**
 * CounterBadge.stories.tsx
 * Storybook documentation for CounterBadge component
 */

import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect, userEvent } from 'storybook/test';
import { CounterBadge } from './CounterBadge';
import { Surface } from '../Surface/Surface';
import React from 'react';

const meta: Meta<typeof CounterBadge> = {
  title: 'Components/Display/CounterBadge',
  component: CounterBadge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Non-interactive display component showing a numeric count (e.g., unread notifications). Supports attention levels, multi-accent roles, and four sizes.',
      },
    },
  },
  argTypes: {
    attention: {
      control: 'radio',
      options: ['high', 'medium', 'low'],
      description: 'Attention level — High (filled), Medium (tinted), Low (transparent)',
      table: { defaultValue: { summary: 'high' } },
    },
    size: {
      control: 'select',
      options: ['xs', 's', 'm', 'l'],
      description: 'CounterBadge size',
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
      description: 'Multi-accent appearance role',
      table: { defaultValue: { summary: 'auto' } },
    },
    value: {
      control: 'number',
      description: 'Numeric value to display',
    },
    max: {
      control: 'number',
      description: 'Maximum value before showing overflow',
      table: { defaultValue: { summary: '99' } },
    },
    showZero: {
      control: 'boolean',
      description: 'Whether to show the badge when value is 0',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CounterBadge>;

/** Label style for section headers */
const sectionLabelStyle: React.CSSProperties = {
  fontSize: 'var(--Label-S-FontSize)',
  color: 'var(--Text-Low)',
};

// 1. Default
export const Default: Story = {
  args: {
    value: 5,
    attention: 'high',
    size: 'm',
    'aria-label': '5 notifications',
  },
};

// 2. Variants — Bold/Subtle/Ghost
export const Variants: Story = {
  name: 'Variants',
  render: () => (
    <div className="story-row">
      <CounterBadge value={5} attention="high" aria-label="5 notifications" />
      <CounterBadge value={5} attention="medium" aria-label="5 notifications" />
      <CounterBadge value={5} attention="low" aria-label="5 notifications" />
    </div>
  ),
};

// 3. Sizes — XS/S/M/L
export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div className="story-row" style={{ alignItems: 'center' }}>
      <CounterBadge value={5} size="xs" aria-label="5 notifications" />
      <CounterBadge value={5} size="s" aria-label="5 notifications" />
      <CounterBadge value={5} size="m" aria-label="5 notifications" />
      <CounterBadge value={5} size="l" aria-label="5 notifications" />
    </div>
  ),
};

// 4. MaxValue — Shows "99+" overflow + custom max
export const MaxValue: Story = {
  name: 'Max Value',
  render: () => (
    <div className="story-column" style={{ gap: 'var(--Spacing-4-5)' }}>
      <div>
        <span style={sectionLabelStyle}>Default max (99)</span>
        <div className="story-row" style={{ alignItems: 'center' }}>
          <CounterBadge value={50} aria-label="50 notifications" />
          <CounterBadge value={99} aria-label="99 notifications" />
          <CounterBadge value={150} aria-label="150 notifications" />
        </div>
      </div>
      <div>
        <span style={sectionLabelStyle}>Custom max (9)</span>
        <div className="story-row" style={{ alignItems: 'center' }}>
          <CounterBadge value={5} max={9} aria-label="5 notifications" />
          <CounterBadge value={9} max={9} aria-label="9 notifications" />
          <CounterBadge value={15} max={9} aria-label="15 notifications" />
        </div>
      </div>
    </div>
  ),
};

// 5. Appearances — All 9 roles
export const Appearances: Story = {
  name: 'Appearances',
  render: () => (
    <div className="story-column" style={{ gap: 'var(--Spacing-4-5)' }}>
      {(
        [
          'primary',
          'secondary',
          'neutral',
          'sparkle',
          'brand-bg',
          'positive',
          'negative',
          'warning',
          'informative',
        ] as const
      ).map((role) => (
        <div
          key={role}
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}
        >
          <span style={{ ...sectionLabelStyle, textTransform: 'capitalize' }}>{role}</span>
          <div className="story-row">
            <CounterBadge
              value={5}
              appearance={role}
              attention="high"
              aria-label="5 notifications"
            />
            <CounterBadge
              value={5}
              appearance={role}
              attention="medium"
              aria-label="5 notifications"
            />
            <CounterBadge
              value={5}
              appearance={role}
              attention="low"
              aria-label="5 notifications"
            />
          </div>
        </div>
      ))}
    </div>
  ),
};

// 6. Interactive — Play function
export const Interactive: Story = {
  args: {
    value: 42,
    attention: 'high',
    size: 'm',
    'aria-label': '42 notifications',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByRole('status');

    // Verify badge exists and shows value
    await expect(badge).toBeInTheDocument();
    await expect(badge).toHaveTextContent('42');
  },
};

// 7. Responsive — Viewport testing
export const Responsive: Story = {
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => (
    <div className="story-column" style={{ width: '100%', alignItems: 'center' }}>
      <div className="story-row" style={{ alignItems: 'center' }}>
        <CounterBadge value={3} size="xs" aria-label="3 notifications" />
        <CounterBadge value={3} size="s" aria-label="3 notifications" />
        <CounterBadge value={3} size="m" aria-label="3 notifications" />
        <CounterBadge value={3} size="l" aria-label="3 notifications" />
      </div>
    </div>
  ),
};

// 8. Motion — CSS animation choreography
//
// Scale pulse: two chained @keyframes (up then down) via animation-delay.
// Width change: CSS transition via interpolate-size: allow-keywords.
// Entry/exit: CSS transitions on opacity + transform.
// Number change: only thing requiring JS (CSS can't change text content).

/** CSS for motion keyframes + width transition + reduced motion override */
const motionCSS = `
  @keyframes counter-scale-up {
    from { transform: scale(1); }
    to { transform: scale(1.2); }
  }
  @keyframes counter-scale-down {
    from { transform: scale(1.2); }
    to { transform: scale(1); }
  }
  .counter-pulse-active {
    animation:
      counter-scale-up var(--Motion-Duration-S) var(--Motion-Easing-Transition-Moderate) forwards,
      counter-scale-down var(--Motion-Duration-M) var(--Motion-Easing-Transition-Moderate) var(--Motion-Duration-S) forwards;
  }
  .counter-width-wrap {
    display: inline-flex;
    interpolate-size: allow-keywords;
    width: auto;
    overflow: hidden;
    transition: width var(--Motion-Duration-L) var(--Motion-Easing-Transition-Moderate);
  }
  .counter-motion-subtle .counter-pulse-active {
    animation: none;
  }
  .counter-motion-subtle .counter-width-wrap {
    transition: none;
  }
`;

/** Read a --Motion-* CSS token value in ms from :root (only used for number change delay) */
function getMotionMs(token: string): number {
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  if (!raw) return 0;
  if (raw.endsWith('ms')) return parseFloat(raw);
  if (raw.endsWith('s')) return parseFloat(raw) * 1000;
  return parseFloat(raw) || 0;
}

function MotionDemo({
  appearance,
  size,
  value: initialValue,
  max,
  reducedMotion = false,
}: Pick<React.ComponentProps<typeof CounterBadge>, 'appearance' | 'size' | 'value' | 'max'> & {
  reducedMotion?: boolean;
}) {
  const [visible, setVisible] = React.useState(true);
  const [count, setCount] = React.useState(initialValue);
  const pulseRefs = React.useRef<(HTMLDivElement | null)[]>([]);
  const numberTimeout = React.useRef<number | null>(null);

  // Sync count when the control panel value changes
  const prevInitial = React.useRef(initialValue);
  if (prevInitial.current !== initialValue) {
    prevInitial.current = initialValue;
    setCount(initialValue);
  }

  React.useEffect(() => () => {
    if (numberTimeout.current) clearTimeout(numberTimeout.current);
  }, []);

  const handleIncrement = () => {
    if (numberTimeout.current) clearTimeout(numberTimeout.current);

    if (reducedMotion) {
      // Subtle: instant number change, no animation
      setCount((c) => c + 1);
      return;
    }

    // Restart CSS scale animation (remove → reflow → add)
    pulseRefs.current.forEach((el) => {
      if (!el) return;
      el.classList.remove('counter-pulse-active');
      void el.offsetWidth;
      el.classList.add('counter-pulse-active');
    });

    // Number change at Offset-L — CSS handles width transition via
    // interpolate-size: allow-keywords when content width changes
    const offsetL = getMotionMs('--Motion-Offset-L');
    numberTimeout.current = window.setTimeout(() => setCount((c) => c + 1), offsetL);

    // Clean up pulse class when animation ends (CSS event)
    pulseRefs.current[0]?.addEventListener('animationend', (e) => {
      if ((e as AnimationEvent).animationName === 'counter-scale-down') {
        pulseRefs.current.forEach((el) => el?.classList.remove('counter-pulse-active'));
      }
    }, { once: true });
  };

  const handleDecrement = () => {
    if (numberTimeout.current) clearTimeout(numberTimeout.current);
    setCount((c) => Math.max(0, c - 1));
  };

  const handleReset = () => {
    if (numberTimeout.current) clearTimeout(numberTimeout.current);
    pulseRefs.current.forEach((el) => el?.classList.remove('counter-pulse-active'));
    setCount(initialValue);
    setVisible(true);
  };

  // Entry/exit: CSS transitions
  // Subtle: opacity only, Subtle-M duration (135ms), Subtle easing.
  // Moderate: opacity + scale, L/M Moderate durations, Moderate easings.
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
    <>
      <style>{motionCSS}</style>
      <div className={`story-column${reducedMotion ? ' counter-motion-subtle' : ''}`} style={{ gap: 'var(--Spacing-5)', alignItems: 'center' }}>
        <div className="story-row" style={{ gap: 'var(--Spacing-3-5)', justifyContent: 'center' }}>
          <button onClick={() => setVisible(true)} style={motionControlStyle}>Entry</button>
          <button onClick={() => setVisible(false)} style={motionControlStyle}>Exit</button>
          <button onClick={handleIncrement} style={motionControlStyle}>Increment</button>
          <button onClick={handleDecrement} style={motionControlStyle}>Decrement</button>
          <button onClick={handleReset} style={motionControlStyle}>Reset</button>
        </div>

        <div className="story-row" style={{ gap: 'var(--Spacing-4-5)', alignItems: 'center', justifyContent: 'center' }}>
          {(['high', 'medium', 'low'] as const).map((attention, i) => (
            <div key={attention} style={columnStyle}>
              <span style={sectionLabelStyle}>{attention[0].toUpperCase() + attention.slice(1)}</span>
              <div style={entryExitStyle}>
                <div ref={(el) => { pulseRefs.current[i] = el; }}>
                  <div className="counter-width-wrap">
                    <CounterBadge value={count} max={max} attention={attention} appearance={appearance} size={size} aria-label={`${count} notifications`} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/** Control button style for Motion story */
const motionControlStyle: React.CSSProperties = {
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
        code: `/* Increment animation — CSS choreography */

/* Scale pulse: chained @keyframes via animation-delay */
@keyframes counter-scale-up {
  from { transform: scale(1); }
  to { transform: scale(1.2); }
}
@keyframes counter-scale-down {
  from { transform: scale(1.2); }
  to { transform: scale(1); }
}
.counter-pulse-active {
  animation:
    counter-scale-up var(--Motion-Duration-S) var(--Motion-Easing-Transition-Moderate) forwards,
    counter-scale-down var(--Motion-Duration-M) var(--Motion-Easing-Transition-Moderate) var(--Motion-Duration-S) forwards;
}

/* Width transition: auto-interpolates via interpolate-size */
.counter-width-wrap {
  display: inline-flex;
  interpolate-size: allow-keywords;
  width: auto;
  overflow: hidden;
  transition: width var(--Motion-Duration-L) var(--Motion-Easing-Transition-Moderate);
}

/* Entry: opacity + scale, L duration, Entrance easing */
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

/* Subtle motion (reduced motion) — no scale/position, opacity only */
.subtle .counter-pulse-active { animation: none; }
.subtle .counter-width-wrap { transition: none; }
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
    value: 5,
    max: 99,
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
  // @ts-expect-error — subtleMotion is a story-level arg not on CounterBadgeProps
  render: (args) => <MotionDemo appearance={args.appearance} size={args.size} value={args.value} max={args.max} reducedMotion={args.subtleMotion} />,
  play: async ({ canvasElement, args }) => {
    // @ts-expect-error — subtleMotion is a story-level arg
    if (!args.subtleMotion) return;

    const canvas = within(canvasElement);

    // Helper: check all elements inside the demo for scale/position violations
    const assertNoTransformMotion = (label: string) => {
      const allElements = canvasElement.querySelectorAll('*');
      allElements.forEach((el) => {
        const styles = getComputedStyle(el);

        // Check CSS animations for transform
        const animName = styles.animationName;
        if (animName && animName !== 'none') {
          // Any active @keyframes animation is a violation in subtle mode
          // (scale pulse should be animation: none)
          expect(animName, `[${label}] Element has active CSS animation "${animName}" — scale/position animations must be disabled in subtle motion`).toBe('none');
        }

        // Check CSS transitions for transform
        const transitionProp = styles.transitionProperty;
        if (transitionProp && transitionProp !== 'none') {
          const hasTransform = transitionProp.split(',').some(
            (p) => p.trim() === 'transform' || p.trim() === 'all',
          );
          expect(hasTransform, `[${label}] Element transitions "${transitionProp}" — transform transitions must be disabled in subtle motion`).toBe(false);
        }
      });
    };

    // Test Entry: click Entry then check
    const entryBtn = canvas.getByText('Entry');
    await userEvent.click(entryBtn);
    assertNoTransformMotion('Entry');

    // Test Exit: click Exit then check
    const exitBtn = canvas.getByText('Exit');
    await userEvent.click(exitBtn);
    assertNoTransformMotion('Exit');

    // Re-enter for increment test
    await userEvent.click(entryBtn);

    // Test Increment: click Increment then check
    const incBtn = canvas.getByText('Increment');
    await userEvent.click(incBtn);
    assertNoTransformMotion('Increment');

    // Test Decrement
    const decBtn = canvas.getByText('Decrement');
    await userEvent.click(decBtn);
    assertNoTransformMotion('Decrement');
  },
};

// 9. Themes — Light/dark with Surface wrapper
export const Themes: Story = {
  name: 'Themes',
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
        {bgModes.map(({ mode, label }) => (
          <div
            key={mode}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-4-5)' }}
          >
            <span style={{ ...sectionLabelStyle, width: 90 }}>{label}</span>
            <Surface mode={mode} style={cellStyle}>
              <CounterBadge value={5} attention="high" aria-label="5 notifications" />
              <CounterBadge value={5} attention="medium" aria-label="5 notifications" />
              <CounterBadge value={5} attention="low" aria-label="5 notifications" />
            </Surface>
          </div>
        ))}
      </div>
    );
  },
};
