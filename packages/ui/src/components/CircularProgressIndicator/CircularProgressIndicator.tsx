/**
 * CircularProgressIndicator.tsx
 * React (web) implementation using Base UI Progress + SVG
 *
 * Key features:
 * - Uses @base-ui/react Progress primitive for accessibility (never fork)
 * - SVG-based circular ring with track + indicator
 * - Token-only styling in CSS Module
 * - 10 size presets, 9 multi-accent roles, determinate/indeterminate variants
 * - Optional center content: auto-percentage text or custom icon
 * - WCAG AA accessible with proper role and aria attributes
 *
 * @example
 * ```tsx
 * import { CircularProgressIndicator } from '@oneui/ui';
 *
 * <CircularProgressIndicator value={75} />
 * <CircularProgressIndicator variant="indeterminate" size="XL" />
 * <CircularProgressIndicator value={25} content="text" size="3XL" />
 * <CircularProgressIndicator content="icon" size="2XL">
 *   <Icon name="download" />
 * </CircularProgressIndicator>
 * ```
 */

'use client';

import React, {
  cloneElement,
  forwardRef,
  isValidElement,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Progress as BaseProgress } from '@base-ui/react/progress';
import clsx from 'clsx';
import styles from './CircularProgressIndicator.module.css';
import {
  CircularProgressIndicatorProps,
  CircularProgressIndicatorAppearance,
  CPI_MATERIAL_TOKEN_LABEL,
  CPI_MATERIAL_GRADIENT_STOPS,
  CPI_SIZE_TO_ICON_SIZE,
  isCpiLabelVisible,
  useCircularProgressState,
} from './CircularProgressIndicator.shared';
import { Icon } from '../Icon/Icon';
import type { IconAppearance, IconEmphasis } from '../Icon/Icon.shared';
import { SlotParentAppearanceProvider } from '../../contexts/SlotParentAppearanceContext';

function cpiAppearanceToIconAppearance(
  appearance: Exclude<CircularProgressIndicatorAppearance, 'auto'>,
): IconAppearance {
  if (appearance === 'brand-bg') return 'primary';
  return appearance;
}

/** Merge CPI size + appearance onto a centre `<Icon />` when props are omitted. */
function enrichCenterIcon(
  node: ReactNode,
  size: NonNullable<CircularProgressIndicatorProps['size']>,
  resolvedAppearance: Exclude<CircularProgressIndicatorAppearance, 'auto'>,
): ReactNode {
  if (!isValidElement(node) || node.type !== Icon) {
    return node;
  }
  const props = node.props as Record<string, unknown>;
  const patch: Record<string, unknown> = {};
  if (props.size === undefined) patch.size = CPI_SIZE_TO_ICON_SIZE[size];
  if (props.appearance === undefined) {
    patch.appearance = cpiAppearanceToIconAppearance(resolvedAppearance);
  }
  // Centre glyphs use the same tintedA11y on-colour tokens as `.icon { color: var(--_text-color) }`.
  if (props.emphasis === undefined) patch.emphasis = 'tintedA11y' as IconEmphasis;
  return cloneElement(node as ReactElement<Record<string, unknown>>, patch);
}

// Matches --Motion-Duration-XL (Moderate). Used to time when the React phase
// transitions to its post-animation state. Reduced-motion shrinks the CSS
// animation but the timeout stays — the component just lingers briefly in the
// final visual state, which is harmless.
const ENTRY_EXIT_DURATION_MS = 450;

type AnimationPhase = 'entering' | 'visible' | 'exiting' | 'hidden';

function initialPhase(
  animate: boolean,
  show: boolean,
  variant: 'determinate' | 'indeterminate',
  value: number | undefined,
): AnimationPhase {
  if (!show) return 'hidden';
  if (!animate) return 'visible';
  if (variant === 'determinate') {
    // Determinate spec: entry ONLY at 0%. Mount at any other value skips entry.
    return value === 0 ? 'entering' : 'visible';
  }
  return 'entering';
}

// Map resolved appearance to CSS module class (type-safe, primary = no extra class)
const appearanceClassMap: Record<
  Exclude<CircularProgressIndicatorAppearance, 'auto'>,
  string | undefined
> = {
  primary: undefined,
  secondary: styles.appearanceSecondary,
  sparkle: styles.appearanceSparkle,
  'brand-bg': styles.appearanceBrandBg,
  neutral: styles.appearanceNeutral,
  positive: styles.appearancePositive,
  negative: styles.appearanceNegative,
  warning: styles.appearanceWarning,
  informative: styles.appearanceInformative,
};

export const CircularProgressIndicator = forwardRef<
  HTMLDivElement,
  CircularProgressIndicatorProps
