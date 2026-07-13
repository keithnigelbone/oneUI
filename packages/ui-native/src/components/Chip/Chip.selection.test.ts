import { describe, expect, it, vi } from 'vitest';
import { invokeChipSelectedChange } from './interface';

describe('invokeChipSelectedChange', () => {
  it('forwards selected state and event details', () => {
    const onSelectedChange = vi.fn();
    const eventDetails = { nativeEvent: { timestamp: 42, pageX: 10, pageY: 20 } };

    invokeChipSelectedChange(onSelectedChange, true, eventDetails);

    expect(onSelectedChange).toHaveBeenCalledTimes(1);
    expect(onSelectedChange).toHaveBeenCalledWith(true, eventDetails);
  });

  it('forwards deselection with event details', () => {
    const onSelectedChange = vi.fn();
    const eventDetails = { nativeEvent: { timestamp: 99 } };

    invokeChipSelectedChange(onSelectedChange, false, eventDetails);

    expect(onSelectedChange).toHaveBeenCalledWith(false, eventDetails);
  });

  it('no-ops when callback is omitted', () => {
    expect(() => invokeChipSelectedChange(undefined, true, { nativeEvent: {} })).not.toThrow();
  });
});
