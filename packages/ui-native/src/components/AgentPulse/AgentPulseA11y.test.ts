import { describe, expect, it } from 'vitest';
import { getAgentPulseAccessibilityProps, AGENT_PULSE_DEFAULT_LABEL } from './interface';

describe('AgentPulse accessibility', () => {
  it('maps default labels correctly', () => {
    const props = getAgentPulseAccessibilityProps({ state: 'thinking' });
    expect(props.accessibilityLabel).toBe(AGENT_PULSE_DEFAULT_LABEL.thinking);
    expect(props.accessibilityRole).toBe('status');
  });

  it('allows overriding the label', () => {
    const props = getAgentPulseAccessibilityProps({
      state: 'listening',
      label: 'Custom listening label',
    });
    expect(props.accessibilityLabel).toBe('Custom listening label');
  });

  it('maps aria-live to accessibilityLiveRegion', () => {
    const props = getAgentPulseAccessibilityProps({
      'aria-live': 'assertive',
    });
    expect(props.accessibilityLiveRegion).toBe('assertive');
  });

  it('maps aria-live="off" to "none"', () => {
    const props = getAgentPulseAccessibilityProps({
      'aria-live': 'off',
    });
    expect(props.accessibilityLiveRegion).toBe('none');
  });
});
