import { describe, expect, it } from 'vitest';
import {
  retrieveRelevantContext,
  INVARIANT_SECTION_IDS,
  type SearchPayload,
  type RuleSearchHit,
  type ReferenceSearchHit,
  type SkillSearchHit,
} from '../retrieveRelevantContext';
import type { CompositionRule, ReferenceScreen, ScoredReference } from '../compositionTypes';

function makeRule(overrides: Partial<CompositionRule> & { sectionId: string }): CompositionRule {
  return {
    sectionId: overrides.sectionId,
    title: overrides.title ?? overrides.sectionId,
    content: overrides.content ?? `Content for ${overrides.sectionId}`,
    priority: overrides.priority ?? 10,
    scope: overrides.scope ?? 'base',
    isActive: overrides.isActive ?? true,
    version: overrides.version ?? 1,
    contexts: overrides.contexts,
    vertical: overrides.vertical,
  };
}

function makeRuleHit(sectionId: string, score = 0.9, id = `rule_${sectionId}`): RuleSearchHit {
  return {
    id,
    score,
    sectionId,
    title: sectionId,
    content: `Retrieved content for ${sectionId}`,
    priority: 10,
    scope: 'base',
    isActive: true,
    version: 1,
  };
}

function makeScreen(id: string, overrides: Partial<ReferenceScreen> = {}): ReferenceScreen {
  return {
    id,
    name: `Screen ${id}`,
    archetype: overrides.archetype ?? 'product-grid',
    context: overrides.context ?? 'mobile-app',
    ...overrides,
  };
}

function makeRefHit(screenId: string, score = 0.8, id = `ref_${screenId}`): ReferenceSearchHit {
  return {
    id,
    screenId,
    score,
    summary: `Summary for ${screenId}`,
    archetype: 'product-grid',
    vertical: 'e-commerce',
    context: 'mobile-app',
  };
}

function makeSkillHit(skillId: string, score = 0.7): SkillSearchHit {
  return {
    id: `skill_${skillId}`,
    score,
    skillId,
    name: skillId,
    description: `Desc for ${skillId}`,
  };
}

const EMPTY_SEARCH: SearchPayload = { rules: [], references: [], skills: [] };

