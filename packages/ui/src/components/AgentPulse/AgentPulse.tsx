/**
 * AgentPulse.tsx
 * React (web) implementation — animated brand-coloured indicator for the
 * four canonical agent states (idle, listening, thinking, speaking).
 *
 * Architecture:
 * - Pure CSS + SVG animation (no Lottie dependency). Four rounded
 *   rectangles in a 1000×1000 viewBox drive every state and transition
 *   via CSS keyframes in AgentPulse.module.css.
 * - Brand colour resolves via `var(--{Appearance}-Bold)` directly in CSS
 *   — no canvas recolouring, no per-state JSON load. Appearance changes
 *   take effect on the next paint.
 * - State transitions: idle → listening plays a 1633ms entry (rotation +
 *   morph + bounce); listening → thinking plays a 1000ms exit. Every
 *   other state change snaps. Disable with `autoTransition={false}`.
 * - `prefers-reduced-motion` swaps to the static brand-coloured fallback
 *   mark; the `pulse` variant adds a tokenised opacity keyframe.
 * - A11y: `role="status"` + `aria-live` live region with a state-derived
 *   label, mirroring the Spinner pattern.
 *
 * @example
 * ```tsx
 * <AgentPulse state="thinking" appearance="primary" size="md" />
 * ```
 */

'use client';

