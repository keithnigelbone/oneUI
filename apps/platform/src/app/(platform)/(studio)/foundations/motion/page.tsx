/**
 * foundations/motion/page.tsx
 *
 * Motion Foundation — Jio specification.
 *
 * - Jio (isSystem brand): read-only display of the 37 canonical token values.
 * - Other brands: editable base duration (L step) + easing curve inputs.
 *   All other steps are computed from the base via the fixed 1.5x scale ratio.
 *
 * Saves via api.foundations.upsertByType with type: 'motion'.
 */

'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import { Id } from '@oneui/convex/_generated/dataModel';
import {
  computeMotionScale,
  getDefaultMotionFoundationConfig,
  JIO_MOTION_BASE_DURATION,
  JIO_MOTION_EASINGS,
  JIO_INTERACTION_PATTERNS,
  JIO_TRANSITION_PATTERNS,
  MOTION_SCALE_RATIO,
  type MotionFoundationConfig,
  type MotionEasingType,
  type InteractionPatternConfig,
  type TransitionPatternConfig,
} from '@oneui/shared';
import { FoundationCard, SliderControl, CubicBezierEditor, ScaleVisualizer } from '@/design-tools/Foundations/shared';
import type { ScaleItem } from '@/design-tools/Foundations/shared';
import { Button } from '@oneui/ui/components/Button';
import { Checkbox } from '@oneui/ui/components/Checkbox';
import { Collapsible } from '@oneui/ui/components/Collapsible';
import { Tabs } from '@oneui/ui/components/Tabs';
import { parseCubicBezier } from '@oneui/shared';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { useAutoSave } from '@/hooks';
import styles from '../foundation.module.css';
import motionStyles from './motion.module.css';
import { ExportTokensButton } from '@/components/foundation/ExportTokensButton';

// ─── Easing type metadata ────────────────────────────────────────────────────

const EASING_TYPES: { key: MotionEasingType; label: string; rule: string }[] = [
  { key: 'entrance', label: 'Entrance', rule: 'Ease-out — decelerates into view. No ease-in.' },
  { key: 'exit', label: 'Exit', rule: 'Ease-in — accelerates out of view. No ease-out.' },
  { key: 'transition', label: 'Transition', rule: 'Ease-in-out — both start and end visible in viewport. Default for in-screen motion.' },
  { key: 'bounce', label: 'Bounce', rule: 'Overshoot — y1 > 1.0 for rubber-band / boundary effects.' },
];

const DURATION_STEPS = ['2XS', 'XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'] as const;
const OFFSET_STEPS = ['S', 'M', 'L', 'XL', '2XL', '3XL'] as const;

// ─── Per-type control point locking ──────────────────────────────────────────

function getLockedPoints(type: MotionEasingType): { p1?: boolean; p2?: boolean } {
  switch (type) {
    case 'entrance': return { p1: true };     // Ease-out only: lock P1
    case 'exit':     return { p2: true };     // Ease-in only: lock P2
    case 'transition': return {};              // Both editable
    case 'bounce':   return {};                // Both editable
  }
}

function getBounceWarning(type: MotionEasingType, level: 'moderate' | 'subtle', value: string): string | undefined {
  // Only moderate bounce needs overshoot — subtle is intentionally non-bouncing
  if (type !== 'bounce' || level !== 'moderate') return undefined;
  const pts = parseCubicBezier(value);
  if (!pts) return undefined;
  const [, y1, , y2] = pts;
  if (y1 >= 0 && y1 <= 1 && y2 >= 0 && y2 <= 1) {
    return 'Bounce curves should overshoot: y1 < 0 or y2 > 1.0';
  }
  return undefined;
}

// ─── Scale item builders ─────────────────────────────────────────────────────

function buildDurationItems(
  steps: readonly string[],
  values: Record<string, number>,
  highlightStep = 'L',
): ScaleItem[] {
  return steps.map(step => {
    const key = step.toLowerCase() as keyof typeof values;
    return {
      label: step,
      value: values[key],
      highlight: step === highlightStep,
      description: `${values[key]}ms`,
    };
  });
}

function buildOffsetItems(
  steps: readonly string[],
  values: Record<string, number>,
  prefix: string,
): ScaleItem[] {
  return steps.map(step => {
    const key = step.toLowerCase() as keyof typeof values;
    return {
      label: `--Motion-${prefix}${step}`,
      value: values[key],
      description: `${values[key]}ms`,
    };
  });
}

type MotionTokenRow = {
  name: string;
  value: string;
  numericValue?: number;
  highlight?: boolean;
  easingValue?: string;
};

function buildMotionTokenRows(
  scale: ReturnType<typeof computeMotionScale>,
  easings: MotionFoundationConfig['easings'],
): MotionTokenRow[] {
  return [
    ...DURATION_STEPS.map(step => {
      const key = step.toLowerCase() as keyof typeof scale.duration.moderate;
      return {
        name: `--Motion-Duration-${step}`,
        value: `${scale.duration.moderate[key]}ms`,
        numericValue: scale.duration.moderate[key],
        highlight: step === 'L',
      };
    }),
    ...DURATION_STEPS.map(step => {
      const key = step.toLowerCase() as keyof typeof scale.duration.subtle;
      return {
        name: `--Motion-Duration-Subtle-${step}`,
        value: `${scale.duration.subtle[key]}ms`,
        numericValue: scale.duration.subtle[key],
        highlight: step === 'L',
      };
    }),
    ...OFFSET_STEPS.map(step => {
      const key = step.toLowerCase() as keyof typeof scale.offset.moderate;
      return {
        name: `--Motion-Offset-${step}`,
        value: `${scale.offset.moderate[key]}ms`,
        numericValue: scale.offset.moderate[key],
      };
    }),
    ...OFFSET_STEPS.map(step => {
      const key = step.toLowerCase() as keyof typeof scale.offset.subtle;
      return {
        name: `--Motion-Offset-Subtle-${step}`,
        value: `${scale.offset.subtle[key]}ms`,
        numericValue: scale.offset.subtle[key],
      };
    }),
    ...EASING_TYPES.flatMap(({ key, label }) => [
      {
        name: `--Motion-Easing-${label}-Moderate`,
        value: easings[key]?.moderate ?? '',
        easingValue: easings[key]?.moderate ?? '',
      },
      {
        name: `--Motion-Easing-${label}-Subtle`,
        value: easings[key]?.subtle ?? '',
        easingValue: easings[key]?.subtle ?? '',
      },
    ]),
    { name: '--Motion-Easing-Linear', value: 'linear', easingValue: 'linear' },
  ];
}

function getMotionCurvePath(value: string): string {
  const points = value === 'linear' ? [0, 0, 1, 1] : parseCubicBezier(value);
  if (!points) return 'M 0 28 L 120 28';
  const [x1, y1, x2, y2] = points;
  const scaleY = (y: number) => 28 - y * 24;
  return `M 0 28 C ${x1 * 120} ${scaleY(y1)}, ${x2 * 120} ${scaleY(y2)}, 120 4`;
}

