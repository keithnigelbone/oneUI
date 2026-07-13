/**
 * Deterministic offline wizard: mirrors Banner Builder Create steps via clarification cards + tool parts.
 */

import { generateId } from 'ai';
import type { UIMessage } from 'ai';
import type { SocialPlatform } from './types';
import type { AssetDimension } from './types';
import { getDimensionsForPlatform } from './social-platforms';
import {
  OFFLINE_FORMAT_OPTIONS,
  OFFLINE_MULTI_ANSWER_JOIN,
  OFFLINE_PLATFORM_OPTIONS,
  getFormatByLabelOrId,
  getOfflinePlatformByLabelOrId,
} from './offline-constants';
import { generateOfflineAssetAST, buildContentBlockProps } from './offline-templates';
import type { OfflineContentFields } from './offline-templates';

const ANSWERS_PREFIX = 'Here are my answers:';

export type OfflineWizardInternalStep = 'format' | 'platform' | 'content' | 'dimensions' | 'complete';

export interface OfflineWizardState {
  internalStep: OfflineWizardInternalStep;
  formatId?: string;
  socialPlatform?: SocialPlatform;
  offlinePlatformLabel?: string;
  content?: OfflineContentFields;
  selectedDimensions?: AssetDimension[];
  /** First free-text message when entering offline (user intent). */
  initialUserPrompt?: string;
}

export function createInitialOfflineWizardState(): OfflineWizardState {
  return { internalStep: 'format' };
}

export function parseClarificationAnswers(text: string): Record<string, string> | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith(ANSWERS_PREFIX)) return null;
  const body = trimmed.slice(ANSWERS_PREFIX.length).trim();
  const out: Record<string, string> = {};
  for (const line of body.split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const k = line.slice(0, idx).trim();
    const v = line.slice(idx + 1).trim();
    if (k) out[k] = v;
  }
  return Object.keys(out).length > 0 ? out : null;
}

function offlineMeta() {
  return { offline: true as const };
}

function textPart(text: string) {
  return { type: 'text' as const, text, state: 'done' as const };
}

function askClarificationPart(toolCallId: string, questions: Array<Record<string, unknown>>) {
  return {
    type: 'tool-ask_clarification' as const,
    toolCallId,
    state: 'output-available' as const,
    input: { questions },
    output: `Asked ${questions.length} clarification question(s). Wait for the user to answer in chat.`,
  };
}

function setProjectMetadataPart(
  toolCallId: string,
  payload: {
    name: string;
    description: string;
    projectType: 'single' | 'campaign';
    platforms: SocialPlatform[];
    assetTypes: string[];
  }
) {
  return {
    type: 'tool-set_project_metadata' as const,
    toolCallId,
    state: 'output-available' as const,
    input: payload,
    output: `Project "${payload.name}" (${payload.projectType}) configured for ${payload.platforms.join(', ')}. Generate assets: ${payload.assetTypes.join(', ')}. Call generate_asset_layout for each.`,
  };
}

function generateContentBlockPart(toolCallId: string, layout: Record<string, unknown>) {
  return {
    type: 'tool-generate_content_block' as const,
    toolCallId,
    state: 'output-available' as const,
    input: { layout },
    output: 'Content Block data recorded for the asset pipeline.',
  };
}

function generateRibbonPart(toolCallId: string, ribbon: Record<string, unknown>) {
  return {
    type: 'tool-generate_ribbon' as const,
    toolCallId,
    state: 'output-available' as const,
    input: { ribbon },
    output: 'Ribbon data recorded for the asset pipeline.',
  };
}

function generateAssetLayoutPart(
  toolCallId: string,
  payload: { assetName: string; ast: { version: 1; name: string; root: unknown } }
) {
  return {
    type: 'tool-generate_asset_layout' as const,
    toolCallId,
    state: 'output-available' as const,
    input: payload,
    output: `Asset "${payload.assetName}" queued for render. Continue with remaining sizes if any.`,
  };
}

