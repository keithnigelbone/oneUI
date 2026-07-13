/**
 * Design Composition Agent (DCA) executor.
 *
 * Extracted verbatim from the original /api/composition/generate route.
 * The legacy route is now a thin alias that forwards here.
 */

import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  streamText,
  type UIMessage,
} from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import {
  buildSeedRules,
  buildTSXSystemPrompt,
  buildTSXUserPrompt,
  buildTSXRevisionPrompt,
  buildTSXRepairPrompt,
  compileCompositionRules,
  evaluateCompositionDesignGate,
  formatDesignGateIssues,
  getDefaultCompositionConfig,
  normalizeCompositionAST,
  retrieveRelevantContext,
  stripTSXFences,
  validateComposition,
} from '@oneui/shared/engine';
import {
  formatValidationIssues,
  repairGeneratedCompositionCode,
  validateCompositionCode,
} from '@oneui/shared/engine/compositionCodeValidator';
import { annotateTsxWithLocations } from '@oneui/shared/engine/compositionCodeAnnotator';
import { DESIGN_MD_SPEC_ALPHA } from '@oneui/shared/engine/compositionDesignMdSpec';
import { stripJSONFences } from '@/lib/skillWriter';
import { extractText } from '@oneui/shared';
import { STORY_EXEMPLARS } from '@oneui/shared/meta';
import { CLAUDE_MODEL } from '@oneui/shared/agent';
import type {
  BrandVertical,
  CompositionConfig,
  CompositionContext,
  CompositionRule,
  CompositionSkill,
  ReferenceScreen,
  ReferenceSearchHit,
  RetrievalTrace,
  RuleSearchHit,
  SkillSearchHit,
} from '@oneui/shared/engine';
import { hydrateScreensByIds, resolveReferenceImages } from '@/lib/referenceResolver';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { isCompositionRAGEnabled, logCompositionRetrieval } from '@/lib/compositionRAG';

const VALID_CONTEXTS = new Set<CompositionContext>([
  'mobile-app',
  'web-app',
  'marketing-page',
  'social-post',
  'print',
  'outdoor',
]);

const DEFAULT_MODEL = CLAUDE_MODEL;
const MAX_STRICT_CODE_REPAIR_ATTEMPTS = 2;
const MAX_DESIGN_GATE_REPAIR_ATTEMPTS = 1;
const MAX_CODE_REFERENCE_IMAGE_BLOCKS = 0;
const DESIGN_GENERATION_TIMEOUT_MS = 75_000;
const DESIGN_REPAIR_TIMEOUT_MS = 25_000;

// Pre-joined priming preamble. The static portion (spec grammar + framing
// lines) never changes between requests, so we build it once at module load
// and concatenate the variable parts (`designMd` content, compiled prompt)
// per-request — saves ~14 KB of `Array.join` work on every primed request.
const DESIGN_MD_PREAMBLE_PREFIX = [
  '# DESIGN.md specification (Google Labs, version alpha)',
  '',
  'The user has supplied a DESIGN.md file alongside this request. Read it',
  'as the source of truth for brand tokens (colors, typography, rounded,',
  'spacing) and brand-specific rationale. When the file references a',
  'token via `{namespace.token}`, resolve it against the YAML front-matter.',
  'For any conflict between the DESIGN.md and the OneUI guidance below,',
  'the DESIGN.md wins for brand tokens and prose; OneUI guidance wins for',
  'component selection, Surface usage, and the requested output format.',
  '',
  '## Spec grammar (for reference)',
  '',
  DESIGN_MD_SPEC_ALPHA,
  '',
  '## Supplied DESIGN.md',
  '',
  '',
].join('\n');

