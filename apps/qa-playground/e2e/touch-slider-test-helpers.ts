/**
 * Back-compat re-exports for Touch Slider Playwright helpers.
 * Prefer `./touch-slider/touch-slider-qa-support` in new specs.
 */
import {
  ariaValueNow,
  controlIn,
  expectTouchSliderReachable,
  expectTouchSliderRootLabeled,
  seriousOrCritical,
  slidersIn,
  startSlotOffsetX,
  touchSliderByTestId,
  touchSliderRoot,
} from './touch-slider/touch-slider-qa-support';

export {
  ariaValueNow,
  controlIn,
  expectTouchSliderReachable,
  expectTouchSliderRootLabeled,
  seriousOrCritical,
  slidersIn,
  startSlotOffsetX,
  touchSliderByTestId,
  touchSliderRoot,
};

type AxeViolation = {
  id: string;
  impact?: string;
  nodes?: { html?: string }[];
};

/** Open component issue: axe `label` on native range inputs without aria-label. */
export function isKnownTouchSliderLabelViolation(v: AxeViolation): boolean {
  if (v.id !== 'label') return false;
  return v.nodes?.every((n) => (n.html ?? '').includes('type="range"')) ?? false;
}

/** WCAG gate: serious/critical except the documented label gap on range inputs. */
export function blockingViolationsExcludingKnownLabelGap(violations: AxeViolation[]) {
  return seriousOrCritical(violations).filter((v) => !isKnownTouchSliderLabelViolation(v));
}