function assistantMessage(parts: Array<Record<string, unknown>>): UIMessage {
  return {
    id: generateId(),
    role: 'assistant',
    metadata: offlineMeta(),
    parts: parts as UIMessage['parts'],
  };
}

export interface OfflineWizardContext {
  projectName: string;
  projectDescription?: string;
  projectType: 'single' | 'campaign';
  /** Platforms already set on the project (may narrow suggestions). */
  projectPlatforms: SocialPlatform[];
}

/**
 * First assistant turn after switching offline: greeting + format picker.
 */
export function getOfflineWizardBootstrapMessages(
  ctx: OfflineWizardContext,
  userFirstLine?: string
): UIMessage[] {
  const hint = userFirstLine?.trim()
    ? `\n\nI’ve noted your message — we’ll use it for context when building the layout.`
    : '';
  const greeting = `You’re in **offline mode** — I’ll walk you through a guided wizard to set up your asset: format, channel, content, then sizes.${hint}`;

  const questions = [
    {
      id: 'format',
      prompt: 'What type of asset do you want to create?',
      options: OFFLINE_FORMAT_OPTIONS.map((f) => f.label),
    },
  ];

  return [
    assistantMessage([
      textPart(greeting),
      askClarificationPart(generateId(), questions),
    ]),
  ];
}

function mergePlatforms(
  mapped: SocialPlatform,
  existing: SocialPlatform[]
): SocialPlatform[] {
  if (existing.length > 0 && existing.includes(mapped)) return existing;
  if (existing.length > 0) return Array.from(new Set([...existing, mapped]));
  return [mapped];
}

export interface ProcessOfflineWizardResult {
  nextState: OfflineWizardState;
  assistantMessages: UIMessage[];
}

/**
 * Advance wizard from a user turn (plain text or clarification answers).
 */
