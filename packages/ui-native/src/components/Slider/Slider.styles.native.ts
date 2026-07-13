import { StyleSheet} from 'react-native';
import { tokens } from '@oneui/tokens';
import type { SliderSize } from './interface';

// INTENTIONAL-LITERAL: matches web `var(--Disabled-Opacity, 0.4)` fallback.
export const DISABLED_OPACITY = 0.4;

/** Inactive step tick opacity — token ratio Spacing-0-5 / Spacing-5 ≈ 10%. */
export const STEP_MARK_OPACITY = tokens.spacing['0-5'] / tokens.spacing['5'];

export const SLIDER_SIZES: Record<
  SliderSize,
  {
    track: number;
    knob: number;
    knobInside: number;
  }
> = {
  s: {
    track: tokens.spacing['1-5'], // 6px
    knob: tokens.spacing['3'], // 12px
    knobInside: tokens.spacing['0-5'], // 6px
  },
  m: {
    track: tokens.spacing['2'], // 8px
    knob: tokens.spacing['4'], // 16px
    knobInside: tokens.spacing['1'], // 8px
  },
  l: {
    track: tokens.spacing['3'], // 12px
    knob: tokens.spacing['5'], // 20px
    knobInside: tokens.spacing['1-5'], // 10px
  },
};

export const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  rootHorizonatal: {
    flexDirection: 'row',
    width: '100%',
  },
  rootVertical: {
    flexDirection: 'column',
    height: '100%',
  },
  control: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  track: {
    position: 'absolute',
    borderRadius: tokens.shape.Pill,
  },
  trackHorizontal: {
    width: '100%',
    left: 0,
    right: 0,
  },
  trackVertical: {
    height: '100%',
    top: 0,
    bottom: 0,
  },
  activeTrack: {
    position: 'absolute',
    borderRadius: tokens.shape.Pill,
  },
  knob: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: tokens.shape.Pill,
  },
  knobInsideDot: {
    borderRadius: tokens.shape.Pill,
    position: 'absolute',
  },
  slot: {
    justifyContent: 'center',
    alignItems: 'center',
    width: tokens.spacing['7'], // 28px
    height: tokens.spacing['7'],
  },
  slotHorizontal: {
    marginHorizontal: tokens.spacing['2'],
  },
  slotVertical: {
    marginVertical: tokens.spacing['2'],
  },
  stepContainer: {
    position: 'relative',
    height: '100%',
    width: '100%',
  },
  stepContainerHorizontal: {
    paddingHorizontal: tokens.spacing['1'],
    marginHorizontal: tokens.spacing['1'],
  },
  stepContainerVertical: {
    paddingVertical: tokens.spacing['0-5'],
  },
  stepMark: {
    position: 'absolute',
    opacity: STEP_MARK_OPACITY,
    borderRadius: tokens.shape.Pill,
  },
});
