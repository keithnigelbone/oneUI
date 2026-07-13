import { describe, expect, it } from 'vitest';
import { getModalAccessibilityProps } from './interface';

describe('Modal accessibility', () => {
  it('maps aria-label to accessibilityLabel', () => {
    const props = getModalAccessibilityProps(
      { 'aria-label': 'Information' },
      { showHeader: false, showTitle: false }
    );
    expect(props.accessibilityLabel).toBe('Information');
    expect(props.accessibilityRole).toBe('alert');
    expect(props.accessible).toBe(true);
    expect(props.accessibilityModal).toBe(true);
  });

  it('falls back to title when aria-label is missing and title is visible', () => {
    const props = getModalAccessibilityProps(
      { title: 'Dialog Title' },
      { showHeader: true, showTitle: true }
    );
    expect(props.accessibilityLabel).toBe('Dialog Title');
  });

  it('does not fallback to title if showTitle is false', () => {
    const props = getModalAccessibilityProps(
      { title: 'Dialog Title' },
      { showHeader: true, showTitle: false }
    );
    expect(props.accessibilityLabel).toBeUndefined();
  });

  it('forwards accessibilityHint', () => {
    const props = getModalAccessibilityProps(
      { 'aria-label': 'Information', accessibilityHint: 'Double tap to close' },
      { showHeader: false, showTitle: false }
    );
    expect(props.accessibilityHint).toBe('Double tap to close');
  });
});
