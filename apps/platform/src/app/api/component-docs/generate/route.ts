/**
 * API route for AI-powered component documentation generation.
 *
 * POST: Accepts component context and returns streaming JSON
 * for the requested documentation section(s).
 */

import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { CLAUDE_MODEL } from '@oneui/shared/agent';
import type { DocumentationSectionKey } from '@oneui/shared';
import { buildDocGenerationPrompt } from '@/app/(platform)/(studio)/components/lib/doc-generation-prompt';

interface GenerateRequest {
  componentName: string;
  section?: DocumentationSectionKey;
  currentSpec: Record<string, unknown>;
  componentContext: {
    propsInterface?: Record<string, unknown>[];
    tokenManifest?: Record<string, unknown>;
    recipeDefinition?: Record<string, unknown>;
    slotDefinitions?: Record<string, unknown>[];
  };
  brandContext?: {
    brandName?: string;
    theme?: string;
  };
}

export async function POST(request: Request) {
  const body = (await request.json()) as GenerateRequest;

  const {
    componentName,
    section,
    currentSpec,
    componentContext,
    brandContext,
  } = body;

  const systemPrompt = buildDocGenerationPrompt({
    componentName,
    section,
    currentSpec,
    componentContext,
    brandContext,
  });

  const userMessage = section
    ? `Generate documentation for the "${section}" section of the ${componentName} component. Return valid JSON matching the section's interface shape.`
    : `Generate documentation for all editable sections of the ${componentName} component. Return valid JSON with keys for each section.`;

  const result = streamText({
    model: anthropic(CLAUDE_MODEL),
    system: systemPrompt,
    prompt: userMessage,
  });

  return result.toTextStreamResponse();
}
