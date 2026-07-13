/**
 * renderLabMessagePart.tsx — the Lab `renderMessagePart` dispatch (D-09 framework).
 *
 * This is the chat-first Lab's mode-specific message-part dispatcher, mirroring
 * `packages/ui/.../ChatSurface/parts/index.tsx`'s `defaultRenderMessagePart`. It
 * matches the Lab's `data-*` parts and returns the corresponding component;
 * unknown parts fall through to `null` so `ChatSurface` renders its built-in
 * text/tool parts.
 *
 *   - `data-run-progress`  → `<RunTurn>` (the streaming run turn, this plan).
 *   - `data-campaign-plan` → EXTENSION POINT for Plan 04's inline campaign-plan
 *     card. The discriminator is reserved below; Plan 04 wires the branch.
 *
 * Isolation: the part payloads follow the AI-SDK `data-*` convention but carry
 * NO `ai`/`@ai-sdk` import — the discriminators are local string constants.
 */

import type { ReactNode } from 'react';
import type {
  ChatMessage,
  RenderMessagePart,
} from '@oneui/ui-internal/components/ChatSurface/ChatSurface.shared';
import { PART_RUN_PROGRESS, type RunProgressPart } from '../useLabConversation';
import { AgentWorkbench } from './AgentWorkbench';
import { CampaignPlanCard } from './CampaignPlanCard';
import type { CampaignPlanT } from '@oneui/experience-builder-core';

/**
 * EXTENSION POINT (Plan 04 / D-08): the inline campaign-plan card part. The
 * suspend-carrying run result frame (gap + campaignPlan) is surfaced by Plan 04
 * as a separate `data-campaign-plan` part appended to the assistant turn; this
 * dispatch will route it to `<CampaignPlanCard>`. Reserved here so the
 * discriminator is single-sourced and the run-turn part stays untouched.
 */
export const PART_CAMPAIGN_PLAN = 'data-campaign-plan' as const;

/**
 * The `data-campaign-plan` message-part payload (consumed by `CampaignPlanCard`).
 * The suspend-carrying run result frame (gap + campaignPlan) is surfaced as this
 * part on the assistant turn; the dispatch routes it to the inline card. The
 * `onResolved` callback feeds the resume NDJSON stream back into the
 * conversation hook so carousel frames place on the canvas (D-12).
 */
export interface CampaignPlanPart {
  type: typeof PART_CAMPAIGN_PLAN;
  plan: CampaignPlanT;
  campaignRunId: string;
  brandId: string;
  subBrandConfigId?: string;
  onResolved?: (response: Response) => void;
}

/**
 * The Lab message-part dispatch. Returns `null` for any unrecognised part so
 * `ChatSurface` falls through to its built-in text/tool rendering (documented
 * fall-through, CHAT-07).
 */
export const renderLabMessagePart: RenderMessagePart = (
  part: { type: string } & Record<string, unknown>,
  _context: { message: ChatMessage; index: number }
): ReactNode | null => {
  if (part.type === PART_RUN_PROGRESS) {
    const runPart = part as unknown as RunProgressPart;
    return (
      <AgentWorkbench
        events={runPart.events ?? []}
        status={runPart.status}
        outcome={runPart.outcome}
        result={runPart.result}
      />
    );
  }

  if (part.type === PART_CAMPAIGN_PLAN) {
    const planPart = part as unknown as CampaignPlanPart;
    return (
      <CampaignPlanCard
        plan={planPart.plan}
        campaignRunId={planPart.campaignRunId}
        brandId={planPart.brandId}
        subBrandConfigId={planPart.subBrandConfigId}
        onResolved={planPart.onResolved}
      />
    );
  }

  return null;
};

export default renderLabMessagePart;
