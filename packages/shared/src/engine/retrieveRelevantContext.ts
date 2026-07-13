/**
 * retrieveRelevantContext.ts
 *
 * Pure merge / de-dupe layer for the Design Composition Agent's hybrid RAG
 * (RFC 0002). Sits between the Convex `compositionRetrieval.search` action
 * and `assembleContextPack`:
 *
 *   Convex search result  →  retrieveRelevantContext()  →  assembleContextPack()
 *
 * Responsibilities:
 *   1. Merge invariants (always-on core rules) with retrieved rules.
 *   2. De-dupe retrieved refs against whatever the resolved skill pack
 *      already contributed.
 *   3. Ignore retrieved skills when the caller pinned a skillId.
 *   4. Emit a `RetrievalTrace` so the playground / evaluation UI can show
 *      why each piece ended up in the prompt.
 *
 * This function is PURE — no IO. The Convex action does the search; the
 * Next.js route composes. Tested directly with fixture inputs.
 */

import type {
  BrandVertical,
  CompositionContext,
  CompositionRule,
  CompositionSkill,
  ReferenceScreen,
  ScoredReference,
} from './compositionTypes';

// ============================================================================
// Public surface
// ============================================================================

/**
 * Tier 1 invariants — these sectionIds MUST appear in every prompt regardless
 * of retrieval scores. The list is intentionally small; adding to it moves
 * content from "retrieved on demand" to "always sent", which costs prompt
 * budget on every generation.
 */
export const INVARIANT_SECTION_IDS: readonly string[] = [
  'layout-structure',
  'surface-application',
  'typography-hierarchy',
  'component-selection',
  'accessibility-layout',
] as const;

export interface RuleSearchHit {
  /** Opaque id (Convex Id<'compositionRules'> stringified). */
  id: string;
  score: number;
  sectionId: string;
  title: string;
  content: string;
  priority: number;
  scope: 'base' | 'brand';
  isActive: boolean;
  version: number;
  contexts?: string[];
  vertical?: string;
}

export interface ReferenceSearchHit {
  id: string;            // Id<'referenceAnalyses'>
  screenId: string;      // Id<'referenceScreens'>
  score: number;
  summary: string;
  archetype?: string;
  vertical?: string;
  context?: string;
}

export interface SkillSearchHit {
  id: string;
  score: number;
  skillId: string;
  name: string;
  description: string;
  archetype?: string;
  vertical?: string;
}

export interface SearchPayload {
  rules: RuleSearchHit[];
  references: ReferenceSearchHit[];
  skills: SkillSearchHit[];
}

export interface RetrievalTraceEntry {
  kind: 'rule' | 'reference' | 'skill';
  id: string;
  score: number;
  /** Why this entry was kept (or demoted). */
  reason: string;
}

export interface RetrievalTrace {
  /** Top-level explanation of the retrieval run (budget, filters used). */
  summary: string;
  kept: RetrievalTraceEntry[];
  dropped: RetrievalTraceEntry[];
}

export interface RetrieveRelevantContextInput {
  /** Raw search payload from Convex `compositionRetrieval.search`. */
  search: SearchPayload;
  /** Complete brand rule set (base + brand). Used to resolve invariants
   *  from their sectionId. */
  allBrandRules: CompositionRule[];
  /** Rules already coming from the pinned skill pack. If set, invariants
   *  are merged into the pack's rule list rather than into retrieved rules. */
  packRules?: CompositionRule[];
  /** References already coming from the pinned skill pack — used for
   *  de-duping retrieved references. */
  packReferences?: ScoredReference[];
  /** Map from `referenceAnalyses.screenId` to the full ReferenceScreen so
   *  retrieved references can be returned as `ScoredReference`. */
  referenceScreens: Map<string, ReferenceScreen>;
  /** Any additional references already resolved outside the pack
   *  (e.g. archetype fallback pool). De-duped against retrieval. */
  fallbackReferences?: ScoredReference[];
  /** When true, skills in the search payload are ignored — caller has
   *  a pinned skill pack and retrieved skills would fight it. */
  hasPinnedSkill?: boolean;
  /** Current composition context — used for trace annotation only. */
  context?: CompositionContext;
  /** Current vertical — used for trace annotation only. */
  vertical?: BrandVertical;
  /** Optional archetype — used for trace annotation only. */
  archetype?: string;
}

export interface RetrieveRelevantContextResult {
  /** Rules to feed into `assembleContextPack.rules` (or `pack.linkedRules`). */
  rules: CompositionRule[];
  /** References to feed into `assembleContextPack.fallbackReferences`. */
  references: ScoredReference[];
  /** Retrieved skills when no skill was pinned. Returned as lightweight
   *  objects the caller can use to look up the full row if desired. */
  skills: Array<Pick<CompositionSkill, 'skillId' | 'name' | 'description'>>;
  trace: RetrievalTrace;
}

// ============================================================================
// Implementation
// ============================================================================