export interface DesignAgentBody {
  messages: UIMessage[];
  brandName?: string;
  /**
   * Convex brand id. Required to activate the hybrid RAG retrieval path
   * (RFC 0002) — without it the executor falls back to the deterministic
   * compile. The brand id isn't derivable from `brandName` alone because
   * brand names aren't guaranteed unique.
   */
  brandId?: string;
  model?: string;
  context?: string;
  compiledPrompt?: string;
  rules?: CompositionRule[];
  config?: CompositionConfig;
  skills?: CompositionSkill[];
  componentRef?: string;
  /** Opt out of reference library injection (default true). */
  useReferences?: boolean;
  /** Force-include these reference screens regardless of scoring. */
  pinnedReferenceScreenIds?: string[];
  /** Archetype tag used by the resolver. */
  archetypeHint?: string;
  /** Vertical override. Falls back to config.vertical. */
  vertical?: BrandVertical;
  /** Renderer mode. `'ast'` (default) emits a JSON AST for the legacy
   *  ASTRenderer path. `'sandpack'` emits raw TSX for the new Sandpack
   *  renderer. Flipped by the playground client based on the
   *  `dca.renderer` feature flag. */
  renderer?: 'ast' | 'sandpack';
  /** Previous AST to revise, in JSON-stringified form. When present the
   *  prompt shifts from "generate" to "apply this change" — server keeps
   *  unchanged sections intact. */
  previousAST?: string;
  /** Previous TSX code to revise (sandpack mode). Mirrors `previousAST`
   *  for the code path. */
  previousCode?: string;
  /** Source location ("L42:C8") of the JSX element the user pinned on
   *  the canvas (sandpack mode). Mirrors `selectedNodeId` for the
   *  code path. */
  selectedNodeLoc?: string;
  /** Tag name of the pinned element (sandpack mode). */
  selectedNodeTag?: string;
  /** The user-supplied revision instruction. Defaults to the last user
   *  message if the client hasn't split them out. */
  revisionInstruction?: string;
  /** AST node id the user pinned on the canvas. When set alongside
   *  `previousAST`, the executor narrows the revision to that node — the
   *  prompt instructs the model to keep sibling nodes untouched. */
  selectedNodeId?: string;
  /** Resolved component type of the pinned node (post-alias), used only
   *  for the human-readable revision framing (e.g. "the Button at id
   *  `abc123`"). */
  selectedNodeType?: string;
  /**
   * Optional external DESIGN.md (Google Labs spec,
   * github.com/google-labs-code/design.md) content. When supplied, the
   * executor prepends both the spec grammar and the user's DESIGN.md to
   * the system prompt so the model reads token references (`{colors.x}`)
   * against the correct schema.
   */
  designMd?: string;
}

function isCompositionContext(value: unknown): value is CompositionContext {
  return typeof value === 'string' && VALID_CONTEXTS.has(value as CompositionContext);
}

function summarizePriorUserTurns(
  messages: UIMessage[],
  lastUserMessage: UIMessage,
): string {
  const turns = messages
    .filter((message) => message.role === 'user' && message !== lastUserMessage)
    .map((message) => extractText(message).trim())
    .filter(Boolean)
    .slice(-3);
  if (turns.length === 0) return '';
  return turns.map((turn, index) => `${index + 1}. ${turn}`).join('\n');
}

function appendRevisionContext(prompt: string, priorUserContext: string): string {
  if (!priorUserContext) return prompt;
  return [
    prompt,
    '',
    'Recent user intent from this chat:',
    priorUserContext,
    '',
    'Use this only to preserve continuity. The latest change request remains the instruction to apply.',
  ].join('\n');
}

