/**
 * contextPack.ts
 *
 * Pure assembly function for the Design Composition Agent's external
 * context-pack API. An external LLM (Claude Code via MCP, Cursor, a code-gen
 * bot) calls `getDesignContext({ vertical, archetype, context, brand })` and
 * this function is what stitches the response together from:
 *
 *   - compiled composition rules (existing compileCompositionRules)
 *   - a resolved skill pack (rules + references + do's/don'ts + attention)
 *   - top-k reference screens + their analyses
 *   - citable token + skill ids so downstream tools can trace claims
 *
 * Design constraints:
 *   - Stays pure: caller loads Convex rows, passes them in.
 *   - Char-budgets the output so the external LLM doesn't get "lost in the
 *     middle". Long reference analyses are summarised to a pointer line when
 *     the running total exceeds the budget.
 *   - Emits image URLs + metadata alongside the prompt text so the client can
 *     pass them as vision blocks.
 */

import { renderReferencePrecedent } from './referenceResolver';
import type {
  BrandVertical,
  CompiledCompositionPrompt,
  CompositionConfig,
  CompositionContext,
  CompositionRule,
  CompositionSkill,
  ReferenceScreen,
  ScoredReference,
} from './compositionTypes';
import { compileCompositionRules } from './compositionCompiler';
import { PLAYGROUND_COMPONENT_ALLOWLIST, PLAYGROUND_ICON_NAMES } from './compositionCodePrompt';
import type { RetrievalTrace } from './retrieveRelevantContext';

export interface SkillPack {
  /** The skill itself (serialisable subset — no Convex Ids). */
  skill: Pick<
    CompositionSkill,
    'skillId' | 'name' | 'description' | 'category' | 'systemPromptTemplate' | 'applicableContexts'
  > & {
    archetype?: string;
    vertical?: BrandVertical;
    dosDonts?: string[];
    attentionPattern?: string;
  };
  /** Rules linked to this pack (already resolved base/brand merge). */
  linkedRules: CompositionRule[];
  /** References the designer curated for this pack, scored / weighted. */
  curatedReferences: ScoredReference[];
}

export interface ContextPackImage {
  screenId: string;
  name: string;
  archetype: string;
  /** Signed / public URL the external LLM fetches for vision input. */
  url: string;
  mimeType: string;
}

export interface ContextPackInput {
  brandName: string;
  vertical?: BrandVertical;
  archetype?: string;
  context: CompositionContext;
  /** Full set of brand rules (base + brand merged). */
  rules: CompositionRule[];
  /** Brand composition config (vertical + personality). */
  config: CompositionConfig;
  /** Optional component-reference markdown (may be empty to save budget). */
  componentRef?: string;
  /** Brand summary from foundations (fonts, colours) — kept short. */
  brandSummary?: string;
  /** Optional compiled tone-of-voice prompt for UI copy and labels. */
  voicePrompt?: string;
  /** The skill pack the resolver picked, if any. */
  pack?: SkillPack;
  /** Archetype-tagged references outside the pack (fallback pool). */
  fallbackReferences?: ScoredReference[];
  /** Image URLs for the references that made it into the prompt. */
  images: ContextPackImage[];
  /** Hard char budget for the final prompt. Default 12_000. */
  charBudget?: number;
  /**
   * Raw user intent (the prompt that triggered retrieval) — folded into the
   * cache hash so two requests with the same brand/context but different
   * prompts don't collide, and surfaced in telemetry. Optional because the
   * MCP/context-pack contract still supports brand-only packs (no prompt).
   */
  userPrompt?: string;
  /**
   * Trace returned by `retrieveRelevantContext`. Passed through unchanged so
   * the playground / evaluation UI can render the "what was retrieved and
   * why" panel without re-running retrieval.
   */
  retrievalTrace?: RetrievalTrace;
}

