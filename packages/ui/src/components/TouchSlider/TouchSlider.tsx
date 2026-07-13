/**
 * TouchSlider.tsx
 * Chunky fingertip-friendly slider — single size per Figma spec.
 */

'use client';

import React from 'react';
import { Slider as BaseSlider } from '@base-ui/react/slider';
import styles from './TouchSlider.module.css';
import {
  TouchSliderProps,
  TouchSliderAppearance,
  isTouchSliderStartSlotOnRail,
  measureTouchSliderCapRatio,
  normalizeTouchSliderValue,
  useTouchSliderState,
} from './TouchSlider.shared';

// Default (no class) is `secondary` — matches Slider's auto-resolved appearance.
const APPEARANCE_CLASSES: Record<Exclude<TouchSliderAppearance, 'auto'>, string | undefined> = {
  secondary: undefined,
  primary: styles.appearancePrimary,
  neutral: styles.appearanceNeutral,
  sparkle: styles.appearanceSparkle,
  'brand-bg': styles.appearanceBrandBg,
  positive: styles.appearancePositive,
  negative: styles.appearanceNegative,
  warning: styles.appearanceWarning,
  informative: styles.appearanceInformative,
};

export const TouchSlider: React.FC<TouchSliderProps> = (props) => {
  const s = useTouchSliderState(props);
  const {
    value,
    defaultValue,
    onValueChange,
    onValueCommitted,
    min = 0,
    max = 100,
    step = 1,
    largeStep = 10,
    orientation = 'horizontal',
    start,
    name,
    className,
    style,
  } = props;

  const rootClassName = [
    styles.root,
    s.isVertical ? styles.rootVertical : styles.rootHorizontal,
    APPEARANCE_CLASSES[s.resolvedAppearance],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const controlRef = React.useRef<HTMLDivElement>(null);
  const [capRatio, setCapRatio] = React.useState<number | null>(null);
  const [currentValue, setCurrentValue] = React.useState(() => {
    const source = value ?? defaultValue ?? 0;
    return Array.isArray(source) ? source[0] : source;
  });

  React.useEffect(() => {
    if (value !== undefined) {
      setCurrentValue(Array.isArray(value) ? value[0] : value);
    }
  }, [value]);

  React.useLayoutEffect(() => {
    const control = controlRef.current;
    if (!control) return;

    const updateCapRatio = () => {
      setCapRatio(measureTouchSliderCapRatio(control, s.isVertical));
    };

    updateCapRatio();
    const observer = new ResizeObserver(updateCapRatio);
    observer.observe(control);
    return () => observer.disconnect();
  }, [s.isVertical]);

  const handleValueChange = React.useCallback(
    (next: number | number[]) => {
      const nextValue = Array.isArray(next) ? next[0] : next;
      if (value === undefined) {
        setCurrentValue(nextValue);
      }
      onValueChange?.(next);
    },
    [value, onValueChange],
  );

  const fillRatio = normalizeTouchSliderValue(currentValue, min, max);

  /**
   * Slot contrast follows pill geometry: the icon sits r = thickness/2 from the
   * leading end. Fill covers the slot once it passes that cap centre (sharp only).
   * Until capRatio is measured, fall back to the safe extreme (min-only grey).
   */
  const startOnRail = Boolean(start) && (
    capRatio !== null
      ? isTouchSliderStartSlotOnRail(fillRatio, capRatio, s.progressStyle)
      : s.progressStyle === 'sharp' && fillRatio <= 0
  );

  const ariaLabelProp = props['aria-label'];
  const getAriaLabel = ariaLabelProp ? () => ariaLabelProp : undefined;

  const hiddenThumbStyle: React.CSSProperties = {
    position: 'absolute',
    width: 0,
    height: 0,
    opacity: 0,
    pointerEvents: 'none',
  };

  return (
    <BaseSlider.Root
      value={value}
      defaultValue={defaultValue ?? 0}
      onValueChange={handleValueChange}
      onValueCommitted={onValueCommitted}
      min={min}
      max={max}
      step={step}
      largeStep={largeStep}
      orientation={orientation}
      thumbAlignment="edge"
      disabled={s.isDisabled}
      name={name}
      className={rootClassName}
      style={style}
      data-orientation={orientation}
      data-appearance={s.resolvedAppearance}
      data-progress-style={s.progressStyle}
      data-readonly={s.isReadOnly || undefined}
      data-start-on-rail={startOnRail ? '' : undefined}
      data-at-min={fillRatio <= 0 ? '' : undefined}
      data-has-start-slot={start ? '' : undefined}
      aria-label={props['aria-label']}
      aria-labelledby={props['aria-labelledby']}
    >
      <BaseSlider.Control ref={controlRef} className={styles.control}>
        <BaseSlider.Track className={styles.track}>
          <BaseSlider.Indicator className={styles.indicator} />
          <BaseSlider.Thumb
            index={0}
            getAriaLabel={getAriaLabel}
            style={hiddenThumbStyle}
          >
            {null}
          </BaseSlider.Thumb>
        </BaseSlider.Track>
        {start && (
          <div className={styles.slot} data-slider-slot="start" aria-hidden="true">
            {start}
          </div>
        )}
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
};