function MotionTokenGraph({ token, maxValue }: { token: MotionTokenRow; maxValue: number }) {
  if (token.numericValue !== undefined) {
    const ratio = Math.max(4, Math.round((token.numericValue / maxValue) * 100));
    return (
      <span className={motionStyles.tokenGraphTrack} aria-hidden="true">
        <span
          className={motionStyles.tokenGraphBar}
          style={{ '--motion-token-ratio': `${ratio}%` } as React.CSSProperties}
        />
      </span>
    );
  }

  return (
    <svg className={motionStyles.tokenCurve} viewBox="0 0 120 32" aria-hidden="true">
      <path className={motionStyles.tokenCurveGrid} d="M 0 28 L 120 4" />
      <path className={motionStyles.tokenCurvePath} d={getMotionCurvePath(token.easingValue ?? token.value)} />
    </svg>
  );
}


// ─── Interaction Pattern Demos ────────────────────────────────────────────────

const SCALE_VARIANTS = [
  { label: 'XS', pct: 7, desc: 'Extra small components' },
  { label: 'S / M / L / XL', pct: 3, desc: 'Default — small through extra large' },
  { label: 'Full-width', pct: 1, desc: 'Full-width buttons, cards, chat bubbles' },
] as const;

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--Spacing-2-5) 0', borderBottom: '1px solid var(--Border-Subtle)' }}>
      <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Medium)' }}>{label}</span>
      <code style={{ fontSize: 'var(--Typography-Size-XS)', fontFamily: 'var(--Typography-Font-Mono)', color: 'var(--Text-High)' }}>{value}</code>
    </div>
  );
}

function PatternScaleDemo({ title, direction, durationMs, easingValue }: {
  title: string; direction: 'down' | 'up'; durationMs: number; easingValue: string;
}) {
  // No wrapper scale — Button.module.css handles tap scale via CSS :active.
  // XS (data-size="6"): 7%, S/M/L (8/10/12): 3%, Full-width: 1%.
  return (
    <div>
      <span style={{ fontSize: 'var(--Typography-Size-XS)', fontWeight: 'var(--Typography-Weight-Semibold)', color: 'var(--Text-High)', display: 'block', marginBottom: 'var(--Spacing-3-5)' }}>{title}</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
        {/* Spec table */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <SpecRow label="Duration (down)" value={`M (${durationMs}ms)`} />
          <SpecRow label="Duration (up)" value={`M (${durationMs}ms)`} />
          <SpecRow label="Easing" value="Transition Moderate" />
          <SpecRow label="Interruptible" value="Yes — release triggers touch-up" />
          <div style={{ marginTop: 'var(--Spacing-3-5)' }}>
            {SCALE_VARIANTS.map(v => (
              <div key={v.label} style={{ display: 'flex', justifyContent: 'space-between', padding: 'var(--Spacing-2) 0' }}>
                <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Medium)' }}>{v.label}</span>
                <span style={{ fontSize: 'var(--Typography-Size-XS)', fontFamily: 'var(--Typography-Font-Mono)', color: 'var(--Text-High)' }}>{v.pct}%</span>
              </div>
            ))}
          </div>
        </div>
        {/* Interactive demo — Button CSS handles scale via :active */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: 'var(--Spacing-4)' }}>
          {SCALE_VARIANTS.map(v => {
            const size = v.pct === 7 ? 'xs' : 'm';
            return (
              <div
                key={v.label}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 'var(--Spacing-3-5)', padding: 'var(--Spacing-4-5)',
                  backgroundColor: 'transparent', borderRadius: 'var(--Shape-4)',
                }}
              >
                <Button attention="high" size={size} fullWidth={v.pct === 1}>{v.label}</Button>
                <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)' }}>{v.pct}%</span>
              </div>
            );
          })}
        </div>
        <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)', textAlign: 'center' }}>
          Press any button to preview
        </span>
      </div>
    </div>
  );
}

function ScaleUpIconDemo({ durationMs, easingValue }: { durationMs: number; easingValue: string }) {
  const [pressed, setPressed] = useState(false);
  const scalePct = 7;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--Spacing-4-5)', padding: 'var(--Spacing-4-5)', backgroundColor: 'transparent', borderRadius: 'var(--Shape-4)' }}>
      <div
        style={{
          transform: pressed ? `scale(${1 + scalePct / 100})` : 'scale(1)',
          transition: `transform ${durationMs}ms ${easingValue}`,
        }}
        onPointerDown={() => setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
      >
        <Checkbox checked size="l" onCheckedChange={() => {}} aria-label="Motion preview checkbox" />
      </div>
      <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)' }}>
        {pressed ? `Scale up ${scalePct}%` : 'Press to preview'}
      </span>
    </div>
  );
}

function HoverScaleDemo({ durationLMs, durationXlMs, easingValue }: {
  durationLMs: number; durationXlMs: number; easingValue: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div>
      <span style={{ fontSize: 'var(--Typography-Size-XS)', fontWeight: 'var(--Typography-Weight-Semibold)', color: 'var(--Text-High)', display: 'block', marginBottom: 'var(--Spacing-3-5)' }}>Scale Up</span>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <SpecRow label="Behaviour" value="Up one size in scale chart" />
          <SpecRow label="Duration (small)" value={`L (${durationLMs}ms)`} />
          <SpecRow label="Duration (large)" value={`XL (${durationXlMs}ms)`} />
          <SpecRow label="Easing" value="Transition Moderate" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--Spacing-4)', padding: 'var(--Spacing-4-5)', backgroundColor: 'transparent', borderRadius: 'var(--Shape-4)' }}>
          {[{ label: 'Small Card', w: '80px', h: '100px', dur: durationLMs }, { label: 'Large Card', w: '140px', h: '100px', dur: durationXlMs }].map(card => (
            <div
              key={card.label}
              style={{
                width: card.w, height: card.h,
                backgroundColor: 'var(--Primary-Bold)', borderRadius: 'var(--Shape-4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transform: hovered === card.label ? 'scale(1.05)' : 'scale(1)',
                transition: `transform ${card.dur}ms ${easingValue}`,
              }}
              onMouseEnter={() => setHovered(card.label)}
              onMouseLeave={() => setHovered(null)}
            >
              <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Primary-Bold-High)' }}>{card.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


function LongPressDemo({ durationMMs, durationXlMs, easingValue }: {
  durationMMs: number; durationXlMs: number; easingValue: string;
}) {
  const [phase, setPhase] = useState<'idle' | 'surface' | 'scaled'>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleDown = useCallback(() => {
    setPhase('surface');
    timerRef.current = setTimeout(() => setPhase('scaled'), durationXlMs);
  }, [durationXlMs]);

  const handleUp = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase('idle');
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--Spacing-3)' }}>
      <div
        style={{
          transform: phase === 'scaled' ? 'scale(0.97)' : 'scale(1)',
          transition: `transform ${durationMMs}ms ${easingValue}`,
        }}
        onPointerDown={handleDown}
        onPointerUp={handleUp}
        onPointerLeave={handleUp}
      >
        <Button attention="high" size="m">Hold me</Button>
      </div>
      <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)' }}>
        {phase === 'idle' && 'Press & hold'}
        {phase === 'surface' && 'Surface changed — waiting...'}
        {phase === 'scaled' && 'Scaled down'}
      </span>
    </div>
  );
}

