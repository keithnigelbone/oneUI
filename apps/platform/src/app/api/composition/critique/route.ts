/**
 * Composition Critique API — on-demand 5-dimension review of any AST.
 *
 * POST { ast, context, brandId?, brandSummary?, userPrompt? }
 *
 * Unlike `/api/composition/eval/run`, this route is scenario-free. It runs
 * the AST through the deterministic validator, builds a critique prompt
 * (5 fixed dimensions), and asks Claude for a structured Keep / Fix /
 * Quick Wins review. Returns CritiqueResponse plus the validation snapshot.
 *
 * Designed to be cheap and fast (Sonnet, text-only, no scenarios, no vision)
 * so the playground "Review" button feels instant.
 */

import { NextResponse } from 'next/server';
import { generateText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { CLAUDE_MODEL } from '@oneui/shared/agent';
import {
  buildCritiquePrompt,
  parseCritiqueResponse,
  validateComposition,
} from '@oneui/shared/engine';
import type {
  ASTRoot,
  CritiqueResponse,
  CompositionValidationResult,
} from '@oneui/shared';
import type { CodeValidationResult } from '@oneui/shared/engine';
import { validateCompositionCode } from '@oneui/shared/engine/compositionCodeValidator';

/**
 * Adapt a code validation result to the AST validation shape the
 * critique prompt expects. Maps issues 1:1 to checks; severity/id stay
 * intact. The judge sees a uniform "checks list" regardless of mode.
 */
function adaptCodeValidationToAst(result: CodeValidationResult): CompositionValidationResult {
  const errorCount = result.issues.filter((i) => i.severity === 'error').length;
  const warningCount = result.issues.filter((i) => i.severity === 'warning').length;
  const infoCount = result.issues.filter((i) => i.severity === 'info').length;
  return {
    valid: result.valid,
    score: result.score,
    errorCount,
    warningCount,
    infoCount,
    checks: result.issues.map((issue) => ({
      id: issue.id,
      name: issue.id,
      passed: false,
      severity: issue.severity,
      details: issue.line ? `${issue.message} (line ${issue.line})` : issue.message,
    })),
  };
}

export const runtime = 'nodejs';
export const maxDuration = 60;

interface CritiqueRequestBody {
  /** AST shape — provide this OR `code`. */
  ast?: unknown;
  /** TSX shape — sent by the playground when the renderer flag is
   *  `'sandpack'`. The validator + judge prompt branch on which one
   *  is present. */
  code?: string;
  context?: string;
  brandId?: string;
  brandSummary?: string;
  userPrompt?: string;
}

interface CritiqueResponsePayload {
  critique: CritiqueResponse;
  validation: CompositionValidationResult;
  /** Echo so the client doesn't need to re-send. Useful for telemetry. */
  context: string;
}

function isASTRoot(value: unknown): value is ASTRoot {
  if (!value || typeof value !== 'object') return false;
  const obj = value as Record<string, unknown>;
  return obj.version === 1 && obj.root != null && typeof obj.root === 'object';
}

export async function POST(request: Request): Promise<Response> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured' },
      { status: 500 },
    );
  }

  let body: CritiqueRequestBody;
  try {
    body = (await request.json()) as CritiqueRequestBody;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const hasAst = isASTRoot(body.ast);
  const hasCode = typeof body.code === 'string' && body.code.trim().length > 0;
  if (!hasAst && !hasCode) {
    return NextResponse.json(
      { error: 'Either `ast` (legacy AST renderer) or `code` (sandpack TSX) is required' },
      { status: 400 },
    );
  }

  const context = typeof body.context === 'string' && body.context.length > 0
    ? body.context
    : 'web-app';

  // Run the appropriate validator first — its output feeds the prompt so
  // the judge doesn't waste tokens re-deriving things we already know.
  // Code mode reuses the AST validation shape via a thin adapter so the
  // critique prompt's expectations (errorCount/warningCount/checks)
  // remain stable.
  let validation: CompositionValidationResult;
  if (hasAst) {
    // `hasAst` already narrowed via `isASTRoot` — assert the type for tsc.
    validation = validateComposition(body.ast as ASTRoot);
  } else {
    const codeResult = validateCompositionCode(body.code as string);
    validation = adaptCodeValidationToAst(codeResult);
  }

  const prompt = buildCritiquePrompt({
    // Compact serialisation — pretty-printing inflates tokens by ~30% with no
    // benefit to the model.
    ...(hasAst
      ? { generatedAST: JSON.stringify(body.ast as ASTRoot) }
      : { generatedCode: body.code }),
    context,
    validation,
    brandSummary: body.brandSummary,
    userPrompt: body.userPrompt,
  });

  let raw: string;
  try {
    const result = await generateText({
      model: anthropic(CLAUDE_MODEL),
      prompt,
      temperature: 0.2,
    });
    raw = result.text;
  } catch (err) {
    return NextResponse.json(
      {
        error: `LLM call failed: ${err instanceof Error ? err.message : String(err)}`,
      },
      { status: 502 },
    );
  }

  let critique: CritiqueResponse;
  try {
    critique = parseCritiqueResponse(raw);
  } catch (err) {
    return NextResponse.json(
      {
        error: `Could not parse critique response: ${err instanceof Error ? err.message : String(err)}`,
        raw,
      },
      { status: 502 },
    );
  }

  const payload: CritiqueResponsePayload = {
    critique,
    validation,
    context,
  };

  return NextResponse.json(payload);
}