function buildSafeFallbackTSX(prompt: string, reason: string): string {
  return `import { Surface, Container, Grid, Button, Input, Icon, Badge, Image } from '@oneui/playground';

const brief = ${JSON.stringify(prompt)};
const reason = ${JSON.stringify(reason)};
const isAuthFlow = /otp|password|login|sign\\s?in|authenticate/i.test(brief);
const isEcommerceFlow = /e-?commerce|shop|store|cart|checkout|catalog|product|deals?|grocery|marketplace/i.test(brief);
const authOptions = [
  { label: 'OTP', icon: 'lock' },
  { label: 'Password', icon: 'eyeOff' },
] as const;
const browseOptions = [
  { label: 'Featured', icon: 'grid' },
  { label: 'Deals', icon: 'sparkles' },
  { label: 'Saved', icon: 'bookmark' },
] as const;
const options = isAuthFlow ? authOptions : browseOptions;

export default function App() {
  return (
    <Surface mode="default" as="main" style={{ minHeight: '100vh', padding: 'var(--Spacing-5)', fontFamily: 'var(--Typography-Font-Primary)' }}>
      <Container variant="fixed" maxWidth="calc(var(--Spacing-40) * 2.5)" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
        <Surface mode="subtle" as="section" style={{ padding: 'var(--Spacing-5)', borderRadius: 'var(--Shape-5)', display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
          <Badge variant="ghost" appearance="neutral" size="s">Validator-safe draft</Badge>
          <h1 style={{ margin: 0, color: 'var(--Primary-High)', fontFamily: 'var(--Typography-Font-Primary)', fontSize: 'var(--Headline-M-FontSize)', lineHeight: 'var(--Headline-M-LineHeight)', fontWeight: 'var(--Headline-M-FontWeight)' }}>
            {isAuthFlow ? 'OTP and password sign in' : brief}
          </h1>
          <p style={{ margin: 0, color: 'var(--Primary-Medium-Text)', fontFamily: 'var(--Typography-Font-Primary)', fontSize: 'var(--Body-S-FontSize)', lineHeight: 'var(--Body-S-LineHeight)', fontWeight: 'var(--Body-FontWeight-Low)' }}>
            {isAuthFlow
              ? 'A clean auth screen fallback with OTP and password paths while generation repairs continue.'
              : 'The model response did not complete cleanly, so the playground opened a valid OneUI composition instead.'}
          </p>
        </Surface>

        {isEcommerceFlow && (
          <Surface mode="minimal" as="section" style={{ padding: 'var(--Spacing-3)', borderRadius: 'var(--Shape-4)', display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
            <Image src="/playground-assets/images/ecommerce-hero.svg" alt="Assorted shopping products arranged for an e-commerce hero" style={{ width: '100%', borderRadius: 'var(--Shape-3)' }} />
            <Grid columns={2} gap="var(--Spacing-3)">
              <Image src="/playground-assets/images/product-card-1.svg" alt="Premium headphones product image" style={{ width: '100%', borderRadius: 'var(--Shape-3)' }} />
              <Image src="/playground-assets/images/product-card-2.svg" alt="Smartwatch product image" style={{ width: '100%', borderRadius: 'var(--Shape-3)' }} />
            </Grid>
          </Surface>
        )}

        <Container style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
          <Input placeholder={isAuthFlow ? 'Mobile number or email' : 'Search the experience'} start={<Icon name={isAuthFlow ? 'user' : 'search'} />} />
          {isAuthFlow && (
            <Grid columns={2} gap="var(--Spacing-3)">
              <Input placeholder="One-time password" start={<Icon name="lock" />} />
              <Input type="password" placeholder="Password" start={<Icon name="eyeOff" />} />
            </Grid>
          )}
          <Button appearance="primary" variant="bold" end={<Icon name="arrowRight" />}>Continue</Button>
        </Container>

        <Grid columns={isAuthFlow ? 2 : 3} gap="var(--Spacing-3)">
          {options.map((item) => (
            <Surface key={item.label} mode="minimal" as="section" style={{ padding: 'var(--Spacing-3)', borderRadius: 'var(--Shape-4)', display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)' }}>
              <Icon name={item.icon} />
              <span style={{ color: 'var(--Primary-High)', fontFamily: 'var(--Typography-Font-Primary)', fontSize: 'var(--Label-S-FontSize)', lineHeight: 'var(--Label-S-LineHeight)', fontWeight: 'var(--Label-FontWeight-Medium)' }}>
                {item.label}
              </span>
            </Surface>
          ))}
        </Grid>

        <Surface mode="minimal" as="section" style={{ padding: 'var(--Spacing-4)', borderRadius: 'var(--Shape-4)', display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)' }}>
          <span style={{ color: 'var(--Primary-TintedA11y)', fontFamily: 'var(--Typography-Font-Primary)', fontSize: 'var(--Label-XS-FontSize)', lineHeight: 'var(--Label-XS-LineHeight)', fontWeight: 'var(--Label-FontWeight-Medium)' }}>
            Generation note
          </span>
          <p style={{ margin: 0, color: 'var(--Primary-Medium-Text)', fontFamily: 'var(--Typography-Font-Primary)', fontSize: 'var(--Body-S-FontSize)', lineHeight: 'var(--Body-S-LineHeight)', fontWeight: 'var(--Body-FontWeight-Low)' }}>
            {reason}
          </p>
        </Surface>
      </Container>
    </Surface>
  );
}
`;
}

type CompositionCodeSource = 'model' | 'stream-partial' | 'fallback';

interface CodePayloadMetadata {
  source?: CompositionCodeSource;
  promptSize?: number;
  durationMs?: number;
  fallbackReason?: string;
  prompt?: string;
}

function extractTSXCandidate(text: string): string {
  const fence = /```(?:tsx|jsx|ts|js)?\s*([\s\S]*?)(?:```|$)/gi;
  let match: RegExpExecArray | null;
  let candidate = '';
  while ((match = fence.exec(text)) !== null) {
    candidate = match[1] ?? '';
  }
  return candidate.trim() || stripTSXFences(text);
}

