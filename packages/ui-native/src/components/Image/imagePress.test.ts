import { describe, expect, it, vi } from 'vitest';
import { resolveImagePressHandler } from './interface';

describe('resolveImagePressHandler', () => {
  it('returns undefined when no handlers are provided', () => {
    expect(resolveImagePressHandler()).toBeUndefined();
    expect(resolveImagePressHandler({})).toBeUndefined();
  });

  it('returns onPress when only onPress is provided', () => {
    const onPress = vi.fn();
    const handler = resolveImagePressHandler({ onPress });
    handler?.();
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('returns onClick when only onClick is provided', () => {
    const onClick = vi.fn();
    const handler = resolveImagePressHandler({ onClick });
    handler?.();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('invokes both handlers when onPress and onClick are provided', () => {
    const onPress = vi.fn();
    const onClick = vi.fn();
    const handler = resolveImagePressHandler({ onPress, onClick });
    handler?.();
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onPress before onClick when both are provided', () => {
    const order: string[] = [];
    const handler = resolveImagePressHandler({
      onPress: () => order.push('press'),
      onClick: () => order.push('click'),
    });
    handler?.();
    expect(order).toEqual(['press', 'click']);
  });
});
