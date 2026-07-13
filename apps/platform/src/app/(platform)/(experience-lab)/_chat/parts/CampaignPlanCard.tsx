/**
 * CampaignPlanCard.tsx — the inline interactive campaign-plan card (D-08/D-10).
 *
 * This is the named deliverable of Phase 04.1: the campaign HITL surfaced as an
 * INLINE chat card (not a canvas plan-card shape). A campaign run suspends at
 * the plan checkpoint and rides the wire as a `gap` result frame CARRYING a
 * `campaignPlan` + a durable `campaignRunId` (the suspend-as-gap pitfall, see
 * `useLabConversation`/`RunTurn`). This card renders that plan, lets the user
 * pick a creative direction + a frame count, and POSTs the selection to the
 * UNCHANGED `/api/experience-lab/resume` route to resume the workflow.
 *
 * READ-ONLY CONTRACT (D-10): the resume body is EXACTLY the route's
 * `ResumeRequestBody` shape — `{ runId, brandId, directionIndex, frameCount,
 * subBrandConfigId? }`. No new Zod schema is introduced here; clamping
 * (directionIndex 0..len-1, frameCount 1..10) is the route's job (T-04.1-10).
 * The client uses PLAIN numbers (Anthropic-safe — no `.int()/.min()/.max()`).
 *
 * Resume response (D-12 seam): `/resume` replies with the SAME NDJSON stream the
 * run route uses. This card hands the raw `Response` to `onResolved` so the
 * conversation hook (`useLabConversation`) consumes it through the existing
 * `readNdjson` path and the returned `carouselFrames` reach
 * `canvasCallbacks.placeArtifact` on the canvas (the Plan-03 placement seam).
 *
 * Threat posture (T-04.1-12): every `CampaignPlanT` string field renders through
 * React escaping — never `dangerouslySetInnerHTML`; the plan stays markup-free.
 *
 * Isolation: all `@oneui/ui` imports use the deep `@oneui/ui-internal/*` alias;
 * NO `(builder)`/`ExperienceCanvas` import and NO `ai`/`@ai-sdk` import.
 */

'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Surface } from '@oneui/ui-internal/components/Surface/Surface';
import { RadioGroup, Radio } from '@oneui/ui-internal/components/Radio/Radio';
import { Stepper } from '@oneui/ui-internal/components/Stepper/Stepper';
import { Button } from '@oneui/ui-internal/components/Button/Button';
import { Badge } from '@oneui/ui-internal/components/Badge/Badge';
import type { CampaignPlanT } from '@oneui/experience-builder-core';
import styles from './CampaignPlanCard.module.css';

const RESUME_ENDPOINT = '/api/experience-lab/resume';

/** Frame-count bounds mirror the route's clamp (1..10) for the inline control. */
const MIN_FRAMES = 1;
const MAX_FRAMES = 10;

export interface CampaignPlanCardProps {
  /** The planner's structured output (the suspend payload). */
  plan: CampaignPlanT;
  /** The durable run id the plan was persisted under (resume `runId`). */
  campaignRunId: string;
  /** The brand the run is scoped to. */
  brandId: string;
  /** Optional sub-brand selection forwarded to the foundations loader (D-02). */
  subBrandConfigId?: string;
  /**
   * Hands the resume NDJSON `Response` back to the conversation hook so the
   * returned carousel frames place on the canvas (D-12 placement seam).
   */
  onResolved?: (response: Response) => void;
  /** Injectable fetch (defaults to global fetch) — lets tests drive the resume. */
  fetchImpl?: typeof fetch;
}