export function processOfflineWizardTurn(
  state: OfflineWizardState,
  userText: string,
  ctx: OfflineWizardContext
): ProcessOfflineWizardResult {
  const answers = parseClarificationAnswers(userText);
  let next: OfflineWizardState = { ...state };
  const out: UIMessage[] = [];

  if (state.internalStep === 'format') {
    if (answers?.format) {
      const fmt = getFormatByLabelOrId(answers.format);
      if (fmt) {
        next = { ...next, formatId: fmt.id, internalStep: 'platform' };
        out.push(
          assistantMessage([
            textPart(`Great — **${fmt.label}** selected. Where will this appear?`),
            askClarificationPart(generateId(), [
              {
                id: 'platform',
                prompt: 'Pick a channel (maps to social size presets).',
                options: OFFLINE_PLATFORM_OPTIONS.map((p) => p.label),
              },
            ]),
          ])
        );
        return { nextState: next, assistantMessages: out };
      }
      out.push(
        assistantMessage([
          textPart('Please choose one of the format options below.'),
          askClarificationPart(generateId(), [
            {
              id: 'format',
              prompt: 'What type of asset do you want to create?',
              options: OFFLINE_FORMAT_OPTIONS.map((f) => f.label),
            },
          ]),
        ])
      );
      return { nextState: next, assistantMessages: out };
    }
    if (!answers && userText.trim()) {
      next = { ...next, initialUserPrompt: userText.trim() };
    }
    out.push(
      assistantMessage([
        textPart('Choose a format to continue.'),
        askClarificationPart(generateId(), [
          {
            id: 'format',
            prompt: 'What type of asset do you want to create?',
            options: OFFLINE_FORMAT_OPTIONS.map((f) => f.label),
          },
        ]),
      ])
    );
    return { nextState: next, assistantMessages: out };
  }

  if (state.internalStep === 'platform') {
    if (answers?.platform) {
      const plat = OFFLINE_PLATFORM_OPTIONS.find((p) => p.label === answers.platform)
        ?? getOfflinePlatformByLabelOrId(answers.platform);
      if (plat) {
        next = {
          ...next,
          socialPlatform: plat.socialPlatform,
          offlinePlatformLabel: plat.label,
          internalStep: 'content',
        };
        out.push(
          assistantMessage([
            textPart(
              `**${plat.label}** — now add the copy for your ${OFFLINE_FORMAT_OPTIONS.find((f) => f.id === next.formatId)?.label ?? 'asset'}.`
            ),
            askClarificationPart(generateId(), [
              {
                id: 'context',
                prompt: 'Context label (small text above the headline, e.g. product line)',
                allowFreeText: true,
              },
              {
                id: 'headline',
                prompt: 'Headline',
                allowFreeText: true,
              },
              {
                id: 'body',
                prompt: 'Body text',
                allowFreeText: true,
              },
              {
                id: 'ctaPrimary',
                prompt: 'Primary CTA label',
                allowFreeText: true,
              },
              {
                id: 'ctaSecondary',
                prompt: 'Secondary CTA label (optional)',
                allowFreeText: true,
              },
            ]),
          ])
        );
        return { nextState: next, assistantMessages: out };
      }
      out.push(
        assistantMessage([
          textPart('Pick **Web**, **App**, or **TV** to continue.'),
          askClarificationPart(generateId(), [
            {
              id: 'platform',
              prompt: 'Where will it appear?',
              options: OFFLINE_PLATFORM_OPTIONS.map((p) => p.label),
            },
          ]),
        ])
      );
      return { nextState: next, assistantMessages: out };
    }
    out.push(
      assistantMessage([
        textPart('Pick Web, App, or TV to load the right size presets.'),
        askClarificationPart(generateId(), [
          {
            id: 'platform',
            prompt: 'Where will it appear?',
            options: OFFLINE_PLATFORM_OPTIONS.map((p) => p.label),
          },
        ]),
      ])
    );
    return { nextState: next, assistantMessages: out };
  }

  if (state.internalStep === 'content') {
    if (
      answers &&
      (Boolean(answers.headline?.trim()) ||
        Boolean(answers.body?.trim()) ||
        Boolean(answers.ctaPrimary?.trim()) ||
        Boolean(answers.context?.trim()))
    ) {
      next = {
        ...next,
        content: {
          context: answers.context?.trim() || undefined,
          headline: answers.headline?.trim() || undefined,
          body: answers.body?.trim() || undefined,
          ctaPrimary: answers.ctaPrimary?.trim() || undefined,
          ctaSecondary: answers.ctaSecondary?.trim() || undefined,
        },
        internalStep: 'dimensions',
      };
      const social = next.socialPlatform ?? 'instagram';
      const dims = getDimensionsForPlatform(social);
      const names = dims.map((d) => `${d.name} (${d.width}×${d.height})`);
      out.push(
        assistantMessage([
          textPart('Select one or more sizes. You can pick multiple.'),
          askClarificationPart(generateId(), [
            {
              id: 'dimensions',
              prompt: 'Which sizes should we generate?',
              options: names,
              allowMultiple: true,
            },
          ]),
        ])
      );
      return { nextState: next, assistantMessages: out };
    }
    out.push(
      assistantMessage([
        textPart('Fill in the content fields to continue.'),
        askClarificationPart(generateId(), [
          {
            id: 'context',
            prompt: 'Context label',
            allowFreeText: true,
          },
          {
            id: 'headline',
            prompt: 'Headline',
            allowFreeText: true,
          },
          {
            id: 'body',
            prompt: 'Body text',
            allowFreeText: true,
          },
          {
            id: 'ctaPrimary',
            prompt: 'Primary CTA label',
            allowFreeText: true,
          },
          {
            id: 'ctaSecondary',
            prompt: 'Secondary CTA label (optional)',
            allowFreeText: true,
          },
        ]),
      ])
    );
    return { nextState: next, assistantMessages: out };
  }

  if (state.internalStep === 'dimensions') {
    const social = state.socialPlatform ?? 'instagram';
    const allDims = getDimensionsForPlatform(social);
    let picked: AssetDimension[] = [];

    if (answers?.dimensions) {
      const raw = answers.dimensions.includes(OFFLINE_MULTI_ANSWER_JOIN)
        ? answers.dimensions.split(OFFLINE_MULTI_ANSWER_JOIN).map((s) => s.trim())
        : [answers.dimensions.trim()];
      for (const chunk of raw) {
        const namePart = chunk.replace(/\s*\(\d+×\d+\)\s*$/, '').trim();
        const match =
          allDims.find((d) => `${d.name} (${d.width}×${d.height})` === chunk) ??
          allDims.find((d) => d.name === namePart);
        if (match) picked.push(match);
      }
    }

    if (picked.length === 0) {
      out.push(
        assistantMessage([
          textPart('Select at least one size.'),
          askClarificationPart(generateId(), [
            {
              id: 'dimensions',
              prompt: 'Which sizes should we generate?',
              options: allDims.map((d) => `${d.name} (${d.width}×${d.height})`),
              allowMultiple: true,
            },
          ]),
        ])
      );
      return { nextState: next, assistantMessages: out };
    }

    next = { ...next, selectedDimensions: picked, internalStep: 'complete' };

    const formatId = state.formatId ?? 'social-post';
    const mappedSocial = state.socialPlatform ?? 'instagram';
    const platforms = mergePlatforms(mappedSocial, ctx.projectPlatforms);
    const projectType: 'single' | 'campaign' =
      picked.length > 1 ? 'campaign' : ctx.projectType;

    const descParts = [
      ctx.projectDescription,
      state.initialUserPrompt ? `User intent: ${state.initialUserPrompt}` : '',
      state.offlinePlatformLabel ? `Channel: ${state.offlinePlatformLabel}` : '',
    ].filter(Boolean);
    const description = descParts.join(' — ') || 'Offline wizard project';

    const assetTypes = picked.map((d) => d.name);
    const content = state.content ?? {};

    const firstDim = picked[0];
    const contentBlockLayout = buildContentBlockProps({
      formatId,
      dimension: firstDim,
      content,
      brandName: ctx.projectName,
    });

    const ribbon = {
      version: 1,
      type: 'jio-dot-pattern' as const,
      variant: 'dots-with-symbol' as const,
    };

    const toolParts: Array<Record<string, unknown>> = [
      textPart(
        `Generating **${picked.length}** offline layout(s) on the canvas using ContentBlock + JioRibbon.`
      ),
      setProjectMetadataPart(generateId(), {
        name: ctx.projectName,
        description,
        projectType,
        platforms,
        assetTypes,
      }),
      generateContentBlockPart(generateId(), contentBlockLayout),
      generateRibbonPart(generateId(), ribbon),
    ];

    for (const dim of picked) {
      const ast = generateOfflineAssetAST({
        formatId,
        dimension: dim,
        content,
        brandName: ctx.projectName,
      });
      toolParts.push(
        generateAssetLayoutPart(generateId(), {
          assetName: dim.name,
          ast,
        })
      );
    }

    out.push(assistantMessage(toolParts));
    return { nextState: next, assistantMessages: out };
  }

  out.push(
    assistantMessage([
      textPart(
        'This offline wizard is complete. Adjust the project in settings or switch back online for AI edits.'
      ),
    ])
  );
  return { nextState: next, assistantMessages: out };
}

export async function checkCreateChatApiAvailable(): Promise<boolean> {
  try {
    const res = await fetch('/api/create/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [],
        brandContext: { brandName: '', theme: 'light', tokenFamilies: [] },
      }),
      signal: AbortSignal.timeout(5000),
    });
    return res.ok || res.status === 400;
  } catch {
    return false;
  }
}
