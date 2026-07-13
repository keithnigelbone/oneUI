import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { ExperienceBuilderEventT } from '@oneui/experience-builder-core';
import { AgentWorkbench } from '../_chat/parts/AgentWorkbench';

function step(stepName: string, status: 'queued' | 'started' | 'completed'): ExperienceBuilderEventT {
  return { type: 'step', runId: 'run-1', step: stepName, status, at: Date.now() } as ExperienceBuilderEventT;
}

describe('AgentWorkbench compact default view', () => {
  it('shows compact loading feedback and keeps the debug workbench behind the details action', () => {
    render(
      <AgentWorkbench
        status="running"
        outcome="pending"
        events={[
          step('plan', 'completed'),
          step('design', 'started'),
          step('copy', 'queued'),
        ]}
      />,
    );

    expect(screen.getByTestId('agent-workbench')).toBeTruthy();
    expect(screen.getByTestId('agent-loading-dots')).toBeTruthy();
    expect(screen.getByLabelText('Generation details')).toBeTruthy();
    expect(screen.queryByText('Experience generation')).toBeNull();
    expect(screen.queryByText('Select layout')).toBeNull();
    expect(screen.queryByText('Intent')).toBeNull();
  });
});