export function CampaignPlanCard({
  plan,
  campaignRunId,
  brandId,
  subBrandConfigId,
  onResolved,
  fetchImpl,
}: CampaignPlanCardProps) {
  const titleId = useId();
  const frameLabelId = useId();
  const headingRef = useRef<HTMLHeadingElement | null>(null);

  // Default the selection to the planner's recommendation (clamped defensively).
  const recommendedIndex = Math.max(
    0,
    Math.min(plan.directions.length - 1, Math.round(plan.recommendedDirectionIndex)),
  );
  const [directionIndex, setDirectionIndex] = useState<number>(recommendedIndex);
  const [frameCount, setFrameCount] = useState<number>(
    Math.max(MIN_FRAMES, Math.min(MAX_FRAMES, Math.round(plan.recommendedFrameCount))),
  );
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // a11y (UI-SPEC): when the HITL card mounts in the stream, move focus to the
  // heading so keyboard users land on the checkpoint.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  const doFetch = fetchImpl ?? (typeof fetch !== 'undefined' ? fetch : undefined);

  async function handleGenerate() {
    if (!doFetch || submitting) return;
    setSubmitting(true);
    // EXACTLY the route's ResumeRequestBody (D-10) — no new schema, no extra
    // keys; subBrandConfigId is a conditional spread (never an empty string).
    const body = {
      runId: campaignRunId,
      brandId,
      directionIndex,
      frameCount,
      ...(subBrandConfigId ? { subBrandConfigId } : {}),
    };
    setSubmitError(null);
    try {
      const response = await doFetch(RESUME_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      // Guard against non-OK responses BEFORE handing the body to the NDJSON
      // consumer — an HTTP error body must never be parsed as a run stream
      // (CR-02). Surface a retryable message instead.
      if (!response.ok) {
        setSubmitError(`Resume failed (${response.status})`);
        return;
      }
      // The resume reply is the SAME NDJSON stream — feed it back to the
      // conversation hook so the carousel frames reach the canvas (D-12).
      onResolved?.(response);
    } catch (err) {
      // Network / DNS failure — surface a retryable message instead of
      // silently re-enabling the button with no feedback (WR-05).
      setSubmitError(err instanceof Error ? err.message : 'Failed to start generation.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Surface
      mode="subtle"
      role="group"
      aria-labelledby={titleId}
      className={styles.card}
      data-campaign-plan-card
    >
      <h3 id={titleId} ref={headingRef} tabIndex={-1} className={styles.title}>
        Campaign plan
      </h3>

      <section className={styles.section}>
        <p className={styles.sectionLabel}>Brief</p>
        <p className={styles.sectionBody}>{plan.briefSummary}</p>
      </section>

      <section className={styles.section}>
        <p className={styles.sectionLabel}>Audience</p>
        <p className={styles.sectionBody}>{plan.audience}</p>
      </section>

      <section className={styles.section}>
        <p className={styles.sectionLabel}>Message hierarchy</p>
        <ol className={styles.hierarchy}>
          {plan.messageHierarchy.map((message, i) => (
            <li key={`${i}-${message}`} className={styles.hierarchyItem}>
              {message}
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.section}>
        <p className={styles.sectionLabel} id={`${titleId}-directions`}>
          Creative directions
        </p>
        <RadioGroup
          value={String(directionIndex)}
          onValueChange={(value) => setDirectionIndex(Number(value))}
          aria-labelledby={`${titleId}-directions`}
          appearance="primary"
          className={styles.directions}
        >
          {plan.directions.map((direction, i) => {
            const isRecommended = i === recommendedIndex;
            return (
              <div key={`${i}-${direction.name}`} className={styles.tile}>
                <Radio value={String(i)} appearance="primary">
                  <span className={styles.tileHead}>
                    <span className={styles.tileName}>{direction.name}</span>
                    {isRecommended && (
                      <Badge size="s" appearance="primary">
                        Recommended
                      </Badge>
                    )}
                  </span>
                  <span className={styles.tileConcept}>{direction.concept}</span>
                  <span className={styles.tileMeta}>
                    {direction.copyAngle} · {direction.leadRole} · {direction.surfaceMood}
                  </span>
                </Radio>
              </div>
            );
          })}
        </RadioGroup>
      </section>

      <section className={styles.frameRow}>
        <span id={frameLabelId} className={styles.sectionLabel}>
          Frames per direction
        </span>
        <Stepper
          value={frameCount}
          onChange={(_event, value) =>
            setFrameCount(value == null ? MIN_FRAMES : Math.round(value))
          }
          min={MIN_FRAMES}
          max={MAX_FRAMES}
          appearance="primary"
          aria-labelledby={frameLabelId}
        />
      </section>

      {submitError && (
        <p role="alert" className={styles.submitError}>
          {submitError}
        </p>
      )}

      <div className={styles.actions}>
        <Button
          attention="high"
          appearance="primary"
          onClick={handleGenerate}
          disabled={submitting}
        >
          Generate frames
        </Button>
      </div>
    </Surface>
  );
}

export default CampaignPlanCard;