export interface ContextPackResult {
  /** System-prompt-ready markdown. Already includes Visual Precedent. */
  systemPrompt: string;
  /** Signed image URLs to attach as vision blocks. */
  images: ContextPackImage[];
  /** Skill + rule + reference ids the pack cites so downstream can trace. */
  citedSkillIds: string[];
  citedRuleSectionIds: string[];
  citedReferenceScreenIds: string[];
  /** Tokens the prompt explicitly references (derived heuristically). */
  citedTokens: string[];
  /** Size in characters (final, post-budget). */
  size: number;
  /** Compiled hash — external clients use it as a cache key. */
  hash: string;
  /** Runtime component/icon allowlists enforced by the playground. */
  playgroundContract: {
    components: readonly string[];
    icons: readonly string[];
  };
  /** Warnings raised during assembly (budget trim, missing analysis, …). */
  warnings: string[];
  /**
   * Echoes `input.retrievalTrace` so downstream UIs can render retrieval
   * decisions without re-running the search. Absent when the caller didn't
   * run retrieval (deterministic / legacy path).
   */
  retrievalTrace?: RetrievalTrace;
}

const DEFAULT_CHAR_BUDGET = 12_000;

/** Very rough token-ish heuristic scan: pull anything that looks like
 *  `var(--Foo-Bar)` or a `Spacing-*` / `Typography-*` reference. */
function extractCitedTokens(text: string): string[] {
  const seen = new Set<string>();
  const re = /var\(--([A-Za-z][A-Za-z0-9-]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) seen.add(m[1]);
  return [...seen].sort();
}

/** djb2 — deterministic 32-bit hash, hex output. */
function djb2(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) hash = ((hash << 5) + hash + input.charCodeAt(i)) >>> 0;
  return hash.toString(16);
}

/**
 * Assemble a context pack. Takes pre-loaded Convex rows — no IO.
 */
