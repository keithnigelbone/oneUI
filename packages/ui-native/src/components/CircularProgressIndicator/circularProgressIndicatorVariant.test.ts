import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getCircularProgressIndicatorAccessibilityProps,
  useCircularProgressIndicatorState,
} from './interface';

describe('CircularProgressIndicator variant / value', () => {
  describe('useCircularProgressIndicatorState', () => {
    it('renders determinate when variant is determinate and value is set', () => {
      const state = useCircularProgressIndicatorState({
        variant: 'determinate',
        value: 50,
      });
      expect(state.isIndeterminate).toBe(false);
      expect(state.resolvedVariant).toBe('determinate');
      expect(state.percentage).toBe(50);
    });

    it('coerces to indeterminate when variant is determinate but value is omitted (web parity)', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      const state = useCircularProgressIndicatorState({
        variant: 'determinate',
      });
      expect(state.isIndeterminate).toBe(true);
      expect(state.resolvedVariant).toBe('indeterminate');
    });

    it('stays indeterminate when variant is indeterminate even with value', () => {
      const state = useCircularProgressIndicatorState({
        variant: 'indeterminate',
        value: 50,
      });
      expect(state.isIndeterminate).toBe(true);
      expect(state.resolvedVariant).toBe('indeterminate');
    });

    it('treats value={0} as determinate', () => {
      const state = useCircularProgressIndicatorState({
        variant: 'determinate',
        value: 0,
      });
      expect(state.isIndeterminate).toBe(false);
      expect(state.resolvedVariant).toBe('determinate');
      expect(state.percentage).toBe(0);
    });
  });

  describe('accessibility when coerced to indeterminate', () => {
    it('exposes busy without accessibilityValue', () => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      const state = useCircularProgressIndicatorState({ variant: 'determinate' });
      const a11y = getCircularProgressIndicatorAccessibilityProps(
        { 'aria-label': 'Progress' },
        state,
      );
      expect(a11y.accessibilityState.busy).toBe(true);
      expect(a11y.accessibilityValue).toBeUndefined();
    });
  });

  describe('variant="determinate" without value', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'development');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
      vi.restoreAllMocks();
    });

    it('warns in development', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      useCircularProgressIndicatorState({ variant: 'determinate' });
      expect(warn.mock.calls[0]?.[0]).toMatch(
        /variant="determinate" requires `value`/,
      );
    });

    it('does not warn when value is provided', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      useCircularProgressIndicatorState({ variant: 'determinate', value: 25 });
      expect(warn).not.toHaveBeenCalled();
    });

    it('does not warn for explicit indeterminate', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      useCircularProgressIndicatorState({ variant: 'indeterminate' });
      expect(warn).not.toHaveBeenCalled();
    });

    it('does not warn in production', () => {
      vi.stubEnv('NODE_ENV', 'production');
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      useCircularProgressIndicatorState({ variant: 'determinate' });
      expect(warn).not.toHaveBeenCalled();
    });
  });
});
