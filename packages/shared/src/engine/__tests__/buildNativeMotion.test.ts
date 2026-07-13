import { describe, it, expect } from 'vitest';
import { buildNativeMotion } from '../buildNativeMotion';
import {
  JIO_MOTION_BASE_DURATION,
  JIO_MOTION_EASINGS,
} from '../../utils/motion';

describe('buildNativeMotion', () => {
  it('matches computeMotionScale for default Jio base (null config)', () => {
    const m = buildNativeMotion(null);
    expect(m.duration.moderate.l).toBe(JIO_MOTION_BASE_DURATION);
    expect(m.duration.subtle.l).toBe(m.duration.moderate.m);
    expect(m.distances.medium).toBe(8);
    expect(m.easings.transition.moderate.css).toContain('cubic-bezier');
    expect(m.easings.transition.moderate.bezier).toEqual([0.5, 0, 0.3, 1]);
    expect(m.easings.linear.bezier).toBeNull();
    expect(m.spinner.rotationMs).toBe(1500);
  });

  it('merges partial brand easings onto defaults', () => {
    const m = buildNativeMotion({
      baseDuration: 300,
      easings: {
        ...JIO_MOTION_EASINGS,
        transition: {
          moderate: 'cubic-bezier(0.1, 0.2, 0.3, 0.4)',
          subtle: JIO_MOTION_EASINGS.transition.subtle,
        },
      },
    });
    expect(m.easings.transition.moderate.bezier).toEqual([0.1, 0.2, 0.3, 0.4]);
    expect(m.easings.entrance.moderate.css).toBe(JIO_MOTION_EASINGS.entrance.moderate);
  });

  it('rescales durations when baseDuration changes', () => {
    const m = buildNativeMotion({
      baseDuration: 200,
      easings: JIO_MOTION_EASINGS,
    });
    expect(m.duration.moderate.l).toBe(200);
  });
});