export function assembleContextPack(input: ContextPackInput): ContextPackResult {
  const charBudget = input.charBudget ?? DEFAULT_CHAR_BUDGET;
  const warnings: string[] = [];

  // 1) Pack-sourced refs beat fallback refs; de-dupe by id.
  const packRefs = input.pack?.curatedReferences ?? [];
  const fallbackRefs = (input.fallbackReferences ?? []).filter(
    (r) => !packRefs.some((p) => p.screen.id === r.screen.id),
  );
  const mergedRefs = [...packRefs, ...fallbackRefs];

  // 2) Scope rules: if the pack lists linkedRules, honour that narrow set;
  //    otherwise keep the full brand rule set and let the compiler filter
  //    by context / vertical.
  const rulesForCompile = input.pack?.linkedRules?.length
    ? input.pack.linkedRules
    : input.rules;

  // 3) Compile the base prompt via the existing composition compiler.
  const compiled: CompiledCompositionPrompt = compileCompositionRules(
    rulesForCompile,
    input.config,
    input.componentRef ?? '',
    input.brandSummary ?? '',
    input.pack ? [asCompositionSkill(input.pack.skill)] : undefined,
    input.context,
    { references: mergedRefs },
  );

  // 4) Append skill-pack specifics that the compiler doesn't already render.
  const extras: string[] = [];
  if (input.pack) {
    extras.push('## Skill Pack', '');
    extras.push(`**Skill:** ${input.pack.skill.name} (${input.pack.skill.skillId})`);
    if (input.pack.skill.archetype) extras.push(`**Archetype:** ${input.pack.skill.archetype}`);
    if (input.pack.skill.vertical) extras.push(`**Vertical:** ${input.pack.skill.vertical}`);
    extras.push('');
    if (input.pack.skill.attentionPattern) {
      extras.push(`**Attention recipe:** ${input.pack.skill.attentionPattern}`, '');
    }
    if (input.pack.skill.dosDonts?.length) {
      extras.push('**Do / Don\'t:**');
      for (const d of input.pack.skill.dosDonts) extras.push(`- ${d}`);
      extras.push('');
    }
  }
  extras.push('## Playground Runtime Contract', '');
  extras.push(
    'Generated UI must render as TSX against `@oneui/playground`; use only the components and semantic icons listed here. The strict render gate blocks raw colours, raw dimensions, legacy tokens, missing root Surface, invalid Surface modes, broken Image sources, and unknown components/icons.',
  );
  extras.push('');
  extras.push(`Components: ${PLAYGROUND_COMPONENT_ALLOWLIST.join(', ')}`);
  extras.push('');
  extras.push(`Icons: ${PLAYGROUND_ICON_NAMES.join(', ')}`);
  extras.push('');
  if (input.voicePrompt?.trim()) {
    extras.push('## Brand Tone of Voice', '');
    extras.push(input.voicePrompt.trim());
    extras.push('');
  }
  const assembled = [compiled.prompt.trimEnd(), '', ...extras].join('\n');

  // 5) Budget enforcement — if over, trim reference analysis summaries first
  //    (they're the biggest chunks) and fall back to a pointer line.
  let finalPrompt = assembled;
  if (assembled.length > charBudget) {
    warnings.push(
      `Prompt size ${assembled.length}c exceeds budget ${charBudget}c — trimming analyses.`,
    );
    const trimmedRefs = mergedRefs.map((r) => ({
      ...r,
      screen: {
        ...r.screen,
        analysisSummary: r.screen.analysisSummary
          ? summariseAnalysisToPointer(r.screen)
          : undefined,
      },
    }));
    const recompiled = compileCompositionRules(
      rulesForCompile,
      input.config,
      '', // drop component ref to save budget
      input.brandSummary ?? '',
      input.pack ? [asCompositionSkill(input.pack.skill)] : undefined,
      input.context,
      { references: trimmedRefs },
    );
    finalPrompt = [recompiled.prompt.trimEnd(), '', ...extras].join('\n');
  }

  const citedSkillIds = input.pack ? [input.pack.skill.skillId] : [];
  const citedRuleSectionIds = rulesForCompile.map((r) => r.sectionId);
  const citedReferenceScreenIds = mergedRefs.map((r) => r.screen.id);
  const citedTokens = extractCitedTokens(finalPrompt);

  // userPromptHash is folded into the cache key so the same brand/context
  // yields distinct caches across different retrieval queries. We hash the
  // prompt separately so clients can pre-compute the cache key without
  // leaking the raw prompt text into logs.
  const userPromptHash = input.userPrompt ? djb2(input.userPrompt.trim()) : '';
  const hashInput = [
    input.brandName,
    input.context,
    input.vertical ?? '',
    input.archetype ?? '',
    compiled.hash,
    citedReferenceScreenIds.join(','),
    citedSkillIds.join(','),
    userPromptHash,
    input.voicePrompt ? djb2(input.voicePrompt.trim()) : '',
  ].join('|');

  return {
    systemPrompt: finalPrompt,
    images: input.images,
    citedSkillIds,
    citedRuleSectionIds,
    citedReferenceScreenIds,
    citedTokens,
    size: finalPrompt.length,
    hash: djb2(hashInput),
    playgroundContract: {
      components: PLAYGROUND_COMPONENT_ALLOWLIST,
      icons: PLAYGROUND_ICON_NAMES,
    },
    warnings,
    retrievalTrace: input.retrievalTrace,
  };
}

/** Drop a long analysis to a one-line pointer while keeping the screen's
 *  structured notes (designer-authored) intact. */
function summariseAnalysisToPointer(screen: ReferenceScreen): string {
  const tokens = screen.tokensObserved?.slice(0, 6).join(', ') ?? '';
  const hint = screen.attentionNotes ?? '';
  return [
    `(Full analysis available on request — key tokens: ${tokens || '—'}.`,
    hint ? ` Attention: ${hint})` : ')',
  ].join('');
}

/** SkillPack carries a partial CompositionSkill; coerce to the full shape
 *  the existing compiler expects. Harmless on the prompt since the compiler
 *  only reads name/description/examples/applicableContexts/isActive. */
function asCompositionSkill(
  pack: SkillPack['skill'],
): CompositionSkill {
  return {
    skillId: pack.skillId,
    name: pack.name,
    description: pack.description,
    category: pack.category,
    systemPromptTemplate: pack.systemPromptTemplate,
    applicableContexts: pack.applicableContexts,
    examples: [],
    isActive: true,
    version: 1,
  };
}