>(function CircularProgressIndicator(
  {
    variant = 'determinate',
    size = 'M',
    appearance = 'secondary',
    material = 'none',
    content = 'none',
    value,
    min = 0,
    max = 100,
    animate = false,
    show = true,
    children,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledby,
    'data-testid': dataTestId,
    className: classNameProp,
    style: styleProp,
  },
  ref,
) {
  const {
    percentage,
    isIndeterminate,
    center,
    radius,
    strokeWidth,
    circumference,
    dashOffset,
    resolvedAppearance,
    dataAttrs,
  } = useCircularProgressState({
    variant,
    size,
    appearance,
    content,
    value,
    min,
    max,
  });

  // The arc always paints through an SVG linearGradient (a CSS gradient cannot
  // fill an SVG stroke). Its stops default to the solid indicator colour, so a
  // non-metal arc looks solid; a metal remaps the stops to the foundation metal
  // tokens (--Material-Metallic-{Label}-{Shadow|Base|BaseLight|Highlight}). The
  // editor sets those same arc-stop vars via token overrides, so the editor
  // preview and the live component render identically.
  const rawId = useId();
  const gradientId = `cpi-arc-${rawId.replace(/:/g, '')}`;
  const materialLabel = material !== 'none' ? CPI_MATERIAL_TOKEN_LABEL[material] : null;

  // Phase state machine for entry/exit animations. Only active when animate=true.
  // Indeterminate: entry/exit driven by `show` prop.
  // Determinate (per spec): entry ONLY when value transitions to 0%; exit ONLY when value reaches 100%.
  //                         `show=false` still force-hides (without animation) for visibility control.
  const [phase, setPhase] = useState<AnimationPhase>(() => initialPhase(animate, show, variant, value));
  const isFirstRenderRef = useRef(true);
  const prevValueRef = useRef<number | undefined>(value);
  const prevShowRef = useRef(show);
  // Read the actual value-transition duration from CSS so we can defer exit
  // until the arc has visually finished growing to 100% (matters when the
  // 3XL transition is in play; tracking mode with 0s override exits immediately).
  const indicatorRef = useRef<SVGCircleElement>(null);
  const readValueTransitionMs = (): number => {
    if (!indicatorRef.current) return 0;
    const td = getComputedStyle(indicatorRef.current).transitionDuration;
    const match = td.match(/^([\d.]+)s/);
    return match ? parseFloat(match[1]) * 1000 : 0;
  };

  // Ref-tracked timers — survive non-transitional re-renders (e.g. rapid value
  // updates) so phase transitions complete. Cleared only when a new transition
  // starts or the component unmounts.
  const phaseTimersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const clearPhaseTimers = () => {
    phaseTimersRef.current.forEach(clearTimeout);
    phaseTimersRef.current.clear();
  };
  const schedulePhase = (next: AnimationPhase, delay: number) => {
    const t = setTimeout(() => {
      setPhase(next);
      phaseTimersRef.current.delete(t);
    }, delay);
    phaseTimersRef.current.add(t);
  };
  useEffect(() => () => clearPhaseTimers(), []);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      if (phase === 'entering') {
        schedulePhase('visible', ENTRY_EXIT_DURATION_MS);
      }
      prevValueRef.current = value;
      prevShowRef.current = show;
      return;
    }

    if (!animate) {
      clearPhaseTimers();
      setPhase(show ? 'visible' : 'hidden');
      prevValueRef.current = value;
      prevShowRef.current = show;
      return;
    }

    const prevValue = prevValueRef.current;
    const prevShow = prevShowRef.current;
    prevValueRef.current = value;
    prevShowRef.current = show;

    if (variant === 'determinate') {
      // Force-hide overrides everything (no exit animation — that's reserved for value=100).
      if (!show) {
        if (phase !== 'hidden') {
          clearPhaseTimers();
          setPhase('hidden');
        }
        return;
      }
      // Show flipped false → true: enter only if value is 0, otherwise just appear.
      if (!prevShow && show) {
        clearPhaseTimers();
        if (value === 0) {
          setPhase('entering');
          schedulePhase('visible', ENTRY_EXIT_DURATION_MS);
        } else {
          setPhase('visible');
        }
        return;
      }
      // Exit on rising edge to 100 — defer by the value transition duration so
      // the arc has time to visually grow to 100% before exit starts.
      if (
        prevValue !== undefined &&
        prevValue !== null &&
        prevValue < 100 &&
        value === 100 &&
        (phase === 'visible' || phase === 'entering')
      ) {
        clearPhaseTimers();
        const transitionMs = readValueTransitionMs();
        schedulePhase('exiting', transitionMs);
        schedulePhase('hidden', transitionMs + ENTRY_EXIT_DURATION_MS);
        return;
      }
      // Re-entry on rising edge to 0, only when already hidden.
      // (Post-exit re-entry — when value=0 was set during exit — handled by the
      // separate effect below that fires when phase becomes 'hidden'.)
      if (prevValue !== 0 && value === 0 && phase === 'hidden') {
        clearPhaseTimers();
        setPhase('entering');
        schedulePhase('visible', ENTRY_EXIT_DURATION_MS);
      }
      return;
    }

    // Indeterminate — show drives entry/exit.
    if (show) {
      if (phase === 'hidden' || phase === 'exiting') {
        clearPhaseTimers();
        setPhase('entering');
        schedulePhase('visible', ENTRY_EXIT_DURATION_MS);
      }
    } else if (phase === 'visible' || phase === 'entering') {
      clearPhaseTimers();
      setPhase('exiting');
      schedulePhase('hidden', ENTRY_EXIT_DURATION_MS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- phase is intentionally omitted to avoid re-running on phase transitions
  }, [show, animate, value, variant]);

  // Determinate post-exit re-entry: when phase becomes 'hidden' and value is
  // already at 0 (e.g. consumer reset during the exit window), kick off entry.
  useEffect(() => {
    if (
      animate &&
      variant === 'determinate' &&
      phase === 'hidden' &&
      show &&
      value === 0
    ) {
      clearPhaseTimers();
      setPhase('entering');
      schedulePhase('visible', ENTRY_EXIT_DURATION_MS);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- helpers are stable refs
  }, [phase, animate, variant, show, value]);

  if (phase === 'hidden') return null;

  // Dev-mode warning for missing accessible label
  if (process.env.NODE_ENV !== 'production' && !ariaLabel && !ariaLabelledby) {
    console.warn(
      'CircularProgressIndicator: an `aria-label` or `aria-labelledby` prop is required for accessibility.',
    );
  }

  const className = clsx(
    styles.root,
    appearanceClassMap[resolvedAppearance],
    classNameProp,
  );

  // For indeterminate, Base UI expects value=null
  const progressValue = isIndeterminate ? null : value ?? null;

  return (
    <BaseProgress.Root
      className={styles.progressRoot}
      value={progressValue}
      min={min}
      max={max}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledby}
    >
      <div
        ref={ref}
        className={className}
        data-testid={dataTestId}
        style={{
          '--_circumference': circumference,
          // `material` prop (code consumers): remap the gradient stop vars to the
          // foundation metal. The editor sets these same vars via token overrides,
          // so unset → stops fall back to the solid indicator colour.
          ...(materialLabel
            ? {
                '--CircularProgressIndicator-arcMaterial-Shadow': `var(--Material-Metallic-${materialLabel}-Shadow)`,
                '--CircularProgressIndicator-arcMaterial-Base': `var(--Material-Metallic-${materialLabel}-Base)`,
                '--CircularProgressIndicator-arcMaterial-BaseLight': `var(--Material-Metallic-${materialLabel}-BaseLight)`,
                '--CircularProgressIndicator-arcMaterial-Highlight': `var(--Material-Metallic-${materialLabel}-Highlight)`,
              }
            : {}),
          ...styleProp,
        } as React.CSSProperties}
        {...dataAttrs}
        data-material={material !== 'none' ? material : undefined}
        data-animate={animate ? 'true' : undefined}
        data-phase={animate ? phase : undefined}
      >
        <svg
          viewBox={`0 0 100 100`}
          className={styles.svg}
          aria-hidden="true"
        >
          {/* Arc gradient — stops default to the solid indicator colour and are
              remapped to the foundation metal tokens when a material is applied.
              Always present so a metal can be applied purely via CSS-variable
              override (editor) or the `material` prop (code). */}
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              {CPI_MATERIAL_GRADIENT_STOPS.map((stop, index) => (
                <stop
                  key={index}
                  offset={stop.offset}
                  stopColor={`var(--CircularProgressIndicator-arcMaterial-${stop.property}, var(--_indicator-color))`}
                />
              ))}
            </linearGradient>
          </defs>
          {/* Background track ring */}
          <circle
            className={styles.track}
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
          />
          {/* Progress indicator arc.
              For indeterminate: pathLength=100 normalizes the path so the CSS
              trim-path keyframes can use plain numeric percentages (2..100),
              which interpolate smoothly in every browser. Inline dash/offset
              omitted so the CSS animation owns them. */}
          <circle
            ref={indicatorRef}
            className={styles.indicator}
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
            stroke={`url(#${gradientId})`}
            pathLength={isIndeterminate ? 100 : undefined}
            strokeDasharray={isIndeterminate ? undefined : circumference}
            strokeDashoffset={isIndeterminate ? undefined : dashOffset}
            transform={`rotate(-90 ${center} ${center})`}
          />
        </svg>

        {/* Center content: auto-percentage text (Figma: L+ only) */}
        {content === 'text' && isCpiLabelVisible(size) && (
          <span className={styles.label}>{percentage}</span>
        )}

        {/* Center content: custom icon via children */}
        {content === 'icon' && children && (
          <span className={styles.icon}>
            <SlotParentAppearanceProvider value={resolvedAppearance}>
              {enrichCenterIcon(children, size, resolvedAppearance)}
            </SlotParentAppearanceProvider>
          </span>
        )}
      </div>
    </BaseProgress.Root>
  );
});
