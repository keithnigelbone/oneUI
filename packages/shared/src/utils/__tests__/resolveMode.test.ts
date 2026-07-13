/**
 * resolveMode.test.ts
 *
 * Fixture-based tests for the generic mode resolver. Uses a miniature
 * version of the platform's NAVIGATION_MODES shape so the test stays
 * independent of the UI package.
 */

import { describe, expect, it } from 'vitest';
import { resolveModeFromPath, type ModeWithPrefixes } from '../resolveMode';

type TestMode = 'home' | 'build' | 'system' | 'agents';

const MODES: Record<TestMode, ModeWithPrefixes> = {
  home: { pathPrefixes: ['/chat'] },
  build: { pathPrefixes: ['/canvas', '/create'] },
  system: { pathPrefixes: ['/brand', '/foundations', '/components'] },
  agents: { pathPrefixes: ['/agents'] },
};

// Longest-prefix-first so /agents doesn't fall through to system.
const ORDER: readonly TestMode[] = ['agents', 'build', 'system', 'home'];

function resolve(pathname: string): TestMode {
  return resolveModeFromPath<TestMode>(pathname, MODES, ORDER, 'home');
}

describe('resolveModeFromPath', () => {
  it('maps exact prefix matches to their owning mode', () => {
    expect(resolve('/agents')).toBe('agents');
    expect(resolve('/canvas')).toBe('build');
    expect(resolve('/create')).toBe('build');
    expect(resolve('/brand')).toBe('system');
    expect(resolve('/foundations')).toBe('system');
    expect(resolve('/components')).toBe('system');
    expect(resolve('/chat')).toBe('home');
  });

  it('matches nested routes under a prefix', () => {
    expect(resolve('/agents/tone-of-voice')).toBe('agents');
    expect(resolve('/agents/tone-of-voice/playground')).toBe('agents');
    expect(resolve('/brand/overview')).toBe('system');
    expect(resolve('/foundations/typography')).toBe('system');
    expect(resolve('/components/button/editor')).toBe('system');
    expect(resolve('/canvas/123')).toBe('build');
    expect(resolve('/create/start-here')).toBe('build');
    expect(resolve('/chat/abc-123')).toBe('home');
  });

  it('falls back to home for "/" and unrecognised paths', () => {
    expect(resolve('/')).toBe('home');
    expect(resolve('')).toBe('home');
    expect(resolve('/unknown')).toBe('home');
    expect(resolve('/foo/bar')).toBe('home');
  });

  it('does NOT match a prefix at a path boundary it does not own', () => {
    // '/agents' should NOT match '/agentsx' or '/agentsfoo'
    expect(resolve('/agentsx')).toBe('home');
    expect(resolve('/agentsfoo/bar')).toBe('home');
    // Same for other prefixes
    expect(resolve('/brandbook')).toBe('home');
    expect(resolve('/foundationsx')).toBe('home');
  });

  it('honours resolution order — agents wins over a hypothetical shared prefix', () => {
    const SHARED: Record<TestMode, ModeWithPrefixes> = {
      home: { pathPrefixes: ['/chat'] },
      build: { pathPrefixes: ['/canvas'] },
      // system also claims /agents — unusual, but verifies order matters
      system: { pathPrefixes: ['/brand', '/agents'] },
      agents: { pathPrefixes: ['/agents'] },
    };
    // With agents first in the order, /agents resolves to agents
    expect(
      resolveModeFromPath<TestMode>('/agents', SHARED, ['agents', 'system', 'build', 'home'], 'home'),
    ).toBe('agents');
    // Flip the order — system wins
    expect(
      resolveModeFromPath<TestMode>('/agents', SHARED, ['system', 'agents', 'build', 'home'], 'home'),
    ).toBe('system');
  });

  it('skips empty prefixes without crashing', () => {
    const WITH_EMPTY: Record<TestMode, ModeWithPrefixes> = {
      home: { pathPrefixes: ['', '/chat'] },
      build: { pathPrefixes: [] },
      system: { pathPrefixes: ['/brand'] },
      agents: { pathPrefixes: ['/agents'] },
    };
    expect(
      resolveModeFromPath<TestMode>('/brand/overview', WITH_EMPTY, ORDER, 'home'),
    ).toBe('system');
    expect(resolveModeFromPath<TestMode>('/', WITH_EMPTY, ORDER, 'home')).toBe('home');
  });

  it('uses the fallback when resolutionOrder is empty', () => {
    expect(
      resolveModeFromPath<TestMode>('/agents/tone-of-voice', MODES, [], 'home'),
    ).toBe('home');
  });
});