function DisableDemo({ durationMMs, easingValue }: { durationMMs: number; easingValue: string }) {
  const [disabled, setDisabled] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <SpecRow label="Property" value="opacity → 30%" />
        <SpecRow label="Duration" value={`M (${durationMMs}ms)`} />
        <SpecRow label="Easing" value="Transition Moderate" />
        <SpecRow label="Maps to" value="Component disable state" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--Spacing-4)', padding: 'var(--Spacing-4-5)', backgroundColor: 'transparent', borderRadius: 'var(--Shape-4)' }}>
        <div style={{ opacity: disabled ? 0.3 : 1, transition: `opacity ${durationMMs}ms ${easingValue}`, pointerEvents: disabled ? 'none' : 'auto' }}>
          <Button attention="high">Button</Button>
        </div>
        <Button attention="low" size="s" onPress={() => setDisabled(d => !d)}>
          {disabled ? 'Enable' : 'Disable'}
        </Button>
      </div>
    </div>
  );
}

function FocusDemo({ durationLMs, easingValue }: { durationLMs: number; easingValue: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <SpecRow label="Stroke" value="0 → 2px" />
        <SpecRow label="Scale" value="+2px to focus state" />
        <SpecRow label="Duration" value={`L (${durationLMs}ms)`} />
        <SpecRow label="Easing" value="Transition Moderate" />
        <SpecRow label="Maps to" value="Component focus variable" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--Spacing-4)', padding: 'var(--Spacing-4-5)', backgroundColor: 'transparent', borderRadius: 'var(--Shape-4)' }}>
        <div style={{ boxShadow: focused ? '0 0 0 2px var(--Surface-Main), 0 0 0 4px var(--Text-High)' : '0 0 0 0px var(--Surface-Main), 0 0 0 0px var(--Text-High)', transform: focused ? 'scale(1.02)' : 'scale(1)', borderRadius: 'var(--Shape-Pill)', transition: `box-shadow ${durationLMs}ms ${easingValue}, transform ${durationLMs}ms ${easingValue}` }}>
          <Button attention="high">Button</Button>
        </div>
        <Button attention="low" size="s" onPress={() => setFocused(f => !f)}>
          {focused ? 'Remove focus' : 'Show focus'}
        </Button>
      </div>
    </div>
  );
}

// ─── Wireframe screen mockup ─────────────────────────────────────────────────

function WireframeScreen({ label, accent = false }: { label: string; accent?: boolean }) {
  const bg = accent ? 'var(--Primary-Subtle)' : 'var(--Surface-Main)';
  const bar = accent ? 'var(--Primary-Bold)' : 'var(--Border-Subtle)';
  return (
    <div style={{ position: 'absolute', inset: 0, backgroundColor: bg, display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)', padding: 'var(--Spacing-3-5)' }}>
      <div style={{ height: 6, width: '40%', backgroundColor: bar, borderRadius: 3 }} />
      <div style={{ height: 4, width: '70%', backgroundColor: 'var(--Border-Subtle)', borderRadius: 2 }} />
      <div style={{ height: 4, width: '55%', backgroundColor: 'var(--Border-Subtle)', borderRadius: 2 }} />
      <div style={{ height: 4, width: '60%', backgroundColor: 'var(--Border-Subtle)', borderRadius: 2 }} />
      <div style={{ marginTop: 'auto', fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)', textAlign: 'center' }}>{label}</div>
    </div>
  );
}

function TransitionViewport({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{ position: 'relative', width: 160, height: 280, overflow: 'hidden', borderRadius: 'var(--Shape-4-5)', border: '1px solid var(--Border-Subtle)', cursor: 'pointer', userSelect: 'none', flexShrink: 0 }}
    >
      {children}
    </div>
  );
}

// ─── Transition pattern demos ────────────────────────────────────────────────

// Transition patterns are now read from config (stored in Convex per brand)

function TransformDemo({ durationMs, easingValue, exitDurationMs, exitEasingValue }: {
  durationMs: number; easingValue: string; exitDurationMs?: number; exitEasingValue?: string;
}) {
  const [active, setActive] = useState(false);
  const toggle = () => setActive(a => !a);
  const enterT = `${durationMs}ms ${easingValue}`;
  const exitMs = exitDurationMs ?? durationMs;
  const exitEase = exitEasingValue ?? easingValue;
  const exitT = `${exitMs}ms ${exitEase}`;

  // Viewport: 160×280. Card absolutely positioned at top:190 left:30 width:100 height:60.
  // clip-path inset(top right bottom left) from viewport edges:
  // top = 190, right = 160-30-100 = 30, bottom = 280-190-60 = 30, left = 30
  const cardClip = 'inset(190px 30px 30px 30px round 8px)';
  const modalClip = 'inset(8px 8px 8px 8px round 12px)';

  return (
    <TransitionViewport onClick={toggle}>
      {/* Background page — all elements absolutely positioned for exact coordinates */}
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'var(--Surface-Main)' }}>
        <div style={{ position: 'absolute', top: 10, left: 10, height: 5, width: '50%', backgroundColor: 'var(--Border-Subtle)', borderRadius: 2 }} />
        <div style={{ position: 'absolute', top: 19, left: 10, height: 4, width: '70%', backgroundColor: 'var(--Border-Subtle)', borderRadius: 2 }} />
        {/* Source card at exact known position */}
        <div style={{
          position: 'absolute', top: 190, left: 30, width: 100, height: 60,
          backgroundColor: 'var(--Primary-Subtle)', borderRadius: 8,
          border: '1px solid var(--Primary-Tinted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          opacity: active ? 0 : 1,
          transition: active ? 'opacity 0ms' : `opacity ${exitT}`,
        }}>
          <div style={{ fontSize: 8, color: 'var(--Primary-Tinted)' }}>Card</div>
        </div>
        <div style={{ position: 'absolute', top: 258, left: 10, height: 4, width: '60%', backgroundColor: 'var(--Border-Subtle)', borderRadius: 2 }} />
      </div>
      {/* Scrim + blur */}
      <div style={{
        position: 'absolute', inset: 0, backgroundColor: 'var(--Scrim)',
        opacity: active ? 1 : 0,
        backdropFilter: active ? 'blur(4px)' : 'blur(0px)',
        WebkitBackdropFilter: active ? 'blur(4px)' : 'blur(0px)',
        transition: active
          ? `opacity ${enterT}, backdrop-filter ${enterT}, -webkit-backdrop-filter ${enterT}`
          : `opacity ${exitT}, backdrop-filter ${exitT}, -webkit-backdrop-filter ${exitT}`,
        pointerEvents: 'none',
      }} />
      {/* Modal — always full size, clip-path morphs between card shape and modal shape */}
      <div style={{
        position: 'absolute', inset: 0,
        clipPath: active ? modalClip : cardClip,
        opacity: active ? 1 : 0,
        transform: active ? 'scale(1)' : 'scale(0.9)',
        transformOrigin: 'center center',
        transition: active
          ? `clip-path ${enterT}, opacity 0ms`
          : `opacity ${exitT}, transform ${exitT}, clip-path 0ms ${exitMs}ms`,
      }}>
        <div style={{
          position: 'absolute', inset: 8,
          borderRadius: 12,
          backgroundColor: 'var(--Primary-Subtle)',
          border: '1px solid var(--Primary-Tinted)',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column', gap: 4, padding: 8,
        }}>
          {/* Modal content — fades in after clip expands */}
          <div style={{
            opacity: active ? 1 : 0,
            transition: `opacity ${durationMs * 0.4}ms ${easingValue}`,
            transitionDelay: active ? `${durationMs * 0.3}ms` : '0ms',
            display: 'flex', flexDirection: 'column', gap: 4,
          }}>
            <div style={{ height: 5, width: '40%', backgroundColor: 'var(--Primary-Tinted)', borderRadius: 2, opacity: 0.5 }} />
            <div style={{ height: 4, width: '70%', backgroundColor: 'var(--Primary-Tinted)', borderRadius: 2, opacity: 0.3 }} />
            <div style={{ height: 4, width: '55%', backgroundColor: 'var(--Primary-Tinted)', borderRadius: 2, opacity: 0.3 }} />
            <div style={{ height: 4, width: '60%', backgroundColor: 'var(--Primary-Tinted)', borderRadius: 2, opacity: 0.3 }} />
          </div>
        </div>
      </div>
    </TransitionViewport>
  );
}

