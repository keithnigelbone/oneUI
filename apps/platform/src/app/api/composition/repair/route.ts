/**
 * Composition Repair API — auto-fixes broken TSX from the Sandpack
 * playground's compile/runtime errors.
 *
 * POST { previousCode, error, context? }
 *
 * Self-heal entry point. The playground's `useSelfHealingPreview` hook
 * subscribes to Sandpack's `compile-error` / `runtime-error` events and
 * POSTs here. We re-prompt Claude with the failing code + the bundler's
 * error message, validate the response, and return the corrected TSX.
 * The client then writes it to `/App.tsx` via `sandpack.updateFile()` —
 * iframe re-renders, designer never sees the failure.
 *
 * This is deliberately a thin one-shot route, not a full streaming
 * generation. Repairs need to feel instant; users don't get to watch
 * the model "think". A full retry costs ~1 Sonnet call (~3-5s).
 */

import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { CLAUDE_MODEL } from '@oneui/shared/agent';
import {
  buildTSXRepairPrompt,
  buildTSXSystemPrompt,
  buildSeedRules,
  compileCompositionRules,
  getDefaultCompositionConfig,
  stripTSXFences,
  type CodeValidationResult,
  type CompositionContext,
} from '@oneui/shared/engine';
import {
  formatValidationIssues,
  repairGeneratedCompositionCode,
  validateCompositionCode,
} from '@oneui/shared/engine/compositionCodeValidator';
import { annotateTsxWithLocations } from '@oneui/shared/engine/compositionCodeAnnotator';
import { STORY_EXEMPLARS } from '@oneui/shared/meta';

export const runtime = 'nodejs';
export const maxDuration = 60;

const VALID_CONTEXTS: ReadonlySet<CompositionContext> = new Set<CompositionContext>([
  'mobile-app',
  'web-app',
  'marketing-page',
  'social-post',
  'print',
  'outdoor',
]);

interface RepairRequestBody {
  /** The TSX that failed to compile or threw at runtime. */
  previousCode?: string;
  /** Bundler / runtime error message. We forward this verbatim to the
   *  model so it sees the exact failure mode. */
  error?: string;
  /** Composition context — drives which rule set we attach. Defaults
   *  to `mobile-app` because most repairs come from mobile previews. */
  context?: string;
}

interface RepairResponsePayload {
  /** The corrected TSX. Empty string if the model declined to repair. */
  code: string;
  /** Babel-validator outcome on the repaired code. */
  validation: CodeValidationResult;
  /** Pre-formatted bullet list of validator issues — saves the client
   *  having to re-format. */
  errorSummary?: string;
}

function isCompositionContext(value: unknown): value is CompositionContext {
  return typeof value === 'string' && VALID_CONTEXTS.has(value as CompositionContext);
}

export async function POST(request: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured' },
      { status: 500 },
    );
  }

  let body: RepairRequestBody;
  try {
    body = (await request.json()) as RepairRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const previousCode = typeof body.previousCode === 'string' ? body.previousCode : '';
  const errorText = typeof body.error === 'string' ? body.error : '';
  if (!previousCode.trim()) {
    return NextResponse.json(
      { error: 'previousCode is required (the TSX that failed to compile)' },
      { status: 400 },
    );
  }
  if (!errorText.trim()) {
    return NextResponse.json(
      { error: 'error is required (the bundler / runtime error message)' },
      { status: 400 },
    );
  }

  const context: CompositionContext = isCompositionContext(body.context)
    ? body.context
    : 'mobile-app';

  // Reuse the same compiled rules + TSX system prompt as a fresh
  // generation — the model needs the full design-system contract to
  // produce a valid repair, not just the error message. The user-side
  // prompt is the repair-specific one.
  const compiled = compileCompositionRules(
    buildSeedRules(),
    getDefaultCompositionConfig(),
    '',
    '',
    undefined,
    context,
    {},
  ).prompt;
  const systemPrompt = buildTSXSystemPrompt(compiled, { storybookExemplars: STORY_EXEMPLARS });
  const userPrompt = buildTSXRepairPrompt({ previousCode, error: errorText });

  const { text } = await generateText({
    model: anthropic(CLAUDE_MODEL),
    system: systemPrompt,
    prompt: userPrompt,
  });

  const rawCode = repairGeneratedCompositionCode(stripTSXFences(text)).code;
  const code = annotateTsxWithLocations(rawCode);
  const validation = validateCompositionCode(code);
  const payload: RepairResponsePayload = {
    code: validation.valid ? code : '',
    validation,
    errorSummary: formatValidationIssues(validation),
  };
  return NextResponse.json(payload, { status: validation.valid ? 200 : 422 });
}
