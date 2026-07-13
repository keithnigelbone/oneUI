import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  isCpiIconContentVisible,
  isCpiLabelVisible,
  isCpiTextContentVisible,
  useCircularProgressIndicatorState,
} from './interface';

describe('CircularProgressIndicator center content', () => {
  describe('isCpiLabelVisible', () => {
    it.each(['L', 'XL', '2XL', '3XL', '4XL', '5XL'] as const)('shows auto text at %s', (size) => {
      expect(isCpiLabelVisible(size)).toBe(true);
    });

    it.each(['2XS', 'XS', 'S', 'M'] as const)('hides auto text below L at %s', (size) => {
      expect(isCpiLabelVisible(size)).toBe(false);
    });
  });

  describe('isCpiTextContentVisible', () => {
    it('does not render percentage text below size L (Figma — matches web)', () => {
      expect(isCpiTextContentVisible('text', 'M')).toBe(false);
      expect(isCpiTextContentVisible('text', 'S')).toBe(false);
      expect(isCpiTextContentVisible('text', '2XS')).toBe(false);
    });

    it('renders percentage text at size L and above', () => {
      expect(isCpiTextContentVisible('text', 'L')).toBe(true);
      expect(isCpiTextContentVisible('text', '3XL')).toBe(true);
      expect(isCpiTextContentVisible('text', '5XL')).toBe(true);
    });

    it('returns false when content is not text', () => {
      expect(isCpiTextContentVisible('icon', 'L')).toBe(false);
      expect(isCpiTextContentVisible('none', 'L')).toBe(false);
    });
  });

  describe('isCpiIconContentVisible', () => {
    it('shows icons at L when children are provided', () => {
      expect(isCpiIconContentVisible('icon', {})).toBe(true);
    });

    it.each(['2XS', 'XS', 'S', 'M', 'L', 'XL', '5XL'] as const)(
      'shows icons at every size including %s',
      (size) => {
        const state = useCircularProgressIndicatorState({
          size,
          content: 'icon',
          value: 50,
          children: {},
        });
        expect(isCpiIconContentVisible(state.resolvedContent, {})).toBe(true);
      }
    );

    it('hides icon slot when content is not icon', () => {
      expect(isCpiIconContentVisible('text', {})).toBe(false);
      expect(isCpiIconContentVisible('none', {})).toBe(false);
    });

    it('hides icon slot when children are omitted', () => {
      expect(isCpiIconContentVisible('icon', undefined)).toBe(false);
      expect(isCpiIconContentVisible('icon', null)).toBe(false);
    });
  });

  describe('content="text" below size L', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'development');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
      vi.restoreAllMocks();
    });

    it.each(['2XS', 'XS', 'S', 'M'] as const)('warns in development at size %s', (size) => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      useCircularProgressIndicatorState({
        size,
        content: 'text',
        value: 50,
      });
      expect(warn.mock.calls[0]?.[0]).toMatch(/content="text".*only renders at size L and above/);
    });

    it('does not warn at size L', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      useCircularProgressIndicatorState({
        size: 'L',
        content: 'text',
        value: 50,
      });
      expect(warn).not.toHaveBeenCalled();
    });
  });

  describe('content="icon" without children', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'development');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
      vi.restoreAllMocks();
    });

    it('warns in development', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      useCircularProgressIndicatorState({
        size: 'L',
        content: 'icon',
        value: 50,
      });
      expect(warn.mock.calls[0]?.[0]).toMatch(/content="icon" requires `children`/);
    });
  });
});