import React, {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import clsx from 'clsx';
import styles from './AgentPulse.module.css';
import { subscribeListening, subscribeSpeaking } from './agentPulseAudio';
import {
  AGENT_PULSE_DEFAULT_LABEL,
  agentPulseColorVar,
  resolveAgentPulseAppearance,
  resolveAgentPulseSize,
  type AgentPulseHandle,
  type AgentPulseProps,
  type AgentPulseState,
} from './AgentPulse.shared';

// ----------------------------------------------------------------------------
// Internal phase machine.
// Phase diverges from the public `state` prop only while a transition is
// in flight; the rest of the time phase === state.
// ----------------------------------------------------------------------------

type Phase =
  | 'idle'
  | 'idle-settling'
  | 'transitioning-to-listening'
  | 'listening'
  | 'transitioning-to-thinking'
  | 'thinking'
  | 'speaking';

const LISTENING_ENTRY_MS = 1633; // phase 1 (0-833ms) + phase 2 bounce (833-1633ms)
const LISTENING_EXIT_MS = 1000;
const IDLE_SETTLE_MS = 300;
const THINKING_LOOP_MS = 4000;
const THINKING_SEGMENT_MS = 1000; // each 90° tick

// ----------------------------------------------------------------------------
// Reduced-motion subscription.
// ----------------------------------------------------------------------------

function usePrefersReducedMotion(): boolean {
  const [prefers, setPrefers] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefers(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setPrefers(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return prefers;
}

// Size resolution — Figma dimension tokens via `resolveAgentPulseSize`.

// ----------------------------------------------------------------------------
// Static fallback — minimalist 4-bar mark drawn in the brand colour.
// Renders for prefers-reduced-motion or when reducedMotionFallback === 'none'.
// ----------------------------------------------------------------------------

const FallbackMark: React.FC = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <rect x="3"  y="6"  width="3" height="12" rx="1.5" />
    <rect x="8"  y="3"  width="3" height="18" rx="1.5" />
    <rect x="13" y="6"  width="3" height="12" rx="1.5" />
    <rect x="18" y="9"  width="3" height="6"  rx="1.5" />
  </svg>
);

// ----------------------------------------------------------------------------
// Pulse mark — 4 rounded rects in the JIO 2×2 layout. All animation is
// driven by `data-state` on the root via CSS keyframes in the module.
// ----------------------------------------------------------------------------

const PulseMark: React.FC<{
  pillRefs: React.MutableRefObject<Array<SVGRectElement | null>>;
  clusterRef: React.RefObject<SVGGElement | null>;
}> = ({ pillRefs, clusterRef }) => (
  <svg
    className={styles.player}
    viewBox="0 0 1000 1000"
    aria-hidden="true"
    focusable="false"
  >
    <g ref={clusterRef as React.Ref<SVGGElement>} className={styles.cluster}>
      <rect
        ref={(r) => { pillRefs.current[0] = r; }}
        className={styles.pill}
        data-pill="1"
        x="309" y="309" width="191" height="191" rx="95.5" ry="95.5"
      />
      <rect
        ref={(r) => { pillRefs.current[1] = r; }}
        className={styles.pill}
        data-pill="2"
        x="500" y="309" width="191" height="191" rx="95.5" ry="95.5"
      />
      <rect
        ref={(r) => { pillRefs.current[2] = r; }}
        className={styles.pill}
        data-pill="3"
        x="309" y="500" width="191" height="191" rx="95.5" ry="95.5"
      />
      <rect
        ref={(r) => { pillRefs.current[3] = r; }}
        className={styles.pill}
        data-pill="4"
        x="500" y="500" width="191" height="191" rx="95.5" ry="95.5"
      />
    </g>
  </svg>
);

// ----------------------------------------------------------------------------
// Component.
// ----------------------------------------------------------------------------

export function AgentPulse({
  state = 'idle',
  appearance = 'secondary',
  emphasis = 'tinted',
  size = 'md',
  autoTransition = true,
  paused = false,
  reducedMotionFallback = 'static',
  label,
  'aria-live': ariaLive = 'polite',
  className: classNameProp,
  style: styleProp,
  ref,
}: AgentPulseProps) {
  const resolvedAppearance = resolveAgentPulseAppearance(appearance);
  const pillRefs = useRef<Array<SVGRectElement | null>>([null, null, null, null]);
  const clusterRef = useRef<SVGGElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const transitionTimerRef = useRef<number | null>(null);

  const prefersReducedMotion = usePrefersReducedMotion();

  // Phase tracks the visual state. Diverges from `state` only while a
  // bridge animation is in flight.
  const [phase, setPhase] = useState<Phase>(state);
  const prevStateRef = useRef<AgentPulseState>(state);

  // Track whether the pulse is currently in the viewport. The audio
  // subscriptions below are gated on this: an off-screen speaking
  // instance must NOT trigger playback. Critical for Storybook's autodocs
  // page where many stories render simultaneously — a StateMachine
  // cycling through "speaking" elsewhere on the page would otherwise
  // start the audio while the user is looking at a different story.
  const [isVisible, setIsVisible] = useState(true);
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.01 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ------------------------------------------------------------------
  // React to `state` prop changes — pick a transition path if available.
  // idle → listening: idle-settling (300ms) → transitioning-to-listening (1633ms) → listening
  // listening → thinking: transitioning-to-thinking (1000ms) → thinking
  // Everything else snaps.
  // ------------------------------------------------------------------
  useEffect(() => {
    const prev = prevStateRef.current;
    if (prev === state) return;
    prevStateRef.current = state;

    if (transitionTimerRef.current != null) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    if (!autoTransition) {
      setPhase(state);
      return;
    }

    if (prev === 'idle' && state === 'listening') {
      // Read live idle scale and freeze it via --settle-from-scale so the
      // settle keyframe interpolates from there to 1 instead of snapping.
      const pills = pillRefs.current.filter(
        (p): p is SVGRectElement => p !== null,
      );
      let currentScale = 1;
      if (pills[0]) {
        const matrix = getComputedStyle(pills[0]).transform.match(/matrix\(([^)]+)\)/);
        if (matrix) {
          currentScale = parseFloat(matrix[1].split(',')[0]) || 1;
        }
      }
      const needsSettle = Math.abs(currentScale - 1) > 0.01;

      const playEntry = () => {
        setPhase('transitioning-to-listening');
        transitionTimerRef.current = window.setTimeout(() => {
          setPhase('listening');
        }, LISTENING_ENTRY_MS);
      };

      if (needsSettle && pills.length > 0) {
        pills.forEach((pill) => {
          pill.style.setProperty('--settle-from-scale', String(currentScale));
        });
        setPhase('idle-settling');
        transitionTimerRef.current = window.setTimeout(() => {
          pills.forEach((pill) => {
            pill.style.removeProperty('--settle-from-scale');
          });
          playEntry();
        }, IDLE_SETTLE_MS);
      } else {
        playEntry();
      }
      return;
    }

    if (prev === 'listening' && state === 'thinking') {
      setPhase('transitioning-to-thinking');
      transitionTimerRef.current = window.setTimeout(() => {
        setPhase('thinking');
      }, LISTENING_EXIT_MS);
      return;
    }

    // Thinking → anything: wait for the current 90° rotation segment to
    // finish naturally. Snapping mid-segment breaks the four-tick rhythm
    // that's the whole point of the thinking animation.
    if (prev === 'thinking') {
      const cluster = clusterRef.current;
      const thinkingAnim = cluster?.getAnimations?.()[0];
      const elapsed =
        thinkingAnim && typeof thinkingAnim.currentTime === 'number'
          ? (thinkingAnim.currentTime as number) % THINKING_LOOP_MS
          : 0;
      const wait =
        (THINKING_SEGMENT_MS - (elapsed % THINKING_SEGMENT_MS)) % THINKING_SEGMENT_MS;
      if (wait > 0) {
        transitionTimerRef.current = window.setTimeout(() => {
          setPhase(state);
        }, wait);
        return;
      }
    }

    // Snap.
    setPhase(state);
  }, [state, autoTransition]);

  // Cleanup on unmount.
  useEffect(() => () => {
    if (transitionTimerRef.current != null) {
      window.clearTimeout(transitionTimerRef.current);
    }
  }, []);

  // ------------------------------------------------------------------
  // Audio-driven listening — subscribe whenever the visible phase is
  // listening (and we're not paused). The agentPulseAudio singleton only
  // ticks when a mic source has been started by the consumer; until then
  // the callback never fires and pills sit at rest height. See
  // `agentPulseAudio.ts`.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (paused || phase !== 'listening' || !isVisible) return;
    const unsubscribe = subscribeListening((heights) => {
      pillRefs.current.forEach((pill, i) => {
        if (pill) pill.style.setProperty('--pill-h', `${heights[i]}px`);
      });
    });
    return () => {
      unsubscribe();
      pillRefs.current.forEach((pill) => pill?.style.removeProperty('--pill-h'));
    };
  }, [phase, paused, isVisible]);

  // ------------------------------------------------------------------
  // Audio-driven speaking — uniform scale across all 4 pills, driven by
  // overall amplitude of the active speaking audio source. Idle when no
  // source has been started.
  // ------------------------------------------------------------------
  useEffect(() => {
    if (paused || phase !== 'speaking' || !isVisible) return;
    const unsubscribe = subscribeSpeaking((scale) => {
      const transform = `scale(${scale})`;
      pillRefs.current.forEach((pill) => {
        if (pill) pill.style.transform = transform;
      });
    });
    return () => {
      unsubscribe();
      pillRefs.current.forEach((pill) => {
        if (pill) pill.style.removeProperty('transform');
      });
    };
  }, [phase, paused, isVisible]);

  // Imperative handle.
  useImperativeHandle(
    ref,
    () => ({
      play: () => {
        // Resume any paused animations by clearing animation-play-state.
        pillRefs.current.forEach((p) => {
          if (p) p.style.removeProperty('animation-play-state');
        });
        if (clusterRef.current) clusterRef.current.style.removeProperty('animation-play-state');
      },
      pause: () => {
        pillRefs.current.forEach((p) => {
          if (p) p.style.setProperty('animation-play-state', 'paused');
        });
        if (clusterRef.current) clusterRef.current.style.setProperty('animation-play-state', 'paused');
      },
      setState: (next, opts) => {
        // Bypass autoTransition gate when explicitly opted in via opts.transition.
        const transition = opts?.transition ?? autoTransition;
        if (!transition) {
          prevStateRef.current = next;
          if (transitionTimerRef.current != null) {
            window.clearTimeout(transitionTimerRef.current);
            transitionTimerRef.current = null;
          }
          setPhase(next);
          return;
        }
        // Otherwise the regular useEffect path will trigger when `state` changes;
        // for imperative calls without state sync, manually re-run the logic.
        prevStateRef.current = next;
        setPhase(next);
      },
    }),
    [autoTransition],
  );

  const { dataSize, inlineSize } = resolveAgentPulseSize(size);
  const className = clsx(styles.root, classNameProp);
  const resolvedLabel = label ?? AGENT_PULSE_DEFAULT_LABEL[state];

  const rootStyle: React.CSSProperties = {
    ...styleProp,
    ...(inlineSize ? { ['--AgentPulse-size' as string]: inlineSize } : null),
    ['--AgentPulse-color' as string]: agentPulseColorVar(resolvedAppearance, emphasis),
  };

  const showFallback =
    prefersReducedMotion && reducedMotionFallback !== 'none' ? true : false;
  const hideEverything =
    prefersReducedMotion && reducedMotionFallback === 'none';

  return (
    <div
      ref={rootRef}
      className={className}
      style={rootStyle}
      data-size={dataSize}
      data-state={phase}
      data-appearance={resolvedAppearance}
      data-emphasis={emphasis}
      data-paused={paused ? 'true' : undefined}
      role="status"
      aria-live={ariaLive}
      aria-label={resolvedLabel}
    >
      <span className={styles.srOnly}>{resolvedLabel}</span>
      {hideEverything ? null : showFallback ? (
        <span
          className={clsx(
            styles.fallback,
            prefersReducedMotion && reducedMotionFallback === 'pulse' && styles.fallbackPulse,
          )}
          aria-hidden="true"
        >
          <FallbackMark />
        </span>
      ) : (
        <PulseMark pillRefs={pillRefs} clusterRef={clusterRef} />
      )}
    </div>
  );
}
