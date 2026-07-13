/**
 * Voice Tone Guard — Evaluation Regression Tests (Level 1)
 *
 * Runs reference answers from the QnA bank through runToneGuard()
 * to catch regressions in deterministic tone guard checks.
 *
 * Zero LLM calls. Pure deterministic. Runs in CI on every PR.
 */

import { describe, it, expect } from 'vitest';
import { runToneGuard } from '../voiceToneGuard';
import { TEST_VOICE_CONFIG } from './fixtures/voiceTestConfig';
import type { EvalScenario, ToneGuardResult } from '../voiceTypes';
import scenarios from './fixtures/voiceEvalScenarios.json';

const typedScenarios = scenarios as EvalScenario[];

// ============================================
// Helpers
// ============================================

function getChannel(scenario: EvalScenario): string | undefined {
  const msg = scenario.userMessage;
  if (msg.includes('[SMS channel]')) return 'sms';
  if (msg.includes('[IVR channel]')) return 'ivr';
  if (msg.includes('[WhatsApp channel]')) return 'whatsapp';
  if (msg.includes('[Proactive alert]')) return 'app';
  return 'app'; // default channel
}

// ============================================
// Regression: reference answers pass tone guard
// ============================================

describe('voiceToneGuard — reference answer regression', () => {
  const withAnswers = typedScenarios.filter((s) => s.referenceAnswer);

  it(`should have ${typedScenarios.length} scenarios loaded`, () => {
    expect(typedScenarios.length).toBe(60);
  });

  describe.each(
    withAnswers.map((s) => [s.scenarioId, s] as const)
  )('%s', (_id, scenario) => {
    let result: ToneGuardResult;

    const channel = getChannel(scenario);

    // Run tone guard once per scenario
    result = runToneGuard(scenario.referenceAnswer!, TEST_VOICE_CONFIG, channel);

    it('should score >= 80', () => {
      expect(result.score).toBeGreaterThanOrEqual(80);
    });

    it('should pass forbidden words check', () => {
      const check = result.checks.find((c) => c.id === 'forbidden-words');
      if (check) expect(check.passed).toBe(true);
    });

    it('should pass exclamation marks check', () => {
      const check = result.checks.find((c) => c.id === 'exclamation-marks');
      if (check) expect(check.passed).toBe(true);
    });

    it('should pass em dashes check', () => {
      const check = result.checks.find((c) => c.id === 'em-dashes');
      if (check) expect(check.passed).toBe(true);
    });

    it('should pass scripted sympathy check', () => {
      const check = result.checks.find((c) => c.id === 'scripted-sympathy');
      if (check) expect(check.passed).toBe(true);
    });

    it('should pass opening phrases check', () => {
      const check = result.checks.find((c) => c.id === 'opening-phrases');
      if (check) expect(check.passed).toBe(true);
    });

    it('should pass closing phrases check', () => {
      const check = result.checks.find((c) => c.id === 'closing-phrases');
      if (check) expect(check.passed).toBe(true);
    });

    it('should pass formatting structure check', () => {
      const check = result.checks.find((c) => c.id === 'formatting-structure');
      if (check) expect(check.passed).toBe(true);
    });
  });
});

// ============================================
// Category breakdown — summary stats
// ============================================

describe('voiceToneGuard — category summary', () => {
  const categories = ['service', 'emotion', 'safety', 'language', 'tone'];

  for (const category of categories) {
    it(`${category} scenarios average score >= 85`, () => {
      const catScenarios = typedScenarios.filter(
        (s) => s.category === category && s.referenceAnswer
      );
      if (catScenarios.length === 0) return; // skip if no scenarios in category

      const scores = catScenarios.map((s) => {
        const channel = getChannel(s);
        return runToneGuard(s.referenceAnswer!, TEST_VOICE_CONFIG, channel).score;
      });

      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      expect(avg).toBeGreaterThanOrEqual(85);
    });
  }
});