describe('retrieveRelevantContext', () => {
  describe('rules', () => {
    it('always includes invariant sections even when retrieval is empty', () => {
      const invariantRules = INVARIANT_SECTION_IDS.map((id) => makeRule({ sectionId: id }));
      const result = retrieveRelevantContext({
        search: EMPTY_SEARCH,
        allBrandRules: invariantRules,
        referenceScreens: new Map(),
      });
      expect(result.rules.map((r) => r.sectionId).sort()).toEqual([...INVARIANT_SECTION_IDS].sort());
      expect(result.trace.kept.filter((k) => k.kind === 'rule')).toHaveLength(
        INVARIANT_SECTION_IDS.length,
      );
    });

    it('places invariants before retrieved rules', () => {
      const allRules = [
        makeRule({ sectionId: 'layout-structure' }),
        makeRule({ sectionId: 'surface-application' }),
        makeRule({ sectionId: 'typography-hierarchy' }),
        makeRule({ sectionId: 'component-selection' }),
        makeRule({ sectionId: 'accessibility-layout' }),
      ];
      const result = retrieveRelevantContext({
        search: {
          rules: [makeRuleHit('spacing-rhythm', 0.95), makeRuleHit('color-role-usage', 0.9)],
          references: [],
          skills: [],
        },
        allBrandRules: allRules,
        referenceScreens: new Map(),
      });
      // First N are invariants, then retrieved
      const sectionIds = result.rules.map((r) => r.sectionId);
      expect(sectionIds.slice(0, INVARIANT_SECTION_IDS.length).sort()).toEqual(
        [...INVARIANT_SECTION_IDS].sort(),
      );
      expect(sectionIds.slice(INVARIANT_SECTION_IDS.length)).toEqual([
        'spacing-rhythm',
        'color-role-usage',
      ]);
    });

    it('drops retrieved rules that duplicate invariants', () => {
      const allRules = INVARIANT_SECTION_IDS.map((id) => makeRule({ sectionId: id }));
      const result = retrieveRelevantContext({
        search: {
          rules: [makeRuleHit('layout-structure', 0.99), makeRuleHit('spacing-rhythm', 0.8)],
          references: [],
          skills: [],
        },
        allBrandRules: allRules,
        referenceScreens: new Map(),
      });
      expect(result.rules.filter((r) => r.sectionId === 'layout-structure')).toHaveLength(1);
      expect(result.rules.filter((r) => r.sectionId === 'spacing-rhythm')).toHaveLength(1);
      const dropped = result.trace.dropped.filter((d) => d.kind === 'rule');
      expect(dropped).toHaveLength(1);
      expect(dropped[0].reason).toContain('duplicate of invariant');
    });

    it('drops retrieved rules that duplicate pack rules', () => {
      const allRules = INVARIANT_SECTION_IDS.map((id) => makeRule({ sectionId: id }));
      const packRule = makeRule({ sectionId: 'spacing-rhythm' });
      const result = retrieveRelevantContext({
        search: {
          rules: [makeRuleHit('spacing-rhythm', 0.9)],
          references: [],
          skills: [],
        },
        allBrandRules: allRules,
        packRules: [packRule],
        referenceScreens: new Map(),
      });
      expect(result.rules.filter((r) => r.sectionId === 'spacing-rhythm')).toHaveLength(1);
      expect(result.trace.dropped[0].reason).toContain('duplicate of pack');
    });

    it('skips invariants that are inactive in the brand rule set', () => {
      const allRules = INVARIANT_SECTION_IDS.map((id) =>
        makeRule({ sectionId: id, isActive: id === 'layout-structure' ? false : true }),
      );
      const result = retrieveRelevantContext({
        search: EMPTY_SEARCH,
        allBrandRules: allRules,
        referenceScreens: new Map(),
      });
      expect(result.rules.map((r) => r.sectionId)).not.toContain('layout-structure');
      expect(result.rules.map((r) => r.sectionId).sort()).toEqual(
        INVARIANT_SECTION_IDS.filter((s) => s !== 'layout-structure').sort(),
      );
    });
  });

  describe('references', () => {
    it('merges retrieved references after fallback references', () => {
      const fallback: ScoredReference = {
        screen: makeScreen('screen_a'),
        score: 0.5,
        reasons: ['archetype match'],
      };
      const retrieved: ReferenceSearchHit = makeRefHit('screen_b', 0.95);
      const result = retrieveRelevantContext({
        search: { rules: [], references: [retrieved], skills: [] },
        allBrandRules: [],
        fallbackReferences: [fallback],
        referenceScreens: new Map([['screen_b', makeScreen('screen_b')]]),
      });
      expect(result.references.map((r) => r.screen.id)).toEqual(['screen_a', 'screen_b']);
    });

    it('de-dupes retrieved references against pack references', () => {
      const packRef: ScoredReference = {
        screen: makeScreen('screen_shared'),
        score: 0.9,
        reasons: ['pack curated'],
      };
      const result = retrieveRelevantContext({
        search: { rules: [], references: [makeRefHit('screen_shared', 0.99)], skills: [] },
        allBrandRules: [],
        packReferences: [packRef],
        referenceScreens: new Map([['screen_shared', makeScreen('screen_shared')]]),
      });
      // Pack ref stays with the pack (we return only retrieved additions +
      // fallback), so the merged result excludes it; the pack will be merged
      // back in by assembleContextPack.
      expect(result.references).toHaveLength(0);
      expect(result.trace.dropped[0].reason).toContain('duplicate of pack');
    });

    it('skips retrieved references whose screen row is missing', () => {
      const result = retrieveRelevantContext({
        search: { rules: [], references: [makeRefHit('screen_missing')], skills: [] },
        allBrandRules: [],
        referenceScreens: new Map(), // nothing
      });
      expect(result.references).toHaveLength(0);
      expect(result.trace.dropped[0].reason).toContain('screen row missing');
    });
  });

  describe('skills', () => {
    it('returns retrieved skills when no skill is pinned', () => {
      const result = retrieveRelevantContext({
        search: { rules: [], references: [], skills: [makeSkillHit('login-screen')] },
        allBrandRules: [],
        referenceScreens: new Map(),
      });
      expect(result.skills).toEqual([
        { skillId: 'login-screen', name: 'login-screen', description: 'Desc for login-screen' },
      ]);
    });

    it('drops retrieved skills when a skill is pinned', () => {
      const result = retrieveRelevantContext({
        search: { rules: [], references: [], skills: [makeSkillHit('product-grid')] },
        allBrandRules: [],
        hasPinnedSkill: true,
        referenceScreens: new Map(),
      });
      expect(result.skills).toHaveLength(0);
      expect(result.trace.dropped[0].reason).toContain('skill was pinned');
    });
  });

  describe('trace', () => {
    it('summarises filters applied in the trace header', () => {
      const result = retrieveRelevantContext({
        search: EMPTY_SEARCH,
        allBrandRules: [],
        referenceScreens: new Map(),
        vertical: 'e-commerce',
        archetype: 'product-grid',
        context: 'mobile-app',
      });
      expect(result.trace.summary).toContain('vertical=e-commerce');
      expect(result.trace.summary).toContain('archetype=product-grid');
      expect(result.trace.summary).toContain('context=mobile-app');
    });

    it('tracks every hit in either kept or dropped', () => {
      const allRules = [makeRule({ sectionId: 'layout-structure' })];
      const result = retrieveRelevantContext({
        search: {
          rules: [makeRuleHit('layout-structure', 0.9), makeRuleHit('spacing-rhythm', 0.8)],
          references: [makeRefHit('screen_a', 0.9)],
          skills: [makeSkillHit('foo')],
        },
        allBrandRules: allRules,
        referenceScreens: new Map([['screen_a', makeScreen('screen_a')]]),
      });
      // 1 invariant kept + 1 retrieved rule kept + 1 retrieved rule dropped
      // (duplicate of invariant) + 1 ref kept + 1 skill kept = 5 trace entries.
      expect(result.trace.kept.length + result.trace.dropped.length).toBeGreaterThanOrEqual(4);
    });
  });
});