function buildCodePayload(
  rawCode: string,
  context: CompositionContext,
  metadata: CodePayloadMetadata = {},
) {
  const repaired = repairGeneratedCompositionCode(rawCode).code;
  const code = annotateTsxWithLocations(repaired);
  const validation = validateCompositionCode(code);
  const designGate = evaluateCompositionDesignGate({
    code,
    prompt: metadata.prompt,
    context,
  });
  const validationSummary = formatValidationIssues(validation);
  const designSummary = designGate.passed ? '' : formatDesignGateIssues(designGate);
  return {
    code,
    validation,
    designGate,
    context,
    errorSummary: [validationSummary, designSummary].filter(Boolean).join('\n'),
    source: metadata.source ?? 'model',
    promptSize: metadata.promptSize,
    durationMs: metadata.durationMs,
    fallbackReason: metadata.fallbackReason,
  };
}

type CodePayload = ReturnType<typeof buildCodePayload>;

function buildSafeFallbackCodePayload(
  prompt: string,
  reason: string,
  context: CompositionContext,
  metadata: CodePayloadMetadata = {},
) {
  return buildCodePayload(buildSafeFallbackTSX(prompt, reason), context, {
    ...metadata,
    source: 'fallback',
    fallbackReason: metadata.fallbackReason ?? reason,
    prompt,
  });
}