function TransitionDemo({ pattern, durationMs, easingValue, exitDurationMs, exitEasingValue, staggerMs, lateralParams, xlDurationMs, transitionEasingValue }: {
  pattern: TransitionPatternConfig;
  durationMs: number;
  easingValue: string;
  exitDurationMs?: number;
  exitEasingValue?: string;
  staggerMs?: number;
  lateralParams?: { fadeOutMs: number; fadeInMs: number; offsetMs: number };
  xlDurationMs?: number;
  transitionEasingValue?: string;
}) {
  const [active, setActive] = useState(false);
  const toggle = () => setActive(a => !a);

  const t = `${durationMs}ms ${easingValue}`;

  switch (pattern.direction) {
    case 'stack': { // Stack — slide from right with scrim
      const enterT = `${durationMs}ms ${easingValue}`;
      const exitT = `${exitDurationMs ?? durationMs}ms ${exitEasingValue ?? easingValue}`;
      const currentT = active ? enterT : exitT;
      return (
        <TransitionViewport onClick={toggle}>
          <WireframeScreen label="Page A" />
          {/* Scrim over Page A */}
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'var(--Scrim)', opacity: active ? 1 : 0, transition: `opacity ${currentT}`, pointerEvents: 'none' }} />
          {/* Page B slides from right */}
          <div style={{ position: 'absolute', inset: 0, transform: active ? 'translateX(0)' : 'translateX(100%)', transition: `transform ${currentT}` }}>
            <WireframeScreen label="Page B" accent />
          </div>
        </TransitionViewport>
      );
    }

    case 'X': // Forward — A slides left 30% + scrim, B slides in fully
      return (
        <TransitionViewport onClick={toggle}>
          <div style={{ position: 'absolute', inset: 0, transform: active ? 'translateX(-30%)' : 'translateX(0)', transition: `transform ${t}` }}>
            <WireframeScreen label="Page A" />
          </div>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'var(--Scrim)', opacity: active ? 1 : 0, transition: `opacity ${t}`, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, transform: active ? 'translateX(0)' : 'translateX(100%)', transition: `transform ${t}` }}>
            <WireframeScreen label="Page B" accent />
          </div>
        </TransitionViewport>
      );

    case 'toplevel': { // Top Level — A fades out, offset, B fades in
      const offsetMs = staggerMs ?? 200;
      return (
        <TransitionViewport onClick={toggle}>
          <div style={{ position: 'absolute', inset: 0, opacity: active ? 0 : 1, transition: `opacity ${t}`, transitionDelay: active ? '0ms' : `${offsetMs}ms` }}>
            <WireframeScreen label="Page A" />
          </div>
          <div style={{ position: 'absolute', inset: 0, opacity: active ? 1 : 0, transition: `opacity ${t}`, transitionDelay: active ? `${offsetMs}ms` : '0ms' }}>
            <WireframeScreen label="Page B" accent />
          </div>
        </TransitionViewport>
      );
    }

    case 'X-sequential': { // Lateral — tab choreography: slide + staggered fade
      const slideT = `${durationMs}ms ${easingValue}`; // XL, Transition
      const fadeOutMs = lateralParams?.fadeOutMs ?? 100;
      const fadeInMs = lateralParams?.fadeInMs ?? 200;
      const offsetMs = lateralParams?.offsetMs ?? 200;
      const tabStyle = (isActive: boolean): React.CSSProperties => ({
        flex: 1, textAlign: 'center', fontSize: 10, paddingBottom: 6,
        color: isActive ? 'var(--Primary-Bold)' : 'var(--Text-Low)',
        fontWeight: isActive ? 600 : 400,
        cursor: 'pointer',
        transition: `color ${slideT}`,
      });
      const cardStyle: React.CSSProperties = {
        backgroundColor: 'var(--Surface-Main)', borderRadius: 6, border: '1px solid var(--Border-Subtle)',
        padding: 8, display: 'flex', flexDirection: 'column', gap: 4,
      };
      return (
        <TransitionViewport onClick={toggle}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--Surface-Minimal)', padding: 'var(--Spacing-3)' }}>
            {/* Tab header with sliding underline */}
            <div style={{ position: 'relative', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--Border-Subtle)' }}>
                <div style={tabStyle(!active)}>Tab 1</div>
                <div style={tabStyle(active)}>Tab 2</div>
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: active ? '50%' : '0', width: '50%', height: 2, backgroundColor: 'var(--Primary-Bold)', transition: `left ${slideT}` }} />
            </div>
            {/* Tab content — choreographed slide + fade */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', borderRadius: 6 }}>
              {/* Tab 1 card: slides left 30% (XL, no delay), fades out (S, no delay) */}
              <div style={{
                position: 'absolute', inset: 0,
                transform: active ? 'translateX(-30%)' : 'translateX(0)',
                transition: `transform ${slideT}`,
              }}>
                <div style={{ ...cardStyle, opacity: active ? 0 : 1, transition: `opacity ${fadeOutMs}ms ${easingValue}`, transitionDelay: active ? '0ms' : `${offsetMs}ms` }}>
                  <div style={{ height: 5, width: '60%', backgroundColor: 'var(--Border-Subtle)', borderRadius: 2 }} />
                  <div style={{ height: 4, width: '80%', backgroundColor: 'var(--Border-Subtle)', borderRadius: 2 }} />
                  <div style={{ height: 4, width: '50%', backgroundColor: 'var(--Border-Subtle)', borderRadius: 2 }} />
                </div>
              </div>
              {/* Tab 2 card: slides from right 30% (XL, no delay), fades in (M, after L offset) */}
              <div style={{
                position: 'absolute', inset: 0,
                transform: active ? 'translateX(0)' : 'translateX(30%)',
                transition: `transform ${slideT}`,
              }}>
                <div style={{ opacity: active ? 1 : 0, transition: `opacity ${fadeInMs}ms ${easingValue}`, transitionDelay: active ? `${offsetMs}ms` : '0ms' }}>
                  <div style={{ ...cardStyle, backgroundColor: 'var(--Primary-Subtle)' }}>
                    <div style={{ height: 5, width: '50%', backgroundColor: 'var(--Primary-Tinted)', borderRadius: 2, opacity: 0.4 }} />
                    <div style={{ height: 4, width: '70%', backgroundColor: 'var(--Primary-Tinted)', borderRadius: 2, opacity: 0.3 }} />
                    <div style={{ height: 4, width: '45%', backgroundColor: 'var(--Primary-Tinted)', borderRadius: 2, opacity: 0.3 }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TransitionViewport>
      );
    }

    case 'stagger': { // Skeleton — pulsing wireframe: 2200→2400→2200 per item with L offset stagger
      // Neutral 2100 ≈ oklch(94% 0 0), Neutral 2400 ≈ oklch(88% 0 0)
      const n2100 = 'oklch(94% 0 0)';
      const n2400 = 'oklch(88% 0 0)';
      // 3XL duration for full pulse cycle, L offset between items
      const threeXl = xlDurationMs ? xlDurationMs * 1.5 : durationMs * 3.375; // 3XL = XL × 1.5
      const lOffset = staggerMs ?? 80;
      const transEasing = transitionEasingValue ?? easingValue;
      // Total animation = 3XL forward + 3XL back = 2×3XL
      const totalMs = threeXl * 2;
      let idx = 0;
      const pulse = (h: number, w: string, r: number) => {
        const i = idx++;
        const delayMs = i * lOffset;
        return (
          <div key={i} style={{
            height: h, width: w, borderRadius: r, backgroundColor: n2100,
            animation: `skelPulse ${totalMs}ms ${transEasing} ${delayMs}ms infinite`,
          }} />
        );
      };
      return (
        <TransitionViewport onClick={toggle}>
          {/* Keyframe for skeleton pulse */}
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes skelPulse {
              0%, 100% { background-color: ${n2100}; }
              50% { background-color: ${n2400}; }
            }
          `}} />
          <div style={{ position: 'absolute', inset: 0, backgroundColor: 'var(--Surface-Main)', display: 'flex', flexDirection: 'column', gap: 0, padding: 0, overflow: 'hidden' }}>
            {/* Top bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px' }}>
              {pulse(12, '12px', 6)}
              <div style={{ display: 'flex', gap: 4 }}>
                {pulse(8, '8px', 4)}
                {pulse(10, '10px', 5)}
              </div>
            </div>
            {/* Headline + subtitle */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '6px 10px' }}>
              {pulse(7, '55%', 3)}
              {pulse(4, '40%', 2)}
              {pulse(4, '45%', 2)}
            </div>
            {/* Large image card */}
            <div style={{ padding: '4px 10px' }}>{pulse(70, '100%', 6)}</div>
            {/* Circle row */}
            <div style={{ display: 'flex', gap: 4, padding: '6px 10px' }}>
              {pulse(14, '14px', 7)}
              {pulse(14, '14px', 7)}
              {pulse(14, '14px', 7)}
              {pulse(14, '14px', 7)}
              {pulse(14, '14px', 7)}
              {pulse(14, '14px', 7)}
            </div>
            {/* Second large card */}
            <div style={{ padding: '4px 10px' }}>{pulse(65, '100%', 6)}</div>
            {/* Bottom text + buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, padding: '6px 10px' }}>
              {pulse(5, '50%', 2)}
            </div>
            <div style={{ display: 'flex', gap: 4, padding: '2px 10px' }}>
              {pulse(16, '48%', 4)}
              {pulse(16, '48%', 4)}
            </div>
          </div>
        </TransitionViewport>
      );
    }

    case 'scale':
      return <TransformDemo durationMs={durationMs} easingValue={easingValue} exitDurationMs={exitDurationMs} exitEasingValue={exitEasingValue} />;
  }
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function MotionFoundationPage() {
  const { currentBrand } = usePlatformContext();
  const brandId = currentBrand?.id as Id<'brands'> | undefined;
  const isSystemBrand = !!(currentBrand as any)?.isSystem;

  const existingFoundation = useQuery(
    api.foundations.getByType,
    brandId ? { brandId, type: 'motion' as const } : 'skip'
  );

  const [config, setConfig] = useState<MotionFoundationConfig>(getDefaultMotionFoundationConfig());
  const [hasInitialized, setHasInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState<'scales' | 'easings' | 'patterns' | 'tokens'>('scales');
  const prevBrandIdRef = useRef(brandId);

  const { isSaving } = useAutoSave({
    config,
    brandId,
    type: 'motion',
    enabled: hasInitialized && !isSystemBrand,
  });

  useEffect(() => {
    if (prevBrandIdRef.current !== brandId) {
      prevBrandIdRef.current = brandId;
      setHasInitialized(false);
      return;
    }
    if (existingFoundation?.config && !hasInitialized) {
      const saved = existingFoundation.config as MotionFoundationConfig;
      // Backfill patterns for configs saved before patterns were added
      setConfig({
        ...saved,
        interactionPatterns: saved.interactionPatterns ?? JIO_INTERACTION_PATTERNS.map(p => ({ ...p, subPatterns: p.subPatterns.map(s => ({ ...s })) })),
        transitionPatterns: saved.transitionPatterns ?? JIO_TRANSITION_PATTERNS.map(p => ({ ...p })),
      });
      setHasInitialized(true);
    } else if (existingFoundation === null && !hasInitialized) {
      setHasInitialized(true);
    }
  }, [existingFoundation, hasInitialized, brandId]);

  const handleBaseDurationChange = useCallback((value: number) => {
    setConfig(prev => ({ ...prev, baseDuration: value }));
  }, []);

  const handleEasingChange = useCallback((type: MotionEasingType, level: 'moderate' | 'subtle', value: string) => {
    setConfig(prev => ({
      ...prev,
      easings: {
        ...prev.easings,
        [type]: { ...prev.easings[type], [level]: value },
      },
    }));
  }, []);

  const isLoading = brandId !== undefined && existingFoundation === undefined;
  const scale = computeMotionScale(config.baseDuration, config.easings);
  const isJioDefault = config.baseDuration === JIO_MOTION_BASE_DURATION;
  const motionTokens = buildMotionTokenRows(scale, config.easings);
  const timingMotionTokens = motionTokens.filter(token => token.numericValue !== undefined);
  const easingMotionTokens = motionTokens.filter(token => token.numericValue === undefined);
  const maxTimingTokenValue = Math.max(...timingMotionTokens.map(token => token.numericValue ?? 0), 1);

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Motion Foundation</h1>
          <p className={styles.description}>Loading motion configuration...</p>
        </div>
        <div className={styles.content}>
          <div className={styles.loadingSkeleton} style={{ height: '200px', borderRadius: 'var(--Shape-4)', backgroundColor: 'transparent' }} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Motion Foundation</h1>
        <p className={styles.description}>
          {isSystemBrand
            ? 'Canonical Jio motion values. All other brands derive from this system.'
            : `Customise motion timing for ${currentBrand?.name ?? 'this brand'}. One base duration drives the full scale.`}
          {isSystemBrand && (
            <span style={{ marginLeft: 'var(--Spacing-3-5)', padding: '2px 8px', backgroundColor: 'transparent', borderRadius: 'var(--Shape-Pill)', fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Medium)' }}>
              Read-only
            </span>
          )}
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.foundationTabsRow}>
          <Tabs.Root
            value={activeTab}
            onValueChange={(value) => setActiveTab((value as 'scales' | 'easings' | 'patterns' | 'tokens') ?? 'scales')}
          >
            <Tabs.List className={styles.foundationTabsList}>
              <Tabs.Item value="scales">Scales</Tabs.Item>
              <Tabs.Item value="easings">Easings</Tabs.Item>
              <Tabs.Item value="patterns">Patterns</Tabs.Item>
              <Tabs.Item value="tokens">Tokens</Tabs.Item>
              <Tabs.Indicator />
            </Tabs.List>
          </Tabs.Root>
        </div>

        <div className={styles.tabPanelStack}>

        {/* ── Base Duration (editable for non-system brands) ── */}
        {activeTab === 'scales' && !isSystemBrand && (
          <FoundationCard
            title="Base Duration"
            description={`The Moderate L step (default: ${JIO_MOTION_BASE_DURATION}ms for Jio). All other duration and offset steps are computed using a fixed ${MOTION_SCALE_RATIO}× ratio.`}
            collapsible
            actions={
              <Button attention="medium" size="s" onPress={() => handleBaseDurationChange(JIO_MOTION_BASE_DURATION)}>
                Reset
              </Button>
            }
          >
            <SliderControl
              label="Base Duration (L)"
              value={config.baseDuration}
              min={150}
              max={600}
              step={10}
              unit="ms"
              onChange={handleBaseDurationChange}
            />
          </FoundationCard>
        )}

        {/* ── Duration Scale ── */}
        {activeTab === 'scales' && (
        <>
        <FoundationCard
          title="Duration Scale"
          description={`8 steps computed from the base. Moderate is standard motion; Subtle uses Moderate M (${scale.duration.moderate.m}ms) as its reduced-motion base.`}
          collapsible
        >
          <div className={motionStyles.scaleCompare}>
            <div className={motionStyles.scaleColumn}>
              <div className={motionStyles.scaleColumnHeader}>Moderate</div>
              <div className={motionStyles.scaleColumnBody}>
                <ScaleVisualizer
                  items={buildDurationItems(DURATION_STEPS, scale.duration.moderate)}
                  maxValue={1200}
                  type="generic"
                />
              </div>
            </div>
            <div className={motionStyles.scaleColumn}>
              <div className={motionStyles.scaleColumnHeader}>Subtle</div>
              <div className={motionStyles.scaleColumnBody}>
                <ScaleVisualizer
                  items={buildDurationItems(DURATION_STEPS, scale.duration.subtle)}
                  maxValue={1200}
                  type="generic"
                />
              </div>
            </div>
          </div>
        </FoundationCard>

        {/* ── Offset / Stagger Delays ── */}
        <FoundationCard
          title="Offset Scale — Stagger Delays"
          description="Used to sequence choreographed multi-element animations. Moderate and Subtle variants."
          collapsible
        >
          <div className={motionStyles.scaleCompare}>
            <div className={motionStyles.scaleColumn}>
              <div className={motionStyles.scaleColumnHeader}>Moderate</div>
              <div className={motionStyles.scaleColumnBody}>
                <ScaleVisualizer
                  items={buildOffsetItems(OFFSET_STEPS, scale.offset.moderate, 'Offset-')}
                  maxValue={Math.max(...OFFSET_STEPS.map(s => scale.offset.moderate[s.toLowerCase() as keyof typeof scale.offset.moderate]))}
                  type="generic"
                />
              </div>
            </div>
            <div className={motionStyles.scaleColumn}>
              <div className={motionStyles.scaleColumnHeader}>Subtle</div>
              <div className={motionStyles.scaleColumnBody}>
                <ScaleVisualizer
                  items={buildOffsetItems(OFFSET_STEPS, scale.offset.subtle, 'Offset-Subtle-')}
                  maxValue={Math.max(...OFFSET_STEPS.map(s => scale.offset.subtle[s.toLowerCase() as keyof typeof scale.offset.subtle]))}
                  type="generic"
                />
              </div>
            </div>
          </div>
        </FoundationCard>
        </>
        )}

        {/* ── Easing Curves ── */}
        {activeTab === 'easings' && (
        <FoundationCard
          title="Easing Curves"
          description="One curve type per interaction context. Drag control points to adjust. Click the track to preview."
          collapsible
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-7)' }}>
            {/* Moderate row */}
            <div>
              <span style={{ fontSize: 'var(--Typography-Size-S)', fontWeight: 'var(--Typography-Weight-Semibold)', color: 'var(--Text-High)', display: 'block', marginBottom: 'var(--Spacing-3-5)' }}>Moderate</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--Spacing-4)' }}>
                {EASING_TYPES.map(({ key, label }) => (
                  <CubicBezierEditor
                    key={`mod-${key}`}
                    value={config.easings[key]?.moderate ?? ''}
                    onChange={(v) => handleEasingChange(key, 'moderate', v)}
                    readOnly={isSystemBrand}
                    lockedPoints={getLockedPoints(key)}
                    typeLabel={label}
                    warning={getBounceWarning(key, 'moderate', config.easings[key]?.moderate ?? '')}
                    onReset={!isSystemBrand ? () => handleEasingChange(key, 'moderate', JIO_MOTION_EASINGS[key].moderate) : undefined}
                  />
                ))}
              </div>
            </div>

            {/* Subtle row */}
            <div>
              <span style={{ fontSize: 'var(--Typography-Size-S)', fontWeight: 'var(--Typography-Weight-Semibold)', color: 'var(--Text-High)', display: 'block', marginBottom: 'var(--Spacing-3-5)' }}>Subtle</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--Spacing-4)' }}>
                {EASING_TYPES.map(({ key, label }) => (
                  <CubicBezierEditor
                    key={`sub-${key}`}
                    value={config.easings[key]?.subtle ?? ''}
                    onChange={(v) => handleEasingChange(key, 'subtle', v)}
                    readOnly={isSystemBrand}
                    lockedPoints={getLockedPoints(key)}
                    typeLabel={label}
                    warning={getBounceWarning(key, 'subtle', config.easings[key]?.subtle ?? '')}
                    onReset={!isSystemBrand ? () => handleEasingChange(key, 'subtle', JIO_MOTION_EASINGS[key].subtle) : undefined}
                  />
                ))}
              </div>
            </div>

            {/* Linear — always read-only */}
            <div>
              <span style={{ fontSize: 'var(--Typography-Size-S)', fontWeight: 'var(--Typography-Weight-Semibold)', color: 'var(--Text-High)', display: 'block', marginBottom: 'var(--Spacing-3-5)' }}>Linear</span>
              <div style={{ maxWidth: '25%' }}>
                <CubicBezierEditor
                  value="cubic-bezier(0, 0, 1, 1)"
                  onChange={() => {}}
                  readOnly
                  typeLabel="Linear"
                />
              </div>
            </div>
          </div>
        </FoundationCard>
        )}

        {/* ── All tokens reference (read-only) ── */}
        {activeTab === 'tokens' && (
        <FoundationCard
          title="All Motion Tokens"
          description="Complete reference — copy CSS variable names for use in components."
        >
          <div className={motionStyles.tokenSections}>
            <div className={motionStyles.tokenSection}>
              <div className={motionStyles.tokenSectionTitle}>Duration &amp; Offset</div>
              <div className={motionStyles.tokenTable}>
                <div className={`${motionStyles.tokenRow} ${motionStyles.tokenTimingRow} ${motionStyles.tokenHeader}`}>
                  <span>Token name</span>
                  <span>Graph</span>
                  <span>Value</span>
                </div>
                {timingMotionTokens.map((token) => (
                  <div
                    key={token.name}
                    className={`${motionStyles.tokenRow} ${motionStyles.tokenTimingRow} ${token.highlight ? motionStyles.tokenRowHighlight : ''}`}
                  >
                    <code className={motionStyles.tokenName}>{token.name}</code>
                    <MotionTokenGraph token={token} maxValue={maxTimingTokenValue} />
                    <code className={motionStyles.tokenValue}>{token.value}</code>
                  </div>
                ))}
              </div>
            </div>

            <div className={motionStyles.tokenSection}>
              <div className={motionStyles.tokenSectionTitle}>Easings</div>
              <div className={motionStyles.tokenTable}>
                <div className={`${motionStyles.tokenRow} ${motionStyles.tokenEasingRow} ${motionStyles.tokenHeader}`}>
                  <span>Token name</span>
                  <span>Curve</span>
                  <span>Value</span>
                </div>
                {easingMotionTokens.map((token) => (
                  <div
                    key={token.name}
                    className={`${motionStyles.tokenRow} ${motionStyles.tokenEasingRow}`}
                  >
                    <code className={motionStyles.tokenName}>{token.name}</code>
                    <MotionTokenGraph token={token} maxValue={maxTimingTokenValue} />
                    <code className={motionStyles.tokenValue}>{token.value}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FoundationCard>
        )}

        {/* ── Interaction Patterns ── */}
        {activeTab === 'patterns' && (
        <>
        <FoundationCard
          title="Interaction Patterns"
          description="Motion recipes for user interactions. Each pattern defines duration, easing, and behaviour rules using foundation tokens."
          contentClassName={motionStyles.patternCardContent}
        >
          <div className={motionStyles.patternList}>
            {(config.interactionPatterns ?? JIO_INTERACTION_PATTERNS).map(pattern => {
              const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
              return (
                <Collapsible key={pattern.type} className={motionStyles.patternSection}>
                  <Collapsible.Trigger className={motionStyles.patternSummary}>
                    <span className={motionStyles.patternSummaryMain}>
                      <span className={motionStyles.patternSummaryTitle}>{pattern.name}</span>
                    </span>
                    {pattern.variantCount && (
                      <span className={motionStyles.patternSummaryMeta}>{pattern.variantCount} variants</span>
                    )}
                  </Collapsible.Trigger>
                  <Collapsible.Panel className={motionStyles.patternPanelShell}>
                  <div className={motionStyles.patternPanel}>
                    {pattern.subPatterns.map(sub => {
                      // Long press combines surface colour + scale down in one demo
                      if (pattern.type === 'longPress' && sub.name === 'Surface Colour') return null;
                      const dur = scale.duration.moderate[sub.duration];
                      const easingVal = config.easings[sub.easing]?.moderate ?? '';

                      if (sub.status === 'deferred') {
                        return (
                          <div key={sub.name}>
                            <span style={{ fontSize: 'var(--Typography-Size-XS)', fontWeight: 'var(--Typography-Weight-Semibold)', color: 'var(--Text-High)', display: 'block', marginBottom: 'var(--Spacing-2-5)' }}>{sub.name}</span>
                            <div style={{ padding: 'var(--Spacing-4)', backgroundColor: 'transparent', borderRadius: 'var(--Shape-4)' }}>
                              <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)' }}>Deferred — requires colour foundation connection</span>
                              <div style={{ marginTop: 'var(--Spacing-3-5)', display: 'flex', gap: 'var(--Spacing-4-5)' }}>
                                <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Medium)' }}>Duration: <code style={{ fontFamily: 'var(--Typography-Font-Mono)' }}>{sub.duration.toUpperCase()} ({dur}ms)</code></span>
                                <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Medium)' }}>Easing: <code style={{ fontFamily: 'var(--Typography-Font-Mono)' }}>{cap(sub.easing)}</code></span>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      if (sub.status === 'pending') {
                        return (
                          <div key={sub.name} style={{ padding: 'var(--Spacing-4)', backgroundColor: 'transparent', borderRadius: 'var(--Shape-4)' }}>
                            <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)' }}>Specs pending</span>
                          </div>
                        );
                      }

                      // Active sub-pattern: render specs + demo
                      return (
                        <div key={sub.name}>
                          <span style={{ fontSize: 'var(--Typography-Size-XS)', fontWeight: 'var(--Typography-Weight-Semibold)', color: 'var(--Text-High)', display: 'block', marginBottom: 'var(--Spacing-3-5)' }}>{sub.name}</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <SpecRow label="Description" value={sub.description} />
                              <SpecRow label="Duration" value={`${sub.duration.toUpperCase()} (${dur}ms)`} />
                              <SpecRow label="Easing" value={`${cap(sub.easing)} Moderate`} />
                              {sub.name === 'Surface Colour' && pattern.type === 'tap' && (
                                <>
                                  <SpecRow label="Bold" value="--Primary-Bold → --Primary-Bold-Pressed" />
                                  <SpecRow label="Subtle" value="--Primary-Subtle → --Primary-Subtle-Pressed" />
                                  <SpecRow label="Ghost" value="transparent → --Primary-Pressed" />
                                </>
                              )}
                              {sub.name === 'Surface Colour' && pattern.type === 'hover' && (
                                <>
                                  <SpecRow label="Bold" value="--Primary-Bold → --Primary-Bold-Hover" />
                                  <SpecRow label="Subtle" value="--Primary-Subtle → --Primary-Subtle-Hover" />
                                  <SpecRow label="Ghost" value="transparent → --Primary-Hover" />
                                </>
                              )}
                              {pattern.type === 'longPress' && sub.name === 'Scale Down' && (
                                <>
                                  <SpecRow label="Phase 1 — Surface" value="Bold → Pressed / Subtle → Pressed" />
                                  <SpecRow label="Phase 2 — Scale" value="Scale down 3% after delay" />
                                </>
                              )}
                              {sub.scalePercent !== undefined && <SpecRow label="Scale factor" value={`${sub.scalePercent}%`} />}
                              {sub.targetValue && <SpecRow label="Target" value={sub.targetValue} />}
                              {sub.interruptible && <SpecRow label="Interruptible" value="Yes — release triggers touch-up" />}
                              {sub.delayDuration && <SpecRow label="Delay" value={`${sub.delayDuration.toUpperCase()} (${scale.duration.moderate[sub.delayDuration]}ms)`} />}
                            </div>

                            {/* Demos — mapped by pattern type + sub-pattern name */}
                            {/* Surface Colour demos — actual buttons in 3 attention levels */}
                            {sub.name === 'Surface Colour' && sub.status === 'active' && (
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--Spacing-4)' }}>
                                {[
                                  { variant: 'bold' as const, label: 'High' },
                                  { variant: 'subtle' as const, label: 'Medium' },
                                  { variant: 'ghost' as const, label: 'Low' },
                                ].map(({ variant, label }) => (
                                  <div key={variant} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 'var(--Spacing-3)', padding: 'var(--Spacing-4)', borderRadius: 'var(--Shape-4)' }}>
                                    <Button attention={({ bold: 'high', subtle: 'medium', ghost: 'low' } as const)[variant]} size="m">
                                      {pattern.type === 'hover' ? 'Hover me' : 'Press me'}
                                    </Button>
                                    <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)' }}>{label}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {pattern.type === 'tap' && sub.name === 'Scale Down' && (
                              <PatternScaleDemo title="Scale Down" direction="down" durationMs={dur} easingValue={easingVal} />
                            )}
                            {pattern.type === 'tap' && sub.name === 'Scale Up' && (
                              <ScaleUpIconDemo durationMs={dur} easingValue={easingVal} />
                            )}
                            {pattern.type === 'hover' && sub.name === 'Scale Up' && (
                              <HoverScaleDemo durationLMs={scale.duration.moderate.l} durationXlMs={scale.duration.moderate.xl} easingValue={easingVal} />
                            )}
                            {pattern.type === 'longPress' && sub.name === 'Scale Down' && (
                              <LongPressDemo durationMMs={dur} durationXlMs={sub.delayDuration ? scale.duration.moderate[sub.delayDuration] : scale.duration.moderate.xl} easingValue={easingVal} />
                            )}
                            {pattern.type === 'disable' && (
                              <DisableDemo durationMMs={dur} easingValue={easingVal} />
                            )}
                            {pattern.type === 'focus' && (
                              <FocusDemo durationLMs={dur} easingValue={easingVal} />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  </Collapsible.Panel>
                </Collapsible>
              );
            })}
          </div>
        </FoundationCard>

        {/* ── Transition Patterns ── */}
        <FoundationCard
          title="Transition Patterns"
          description="Motion recipes for view and layout transitions. One spec per pattern."
          contentClassName={motionStyles.patternCardContent}
        >
          <div className={motionStyles.patternList}>
            {(config.transitionPatterns ?? JIO_TRANSITION_PATTERNS).map(pattern => {
              const dur = scale.duration.moderate[pattern.duration];
              const easing = config.easings[pattern.easing]?.moderate ?? '';
              const exitDur = pattern.exitDuration ? scale.duration.moderate[pattern.exitDuration] : undefined;
              const exitEasingVal = pattern.exitEasing ? (config.easings[pattern.exitEasing]?.moderate ?? '') : undefined;
              const offsetStep = pattern.offset ?? (pattern.direction === 'toplevel' ? 'l' : undefined);
              const staggerStep = pattern.stagger ?? (pattern.direction === 'stagger' ? 's' : undefined);
              const staggerMs = staggerStep ? scale.offset.moderate[staggerStep] : offsetStep ? scale.offset.moderate[offsetStep] : undefined;
              const lateralParams = pattern.lateral ? {
                fadeOutMs: scale.duration.moderate[pattern.lateral.fadeOutDuration],
                fadeInMs: scale.duration.moderate[pattern.lateral.fadeInDuration],
                offsetMs: scale.offset.moderate[pattern.lateral.offset],
              } : undefined;
              const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
              return (
                <Collapsible key={pattern.name} className={motionStyles.patternSection}>
                  <Collapsible.Trigger className={motionStyles.patternSummary}>
                    <span className={motionStyles.patternSummaryMain}>
                      <span className={motionStyles.patternSummaryTitle}>{pattern.name}</span>
                      <span className={motionStyles.patternSummaryDescription}>{pattern.description}</span>
                    </span>
                    <span className={motionStyles.patternSummaryMeta}>
                      {pattern.duration.toUpperCase()} · {cap(pattern.easing)}
                    </span>
                  </Collapsible.Trigger>
                  <Collapsible.Panel className={motionStyles.patternPanelShell}>
                  <div className={motionStyles.transitionPatternPanel}>
                  <div className={motionStyles.transitionPatternGrid}>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <SpecRow label="Description" value={pattern.description} />
                      <SpecRow label="Enter" value={`${pattern.duration.toUpperCase()} (${dur}ms), ${cap(pattern.easing)} Moderate`} />
                      {exitDur !== undefined && <SpecRow label="Exit" value={`${pattern.exitDuration!.toUpperCase()} (${exitDur}ms), ${cap(pattern.exitEasing!)} Moderate`} />}
                      {exitDur === undefined && <SpecRow label="Easing" value={`${cap(pattern.easing)} Moderate`} />}
                      {(pattern.direction === 'stack' || pattern.direction === 'X') && <SpecRow label="Scrim" value="50% black over Screen A" />}
                      {offsetStep && <SpecRow label="Offset" value={`${offsetStep.toUpperCase()} (${staggerMs}ms) — Screen B fades in after delay`} />}
                      {lateralParams && (
                        <>
                          <SpecRow label="Slide" value={`${pattern.duration.toUpperCase()} (${dur}ms), ${cap(pattern.easing)} — both cards move 30%`} />
                          <SpecRow label="Fade out" value={`${pattern.lateral!.fadeOutDuration.toUpperCase()} (${lateralParams.fadeOutMs}ms), ${cap(pattern.easing)} — Tab 1 from start`} />
                          <SpecRow label="Offset" value={`${pattern.lateral!.offset.toUpperCase()} (${lateralParams.offsetMs}ms) — delay before Tab 2 fades in`} />
                          <SpecRow label="Fade in" value={`${pattern.lateral!.fadeInDuration.toUpperCase()} (${lateralParams.fadeInMs}ms), ${cap(pattern.easing)} — Tab 2`} />
                        </>
                      )}
                      {pattern.direction === 'stagger' && (
                        <>
                          <SpecRow label="Pulse" value={`Neutral 2100 → 2400 → 2100, 3XL (${Math.round((scale.duration.moderate.xl * 1.5) * 2)}ms total) ${cap(pattern.easing)}`} />
                          <SpecRow label="Offset" value={`L (${scale.offset.moderate.l}ms) — stagger between each element`} />
                          <SpecRow label="Loop" value="Infinite" />
                        </>
                      )}
                      {staggerStep && pattern.direction !== 'stagger' && <SpecRow label="Stagger" value={`${staggerStep.toUpperCase()} (${staggerMs}ms)`} />}
                      {pattern.direction === 'scale' && (
                        <>
                          <SpecRow label="Enter morph" value={`Clip-path from card to modal, ${pattern.duration.toUpperCase()} (${dur}ms) ${cap(pattern.easing)}`} />
                          <SpecRow label="Exit scale" value={`Scale to 90% + fade out, ${pattern.exitDuration!.toUpperCase()} (${exitDur}ms) ${cap(pattern.exitEasing!)}`} />
                          <SpecRow label="Card restore" value={`Fades in on exit, ${pattern.exitDuration!.toUpperCase()} (${exitDur}ms) ${cap(pattern.exitEasing!)}`} />
                          <SpecRow label="Scrim" value={`50% black + backdrop blur, enter ${pattern.duration.toUpperCase()} (${dur}ms) / exit ${pattern.exitDuration!.toUpperCase()} (${exitDur}ms)`} />
                        </>
                      )}
                    </div>
                    <div className={motionStyles.transitionPreviewPane}>
                      <TransitionDemo
                        pattern={pattern} durationMs={dur} easingValue={easing}
                        exitDurationMs={exitDur} exitEasingValue={exitEasingVal} staggerMs={staggerMs}
                        lateralParams={lateralParams}
                        xlDurationMs={scale.duration.moderate.xl}
                        transitionEasingValue={config.easings.transition?.moderate ?? ''}
                      />
                      <span className={motionStyles.transitionPreviewHint}>Click to preview</span>
                    </div>
                  </div>
                  </div>
                  </Collapsible.Panel>
                </Collapsible>
              );
            })}
          </div>
        </FoundationCard>
        </>
        )}

        </div>
      </div>

      <div className={styles.foundationFooterActions}>
        <ExportTokensButton foundation="motion" />
      </div>

      {isSaving && (
        <div style={{ position: 'fixed', bottom: 'var(--Spacing-4-5)', right: 'var(--Spacing-4-5)', padding: 'var(--Spacing-3-5) var(--Spacing-4)', backgroundColor: 'var(--Surface-Bold)', color: 'var(--Text-OnBold-High)', borderRadius: 'var(--Shape-Pill)', fontSize: 'var(--Typography-Size-XS)', opacity: 0.9 }}>
          Saving...
        </div>
      )}
    </div>
  );
}
