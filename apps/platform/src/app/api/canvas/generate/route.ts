/**
 * Canvas Generate API — AI-powered component composition
 *
 * Uses the composition compiler to build context-aware system prompts
 * from modular rules. Falls back to default rules when no brand-specific
 * composition config is provided.
 *
 * Supports:
 * - Pre-compiled prompt (from client-side composition compiler)
 * - Default compilation (uses seed rules + default config)
 * - Reference image input for design-driven composition
 * - Post-generation validation via compositionValidator
 */

import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { CLAUDE_MODEL } from '@oneui/shared/agent';
import {
  compileCompositionRules,
  getDefaultCompositionConfig,
  validateComposition,
  buildSeedRules,
  computeASTHash,
  isCompositionContext,
  normalizeCompositionAST,
} from '@oneui/shared/engine';
import { validateASTComponentProps, generateAIContext } from '@oneui/shared/meta';
import { ALL_COMPONENT_METAS } from '@oneui/ui/registry/metaRegistry';
import type {
  BrandVertical,
  CompositionContext,
  CompositionRule,
  CompositionConfig,
} from '@oneui/shared/engine';
import { resolveReferenceImages } from '@/lib/referenceResolver';

export const maxDuration = 45;

export async function POST(request: Request) {
  try {
    const {
      prompt,
      brandName,
      model: modelId,
      referenceImage,
      context: requestedContext,
      compiledPrompt,
      rules: clientRules,
      config: clientConfig,
      useReferences,
      pinnedReferenceScreenIds,
      archetypeHint,
      vertical,
    } = (await request.json()) as {
      prompt: string;
      brandName?: string;
      model?: string;
      /** Ad-hoc reference image (base64 data URI) — one-off, not catalogued. */
      referenceImage?: string;
      context?: string;
      /** Pre-compiled system prompt from client-side composition compiler */
      compiledPrompt?: string;
      /** Client-provided rules (resolved from Convex) */
      rules?: CompositionRule[];
      /** Client-provided composition config */
      config?: CompositionConfig;
      /** Pull visual precedent from the reference library (default true). */
      useReferences?: boolean;
      /** Explicit references the caller wants included regardless of score. */
      pinnedReferenceScreenIds?: string[];
      /** Archetype tag used by the resolver (e.g. "product-grid", "hero"). */
      archetypeHint?: string;
      /** Vertical used by the resolver. Falls back to config.vertical. */
      vertical?: BrandVertical;
    };

    const context: CompositionContext = isCompositionContext(requestedContext)
      ? requestedContext
      : 'mobile-app';

    const resolvedConfig = clientConfig ?? getDefaultCompositionConfig();
    const resolvedVertical = vertical ?? resolvedConfig.vertical;

    // Resolve reference library matches (unless the caller opted out).
    const shouldUseReferences = useReferences !== false;
    const referenceResolution = shouldUseReferences
      ? await resolveReferenceImages({
          context,
          vertical: resolvedVertical,
          archetype: archetypeHint,
          pinnedScreenIds: pinnedReferenceScreenIds,
        }).catch((err) => {
          console.warn('[canvas/generate] reference resolution failed:', err);
          return { references: [], images: [] };
        })
      : { references: [], images: [] };

    // Build the system prompt:
    // 1. Use pre-compiled prompt if provided (from client-side compiler)
    // 2. Otherwise compile from provided rules + config (+ references)
    // 3. Fall back to seed rules + default config
    let systemPrompt: string;

    if (compiledPrompt) {
      systemPrompt = compiledPrompt;
    } else {
      const rules = clientRules ?? buildSeedRules();

      // Component reference — condensed markdown describing every registered
      // component's props, slots, and brand-overridable fields. Derived from
      // the hand-authored + TS-extracted ComponentMeta registry so the LLM
      // only ever sees props that actually exist.
      const componentRef = generateAIContext(ALL_COMPONENT_METAS, {
        brandName,
        includeSlots: true,
      });

      const compiled = compileCompositionRules(
        rules,
        resolvedConfig,
        componentRef,
        brandName ? `Brand: ${brandName}` : '',
        undefined, // skills — wired at next slice (Convex lookup)
        context,
        { references: referenceResolution.references },
      );
      systemPrompt = compiled.prompt;
    }

    const userPrompt = brandName
      ? `Brand: ${brandName}. Create: ${prompt}`
      : prompt;

    const selectedModel = modelId || CLAUDE_MODEL;

    // Build messages — include reference library images + optional ad-hoc image
    const imageBlocks: Array<{ type: 'image'; image: string }> = [];
    for (const ref of referenceResolution.images) {
      imageBlocks.push({ type: 'image', image: ref.dataUri });
    }
    if (referenceImage) imageBlocks.push({ type: 'image', image: referenceImage });

    const messages: Array<{
      role: 'user';
      content: Array<{ type: 'image'; image: string } | { type: 'text'; text: string }>;
    }> = [];

    if (imageBlocks.length > 0) {
      messages.push({
        role: 'user' as const,
        content: [
          ...imageBlocks,
          {
            type: 'text' as const,
            text:
              imageBlocks.length > 1 || referenceResolution.images.length > 0
                ? `Reference screens are attached above — study them as visual precedent, do not copy them verbatim. Create a polished UI composition for: ${userPrompt}\n\nOutput ONLY the JSON AST.`
                : `Use this image as a reference for the UI design. Create a polished UI composition for: ${userPrompt}\n\nOutput ONLY the JSON AST.`,
          },
        ],
      });
    }

    const { text } = await generateText(
      // AI SDK's union of `messages | prompt` doesn't narrow cleanly when
      // spread from a conditional object; fall through to the runtime-correct
      // shape and cast once.
      {
        model: anthropic(selectedModel),
        system: systemPrompt,
        ...(messages.length > 0
          ? { messages: messages as Parameters<typeof generateText>[0]['messages'] }
          : { prompt: `Create a polished UI composition for: ${userPrompt}\n\nOutput ONLY the JSON AST.` }),
      } as Parameters<typeof generateText>[0],
    );

    let jsonStr = text.trim();
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
    }

    let ast = JSON.parse(jsonStr);

    if (!ast.root || !ast.version) {
      return Response.json({ error: 'Invalid AST structure' }, { status: 400 });
    }
    const normalization = normalizeCompositionAST(ast);
    ast = normalization.ast;
    if (normalization.issues.length > 0) {
      console.info(
        '[canvas/generate] normalized generated AST:',
        normalization.issues.map((issue) => `${issue.kind}:${issue.path}`).join(', '),
      );
    }

    // Run deterministic validation on the generated AST
    const validation = validateComposition(ast, undefined, context);

    // Per-component schema validation (TS-derived, strict). Non-fatal —
    // surfaced alongside composition validation so the editor can highlight
    // invalid props without failing the whole generation.
    const propSchemaErrors = validateASTComponentProps(ast);

    // Stable hash so the playground can subscribe to `renderedScreenshots`
    // by astHash and surface the visual-alignment score as the auto-verify
    // background job lands.
    const astHash = computeASTHash(ast);

    return Response.json({
      ast,
      astHash,
      validation,
      propSchemaErrors,
      context,
      references: referenceResolution.references.map((r) => ({
        screenId: r.screen.id,
        name: r.screen.name,
        archetype: r.screen.archetype,
        score: r.score,
        reasons: r.reasons,
      })),
    });
  } catch (error: any) {
    console.error('Canvas generate error:', error);
    return Response.json(
      { error: error.message || 'Generation failed' },
      { status: 500 },
    );
  }
}