export async function handleDesign(body: DesignAgentBody): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response('ANTHROPIC_API_KEY is not configured.', { status: 500 });
  }

  const {
    messages,
    brandName,
    brandId,
    model: modelId,
    compiledPrompt,
    rules: clientRules,
    config: clientConfig,
    skills: clientSkills,
    componentRef,
    useReferences,
    pinnedReferenceScreenIds,
    archetypeHint,
    vertical,
    renderer,
    previousAST,
    previousCode,
    revisionInstruction,
    selectedNodeId,
    selectedNodeType,
    selectedNodeLoc,
    selectedNodeTag,
    designMd,
  } = body;
  const useCode = renderer === 'sandpack';

  const context: CompositionContext = isCompositionContext(body.context)
    ? body.context
    : 'mobile-app';

  const resolvedConfig = clientConfig ?? getDefaultCompositionConfig();
  const resolvedVertical = vertical ?? resolvedConfig.vertical;

  const shouldUseReferences = useReferences !== false;
  const referenceResolution = shouldUseReferences
    ? await resolveReferenceImages({
        context,
        vertical: resolvedVertical,
        archetype: archetypeHint,
        pinnedScreenIds: pinnedReferenceScreenIds,
      }).catch((err) => {
        console.warn('[agent/design] reference resolution failed:', err);
        return { references: [], images: [] };
      })
    : { references: [], images: [] };

  const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
  if (!lastUserMessage) {
    return new Response('Missing user message', { status: 400 });
  }
  const prompt = extractText(lastUserMessage).trim();
  if (!prompt) {
    return new Response('Empty user message', { status: 400 });
  }
  const isRevision = useCode ? Boolean(previousCode) : Boolean(previousAST);
  const priorUserContext = isRevision
    ? summarizePriorUserTurns(messages, lastUserMessage)
    : '';
  const retrievalQuery =
    isRevision && priorUserContext
      ? `${priorUserContext}\n\nLatest change: ${prompt}`
      : prompt;

  // -- Hybrid RAG retrieval (flag + brandId + prompt gated) ---------------
  // When retrieval is enabled we embed the prompt and ask Convex to return
  // the top-k rules, references and skills that match. `retrieveRelevantContext`
  // merges invariants and de-dupes against the caller-supplied rule set, so
  // the LLM sees "invariants + retrieved (+ any retrieved skills)" instead of
  // the full brand rule set.
  const ragEligible =
    !compiledPrompt && // client-compiled prompts skip retrieval by design
    isCompositionRAGEnabled() &&
    Boolean(brandId) &&
    Boolean(prompt);
  let retrievedRules: CompositionRule[] | undefined;
  let retrievedReferences: typeof referenceResolution.references | undefined;
  let retrievalTrace: RetrievalTrace | undefined;
  let retrievalLatencyMs: number | undefined;
  if (ragEligible && brandId && process.env.NEXT_PUBLIC_CONVEX_URL) {
    const startedAt = Date.now();
    try {
      const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
      const hits = await convex.action(api.compositionRetrieval.embedAndSearch, {
        query: retrievalQuery,
        brandId: brandId as Id<'brands'>,
        vertical: resolvedVertical,
        archetype: archetypeHint,
        context,
        skipSkills: Boolean(clientSkills?.length),
      });
      const allBrandRules = clientRules ?? buildSeedRules();
      const referenceScreens = new Map<string, ReferenceScreen>();
      for (const r of referenceResolution.references) {
        referenceScreens.set(r.screen.id, r.screen);
      }
      // Bug B fix: hydrate any vector-retrieved screens that the
      // deterministic resolver pool didn't already surface, so they
      // don't fall into "screen row missing — skipped" inside
      // retrieveRelevantContext.
      const missingScreenIds = hits.references
        .map((h) => h.screenId)
        .filter((id) => !referenceScreens.has(id));
      if (missingScreenIds.length > 0) {
        const hydrated = await hydrateScreensByIds(convex, missingScreenIds);
        for (const [id, screen] of hydrated) {
          referenceScreens.set(id, screen);
        }
      }
      const retrieval = retrieveRelevantContext({
        search: {
          rules: hits.rules as unknown as RuleSearchHit[],
          references: hits.references as unknown as ReferenceSearchHit[],
          skills: hits.skills as unknown as SkillSearchHit[],
        },
        allBrandRules,
        fallbackReferences: referenceResolution.references,
        referenceScreens,
        hasPinnedSkill: Boolean(clientSkills?.length),
        context,
        vertical: resolvedVertical,
        archetype: archetypeHint,
      });
      retrievedRules = retrieval.rules;
      retrievedReferences = retrieval.references;
      retrievalTrace = retrieval.trace;
      retrievalLatencyMs = Date.now() - startedAt;
    } catch (err) {
      console.warn('[agent/design] retrieval failed; falling back to compile:', err);
    }
  }

  const compiledSystemPrompt = compiledPrompt
    ? compiledPrompt
    : compileCompositionRules(
        retrievedRules ?? clientRules ?? buildSeedRules(),
        resolvedConfig,
        componentRef ?? '',
        brandName ? `Brand: ${brandName}` : '',
        clientSkills,
        context,
        {
          references: retrievedReferences ?? referenceResolution.references,
          // Auto-harvested Storybook exemplars. The compiler filters by the
          // context's component allowlist and trims to an 8KB budget so the
          // section can't dominate the prompt on component-heavy contexts.
          exemplars: useCode ? undefined : STORY_EXEMPLARS,
          outputFormat: useCode ? 'tsx' : 'ast',
        },
      ).prompt;

  // When a caller supplies an external DESIGN.md (Google Labs spec), prime
  // the model with the spec grammar and the file itself. The DCA system
  // prompt still wins for OneUI-specific tactics (Surface modes, attention
  // pyramid, component allowlist); the DESIGN.md only adds brand tokens +
  // rationale.
  const promptWithDesignMd = designMd
    ? `${DESIGN_MD_PREAMBLE_PREFIX}${designMd}\n\n---\n\n${compiledSystemPrompt}`
    : compiledSystemPrompt;
  // Code mode (Sandpack) appends the TSX output-format clause and a
  // curated set of Storybook exemplars (real renderSource snippets
  // harvested from `.stories.tsx`). Same design rules as AST mode,
  // different output shape + library exemplars instead of AST exemplars.
  const systemPrompt = useCode
    ? buildTSXSystemPrompt(promptWithDesignMd, { storybookExemplars: STORY_EXEMPLARS })
    : promptWithDesignMd;

  if (!systemPrompt || systemPrompt.trim().length === 0) {
    return new Response(
      'Composition prompt is empty. Seed composition rules before generating.',
      { status: 400 },
    );
  }

  // Emit telemetry as soon as the prompt is finalised so the log line
  // lands before the (often long) model call, making "why was retrieval
  // empty" debuggable without waiting for the full response.
  if (retrievalTrace) {
    logCompositionRetrieval({
      caller: 'executor',
      brandId,
      vertical: resolvedVertical,
      archetype: archetypeHint,
      context,
      promptLength: prompt.length,
      systemPromptSize: systemPrompt.length,
      trace: retrievalTrace,
      latencyMs: retrievalLatencyMs,
    });
  }

  // Revision mode: the request carries a prior artifact and a change
  // instruction. Swap the user prompt from "create" to "modify this,
  // keep unchanged sections intact" so the model doesn't rebuild the
  // layout from scratch.
  const changeRequest = (revisionInstruction ?? prompt).trim();
  // AST-mode focus lines (code mode threads the loc through buildTSXRevisionPrompt instead).
  const focusLines = selectedNodeId
    ? [
        '',
        `The user is focusing on the ${selectedNodeType ?? 'element'} at node id \`${selectedNodeId}\`.`,
        'Apply the change to that node (and its direct children if the change requires it). Keep every other node in the AST byte-identical. Do not refactor, re-layout, or rename sibling nodes.',
      ]
    : [];
  let userPrompt: string;
  if (useCode) {
    userPrompt = isRevision
      ? appendRevisionContext(
          buildTSXRevisionPrompt({
            brandName,
            previousCode: previousCode!,
            changeRequest,
            selectedNodeLoc,
            selectedNodeTag,
          }),
          priorUserContext,
        )
      : buildTSXUserPrompt({ brandName, prompt });
  } else {
    userPrompt = isRevision
      ? appendRevisionContext([
          brandName ? `Brand: ${brandName}.` : '',
          'Here is the current composition (JSON AST):',
          '```json',
          previousAST,
          '```',
          '',
          'Apply this change, returning the full updated AST. Preserve unchanged',
          'sections exactly. Do not regenerate the layout from scratch.',
          ...focusLines,
          '',
          `Change: ${changeRequest}`,
        ]
          .filter(Boolean)
          .join('\n'), priorUserContext)
      : brandName
        ? `Brand: ${brandName}. Create: ${prompt}`
        : prompt;
  }
  const selectedModel = modelId || DEFAULT_MODEL;

  const imageBlocks: Array<{ type: 'image'; image: string }> = referenceResolution.images
    .slice(0, useCode ? MAX_CODE_REFERENCE_IMAGE_BLOCKS : referenceResolution.images.length)
    .map((img) => ({ type: 'image', image: img.dataUri }));

  const stream = createUIMessageStream({
    execute: async ({ writer }) => {
      // Surface the resolved references to the client so the playground UI
      // can render a "References used" chip strip alongside the AST. When
      // RAG replaced the deterministic reference pack, prefer the retrieved
      // set so the chips agree with what actually influenced the prompt.
      const emittedReferences = retrievedReferences ?? referenceResolution.references;
      if (emittedReferences.length > 0) {
        writer.write({
          type: 'data-composition-references',
          id: 'composition-references',
          data: {
            references: emittedReferences.map((r) => ({
              screenId: r.screen.id,
              name: r.screen.name,
              archetype: r.screen.archetype,
              score: r.score,
              reasons: r.reasons,
            })),
          },
        });
      }

      // Hybrid-RAG trace (RFC 0002). Emitted alongside references whenever
      // retrieval ran — the playground's Debug drawer and the eval page
      // render it to explain "which rules / references / skills the model
      // actually saw and why". Skipped entirely for the deterministic
      // compile path so legacy turns don't show an empty panel.
      if (retrievalTrace) {
        writer.write({
          type: 'data-composition-retrieval-trace',
          id: 'composition-retrieval-trace',
          data: {
            trace: retrievalTrace,
            promptSize: systemPrompt.length,
          },
        });
      }

      // Code-mode framing: the system prompt already contains the
      // "output a TSX fenced block" clause via buildTSXSystemPrompt,
      // so the user-facing instruction can be much shorter than the
      // AST mode's "Output ONLY the JSON AST" trailer.
      const userInstruction = useCode
        ? userPrompt
        : `Create a polished UI composition for: ${userPrompt}\n\nOutput ONLY the JSON AST.`;
      const userInstructionWithImages = useCode
        ? userPrompt
        : `Reference screens are attached above — study them as visual precedent, do not copy them verbatim. Create a polished UI composition for: ${userPrompt}\n\nOutput ONLY the JSON AST.`;

      let text = '';
      let codeSource: CompositionCodeSource = 'model';
      let codeFallbackReason: string | undefined;
      const generationStartedAt = Date.now();
      const codePayloadMetadata = (
        source: CompositionCodeSource = codeSource,
        fallbackReason: string | undefined = codeFallbackReason,
      ): CodePayloadMetadata => ({
        source,
        promptSize: systemPrompt.length,
        durationMs: Date.now() - generationStartedAt,
        fallbackReason,
        prompt,
      });
      const repairDesignGate = async (payload: CodePayload): Promise<CodePayload> => {
        if (!payload.validation.valid || payload.designGate.passed) return payload;

        let bestPayload = payload;
        for (
          let attempt = 0;
          !bestPayload.designGate.passed && attempt < MAX_DESIGN_GATE_REPAIR_ATTEMPTS;
          attempt += 1
        ) {
          const repairPrompt = buildTSXRepairPrompt({
            previousCode: bestPayload.code,
            error: [
              'The generated composition passed the strict OneUI code gate but failed the design quality gate.',
              `Detected archetype: ${bestPayload.designGate.archetype}.`,
              'Improve the layout and component choices while preserving valid TSX, token-only styling, Surface usage, and the @oneui/playground import contract.',
              '',
              formatDesignGateIssues(bestPayload.designGate),
            ].join('\n'),
          });
          let repair;
          try {
            repair = await generateText({
              model: anthropic(selectedModel),
              system: systemPrompt,
              timeout: { totalMs: DESIGN_REPAIR_TIMEOUT_MS },
              prompt: repairPrompt,
            });
          } catch {
            break;
          }

          const candidate = buildCodePayload(
            extractTSXCandidate(repair.text),
            context,
            codePayloadMetadata(bestPayload.source, bestPayload.fallbackReason),
          );
          if (!candidate.validation.valid) continue;
          if (candidate.designGate.score >= bestPayload.designGate.score) {
            bestPayload = candidate;
          }
        }

        if (!bestPayload.designGate.passed) {
          console.warn(
            '[agent/design] generated TSX failed design gate:',
            formatDesignGateIssues(bestPayload.designGate),
          );
        }
        return bestPayload;
      };
      try {
        if (useCode) {
          const result =
            imageBlocks.length > 0
              ? streamText({
                  model: anthropic(selectedModel),
                  system: systemPrompt,
                  timeout: { totalMs: DESIGN_GENERATION_TIMEOUT_MS },
                  messages: [
                    {
                      role: 'user',
                      content: [
                        ...imageBlocks,
                        { type: 'text', text: userPrompt },
                      ],
                    },
                  ],
                })
              : streamText({
                  model: anthropic(selectedModel),
                  system: systemPrompt,
                  timeout: { totalMs: DESIGN_GENERATION_TIMEOUT_MS },
                  prompt: userInstruction,
                });
          for await (const delta of result.textStream) {
            text += delta;
          }
        } else {
          const result =
            imageBlocks.length > 0
              ? await generateText({
                  model: anthropic(selectedModel),
                  system: systemPrompt,
                  timeout: { totalMs: DESIGN_GENERATION_TIMEOUT_MS },
                  messages: [
                    {
                      role: 'user',
                      content: [
                        ...imageBlocks,
                        { type: 'text', text: userInstructionWithImages },
                      ],
                    },
                  ],
                })
              : await generateText({
                  model: anthropic(selectedModel),
                  system: systemPrompt,
                  timeout: { totalMs: DESIGN_GENERATION_TIMEOUT_MS },
                  prompt: userInstruction,
                });
          text = result.text;
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (useCode) {
          if (text.trim()) {
            let partialPayload = buildCodePayload(
              extractTSXCandidate(text),
              context,
              codePayloadMetadata('stream-partial', message),
            );
            if (partialPayload.validation.valid) {
              partialPayload = await repairDesignGate(partialPayload);
              writer.write({
                type: 'data-composition-code',
                id: 'composition-code',
                data: partialPayload,
              });
              return;
            }
            for (
              let attempt = 0;
              !partialPayload.validation.valid && attempt < MAX_STRICT_CODE_REPAIR_ATTEMPTS;
              attempt += 1
            ) {
              const issueSummary = formatValidationIssues(partialPayload.validation);
              const repairPrompt = buildTSXRepairPrompt({
                previousCode: partialPayload.code,
                error: [
                  'The streamed TSX response was interrupted before it passed the OneUI strict render gate.',
                  'Complete and repair the code below into a valid App.tsx.',
                  '',
                  issueSummary,
                ].join('\n'),
              });
              try {
                const repair = await generateText({
                  model: anthropic(selectedModel),
                  system: systemPrompt,
                  timeout: { totalMs: DESIGN_REPAIR_TIMEOUT_MS },
                  prompt: repairPrompt,
                });
                partialPayload = buildCodePayload(
                  extractTSXCandidate(repair.text),
                  context,
                  codePayloadMetadata('stream-partial', message),
                );
              } catch {
                break;
              }
            }
            if (partialPayload.validation.valid) {
              partialPayload = await repairDesignGate(partialPayload);
              writer.write({
                type: 'data-composition-code',
                id: 'composition-code',
                data: partialPayload,
              });
              return;
            }
            console.warn(
              '[agent/design] stream partial failed strict gate after repair:',
              formatValidationIssues(partialPayload.validation),
            );
          }
          console.warn('[agent/design] primary TSX generation failed before valid code:', message);
          writer.write({
            type: 'data-composition-code',
            id: 'composition-code',
            data: buildSafeFallbackCodePayload(
              prompt,
              `Primary generation timed out or failed before valid TSX was available. Details: ${message}`,
              context,
              codePayloadMetadata('fallback'),
            ),
          });
          return;
        }
        writer.write({
          type: 'data-composition-error',
          id: 'composition-error',
          data: {
            message: [
              'Generation did not finish before the playground timeout.',
              'No preview was rendered because the response did not produce valid TSX in time.',
              `Details: ${message}`,
            ].join('\n\n'),
          },
        });
        return;
      }

      // ── Code-mode emit ──────────────────────────────────────────────
      // Sandpack path: extract TSX, annotate with `data-oneui-loc` so
      // the iframe's click bridge can map clicks back to source ranges,
      // validate via Babel, emit `data-composition-code`. Validation
      // failures are returned to the client (it has the self-heal loop);
      // we don't try to fix here.
      if (useCode) {
        let rawCode = extractTSXCandidate(text);
        let payload = buildCodePayload(rawCode, context, {
          ...codePayloadMetadata(),
        });
        let code = payload.code;
        let validation = payload.validation;

        for (
          let attempt = 0;
          !validation.valid && attempt < MAX_STRICT_CODE_REPAIR_ATTEMPTS;
          attempt += 1
        ) {
          const issueSummary = formatValidationIssues(validation);
          const repairPrompt = buildTSXRepairPrompt({
            previousCode: code,
            error: [
              'The generated composition failed the OneUI strict render gate.',
              'Fix every issue below before returning the full App.tsx.',
              '',
              issueSummary,
            ].join('\n'),
          });
          let repair;
          try {
            repair = await generateText({
              model: anthropic(selectedModel),
              system: systemPrompt,
              timeout: { totalMs: DESIGN_REPAIR_TIMEOUT_MS },
              prompt: repairPrompt,
            });
          } catch {
            break;
          }
          rawCode = extractTSXCandidate(repair.text);
          payload = buildCodePayload(rawCode, context, {
            ...codePayloadMetadata(),
          });
          code = payload.code;
          validation = payload.validation;
        }

        if (!validation.valid) {
          console.warn(
            '[agent/design] generated TSX failed strict gate after repair:',
            formatValidationIssues(validation),
          );
          writer.write({
            type: 'data-composition-code',
            id: 'composition-code',
            data: {
              ...buildSafeFallbackCodePayload(
                prompt,
                [
                  'Generated TSX failed the OneUI strict render gate after repair.',
                  formatValidationIssues(validation),
                ].filter(Boolean).join(' '),
                context,
                codePayloadMetadata('fallback'),
              ),
            },
          });
          return;
        }

        payload = await repairDesignGate(payload);
        writer.write({
          type: 'data-composition-code',
          id: 'composition-code',
          data: payload,
        });
        return;
      }

      const jsonStr = stripJSONFences(text);

      // Phase 1 — parse. Hard failure: no AST part emitted.
      let ast: ReturnType<typeof JSON.parse>;
      try {
        ast = JSON.parse(jsonStr);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        writer.write({
          type: 'data-composition-error',
          id: 'composition-error',
          data: { message: `Generation returned invalid JSON: ${message}`, raw: jsonStr },
        });
        return;
      }
      if (!ast || !ast.root || !ast.version) {
        writer.write({
          type: 'data-composition-error',
          id: 'composition-error',
          data: {
            message: 'Generated output is missing `root` or `version` — AST rejected.',
            raw: jsonStr,
          },
        });
        return;
      }
      const normalization = normalizeCompositionAST(ast);
      ast = normalization.ast;
      if (normalization.issues.length > 0) {
        console.info(
          '[agent/design] normalized generated AST:',
          normalization.issues.map((issue) => `${issue.kind}:${issue.path}`).join(', '),
        );
      }

      // Phase 2 — validate. Soft failure: emit the AST anyway so the user
      // still sees what the LLM produced, and surface the validator issue
      // as a failed check rather than a blocking error.
      let validation;
      try {
        validation = validateComposition(ast, undefined, context);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error('[agent/design] validator crashed:', message);
        validation = {
          valid: false,
          score: 0,
          checks: [
            {
              id: 'validator-crash',
              name: 'Validator exception',
              passed: false,
              severity: 'error' as const,
              details: message,
            },
          ],
          errorCount: 1,
          warningCount: 0,
          infoCount: 0,
        };
      }

      writer.write({
        type: 'data-composition-ast',
        id: 'composition-ast',
        data: { ast, validation, context },
      });
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : String(err);
      console.error('[agent/design] stream error:', message);
      return `Generation failed: ${message}`;
    },
  });

  return createUIMessageStreamResponse({ stream });
}