export function retrieveRelevantContext(
  input: RetrieveRelevantContextInput,
): RetrieveRelevantContextResult {
  const kept: RetrievalTraceEntry[] = [];
  const dropped: RetrievalTraceEntry[] = [];

  const filters = [
    input.vertical ? `vertical=${input.vertical}` : null,
    input.archetype ? `archetype=${input.archetype}` : null,
    input.context ? `context=${input.context}` : null,
    input.hasPinnedSkill ? 'pinnedSkill=true' : null,
  ]
    .filter(Boolean)
    .join(', ');
  const summary = `Retrieved ${input.search.rules.length} rule(s), ${input.search.references.length} ref(s), ${input.search.skills.length} skill(s)${filters ? `; filters: ${filters}` : ''}.`;

  // ---------- Rules ------------------------------------------------------

  // 1) Invariants — always first, regardless of retrieval.
  const invariantRules: CompositionRule[] = [];
  const invariantIds = new Set<string>();
  for (const sectionId of INVARIANT_SECTION_IDS) {
    const match = input.allBrandRules.find((r) => r.sectionId === sectionId && r.isActive);
    if (match) {
      invariantRules.push(match);
      invariantIds.add(sectionId);
      kept.push({
        kind: 'rule',
        id: match.sectionId,
        score: 1, // invariants have implicit max score
        reason: 'invariant (always-on)',
      });
    }
  }

  // 2) Pack rules — second tier. De-duped against invariants by sectionId.
  const packRuleSectionIds = new Set<string>();
  const packRules: CompositionRule[] = [];
  if (input.packRules) {
    for (const rule of input.packRules) {
      if (invariantIds.has(rule.sectionId)) continue;
      packRuleSectionIds.add(rule.sectionId);
      packRules.push(rule);
      kept.push({
        kind: 'rule',
        id: rule.sectionId,
        score: 1,
        reason: 'skill-pack linked rule',
      });
    }
  }

  // 3) Retrieved rules — de-duped against invariants + pack; scored.
  const retrievedRules: CompositionRule[] = [];
  for (const hit of input.search.rules) {
    if (invariantIds.has(hit.sectionId)) {
      dropped.push({ kind: 'rule', id: hit.id, score: hit.score, reason: 'duplicate of invariant' });
      continue;
    }
    if (packRuleSectionIds.has(hit.sectionId)) {
      dropped.push({ kind: 'rule', id: hit.id, score: hit.score, reason: 'duplicate of pack rule' });
      continue;
    }
    retrievedRules.push({
      sectionId: hit.sectionId,
      title: hit.title,
      content: hit.content,
      priority: hit.priority,
      scope: hit.scope,
      isActive: hit.isActive,
      version: hit.version,
      contexts: hit.contexts,
      vertical: hit.vertical,
    });
    kept.push({
      kind: 'rule',
      id: hit.id,
      score: hit.score,
      reason: `retrieved (vector score ${hit.score.toFixed(3)})`,
    });
  }

  const mergedRules: CompositionRule[] = [...invariantRules, ...packRules, ...retrievedRules];

  // ---------- References -------------------------------------------------

  const packRefIds = new Set(input.packReferences?.map((r) => r.screen.id) ?? []);
  const fallbackRefIds = new Set(input.fallbackReferences?.map((r) => r.screen.id) ?? []);
  const retrievedReferences: ScoredReference[] = [];
  for (const hit of input.search.references) {
    if (packRefIds.has(hit.screenId)) {
      dropped.push({
        kind: 'reference',
        id: hit.id,
        score: hit.score,
        reason: 'duplicate of pack reference',
      });
      continue;
    }
    if (fallbackRefIds.has(hit.screenId)) {
      dropped.push({
        kind: 'reference',
        id: hit.id,
        score: hit.score,
        reason: 'duplicate of fallback reference',
      });
      continue;
    }
    const screen = input.referenceScreens.get(hit.screenId);
    if (!screen) {
      dropped.push({
        kind: 'reference',
        id: hit.id,
        score: hit.score,
        reason: 'screen row missing — skipped',
      });
      continue;
    }
    retrievedReferences.push({
      screen: {
        ...screen,
        analysisSummary: hit.summary,
      },
      score: hit.score,
      reasons: [`retrieved (vector score ${hit.score.toFixed(3)})`],
    });
    kept.push({
      kind: 'reference',
      id: hit.id,
      score: hit.score,
      reason: `retrieved (vector score ${hit.score.toFixed(3)})`,
    });
  }

  // Caller will merge these with pack + fallback references inside
  // assembleContextPack, which already de-dupes. We just hand back the
  // retrieved additions.
  const references: ScoredReference[] = [
    ...(input.fallbackReferences ?? []),
    ...retrievedReferences,
  ];

  // ---------- Skills -----------------------------------------------------

  const skills: Array<Pick<CompositionSkill, 'skillId' | 'name' | 'description'>> = [];
  if (input.hasPinnedSkill) {
    for (const hit of input.search.skills) {
      dropped.push({
        kind: 'skill',
        id: hit.id,
        score: hit.score,
        reason: 'skill was pinned — retrieval disabled',
      });
    }
  } else {
    for (const hit of input.search.skills) {
      skills.push({
        skillId: hit.skillId,
        name: hit.name,
        description: hit.description,
      });
      kept.push({
        kind: 'skill',
        id: hit.id,
        score: hit.score,
        reason: `retrieved (vector score ${hit.score.toFixed(3)})`,
      });
    }
  }

  return {
    rules: mergedRules,
    references,
    skills,
    trace: { summary, kept, dropped },
  };
}
