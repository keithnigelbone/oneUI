/**
 * TouchSlider.shared.ts
 * Shared types and hooks for TouchSlider — fingertip-friendly variant.
 * Single size per Figma spec (138×32 horizontal / 32×138 vertical).
 */

import type { CSSProperties, ReactNode } from 'react';
import type { ComponentAppearance } from '@oneui/shared';
import { useSurfaceAppearance } from '../Surface';

export type TouchSliderAppearance = ComponentAppearance;
export type TouchSliderOrientation = 'horizontal' | 'vertical';
export type TouchSliderProgressStyle = 'rounded' | 'sharp';

/** Normalized slider value in 0–1. */
export function normalizeTouchSliderValue(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return (value - min) / (max - min);
}

/**
 * Pill cap radius as a fraction of track length: r / L where r = thickness / 2.
 * Icons sit at the cap centre, inset r from each end.
 */
export function computeTouchSliderCapRatio(trackLength: number, thickness: number): number {
  if (trackLength <= 0 || thickness <= 0) return 0;
  return (thickness / 2) / trackLength;
}

/** Leading slot (sharp only): grey until fill reaches the cap centre (fill < r/L). */
export function isTouchSliderStartSlotOnRail(
  fillRatio: number,
  capRatio: number,
  progressStyle: TouchSliderProgressStyle,
): boolean {
  if (progressStyle === 'rounded') return false;
  return fillRatio < capRatio;
}

export function measureTouchSliderCapRatio(
  control: HTMLElement | null,
  isVertical: boolean,
): number | null {
  if (!control) return null;
  const { width, height } = control.getBoundingClientRect();
  const trackLength = isVertical ? height : width;
  const thickness = isVertical ? width : height;
  if (trackLength <= 0 || thickness <= 0) return null;
  return computeTouchSliderCapRatio(trackLength, thickness);
}

export interface TouchSliderProps {
  value?: number | number[];
  defaultValue?: number | number[];
  onValueChange?: (value: number | number[]) => void;
  onValueCommitted?: (value: number | number[]) => void;

  min?: number;
  max?: number;
  step?: number;
  largeStep?: number;

  appearance?: TouchSliderAppearance;
  orientation?: TouchSliderOrientation;
  progressStyle?: TouchSliderProgressStyle;

  /** Optional node rendered before the track (e.g. an icon). 30×30 slot. */
  start?: ReactNode;

  disabled?: boolean;
  readOnly?: boolean;

  name?: string;
  form?: string;
  'aria-label'?: string;
  'aria-labelledby'?: string;

  className?: string;
  style?: CSSProperties;
}

export interface ResolvedTouchSliderState {
  resolvedAppearance: Exclude<TouchSliderAppearance, 'auto'>;
  isDisabled: boolean;
  isReadOnly: boolean;
  isVertical: boolean;
  progressStyle: TouchSliderProgressStyle;
  values: number[];
}

export function useTouchSliderState(props: TouchSliderProps): ResolvedTouchSliderState {
  const valueSource = props.value ?? props.defaultValue ?? 0;
  const values = Array.isArray(valueSource) ? valueSource : [valueSource];

  const parentAppearance = useSurfaceAppearance();
  // Matches Slider — 'auto' resolves to 'secondary' so the default accent feels distinctive.
  const resolvedAppearance = (
    props.appearance && props.appearance !== 'auto'
      ? props.appearance
      : (parentAppearance ?? 'secondary')
  ) as Exclude<TouchSliderAppearance, 'auto'>;

  return {
    resolvedAppearance,
    isDisabled: Boolean(props.disabled || props.readOnly),
    isReadOnly: Boolean(props.readOnly),
    isVertical: props.orientation === 'vertical',
    progressStyle: props.progressStyle ?? 'rounded',
    values,
  };
}
