/**
 * AgentWorkbench.tsx
 *
 * Structured run presentation for the Experience Builder Lab. It replaces the
 * generic transcript-like run bubble with compact workbench cards while keeping
 * `useLabConversation` and the NDJSON event/result contract unchanged.
 */

'use client';

import { useMemo, type ReactNode } from 'react';
import { Badge } from '@oneui/ui-internal/components/Badge/Badge';
import { IconButton } from '@oneui/ui-internal/components/IconButton/IconButton';
import {
  Popover,
  PopoverPortal,
  PopoverTrigger,
} from '@oneui/ui-internal/components/Popover/Popover';
import { Surface } from '@oneui/ui-internal/components/Surface/Surface';
import type { ExperienceBuilderEventT } from '@oneui/experience-builder-core';
import type { RunResultFrame } from '../../_canvas/runStream';
import styles from './AgentWorkbench.module.css';

type BadgeAppearance = 'positive' | 'negative' | 'warning' | 'informative' | 'neutral';
type WorkbenchStatus = 'running' | 'done' | 'error';
type WorkbenchOutcome = 'artifact' | 'gap' | 'error' | 'pending';

const STEP_LABELS: Record<string, string> = {
  intent: 'Understand request',
  'resolve-foundation': 'Resolve foundations',
  retrieve: 'Retrieve components',
  plan: 'Plan composition',
  design: 'Select layout',
  copy: 'Draft copy',
  'generate-ir': 'Generate IR',
  compile: 'Compile preview',
  validate: 'Validate OneUI',
  preview: 'Render preview',
  evaluate: 'Critique visual quality',
  repair: 'Repair',
  'version-freeze': 'Freeze version',
};

const ORDERED_STEPS = [
  'intent',
  'resolve-foundation',
  'retrieve',
  'plan',
  'design',
  'copy',
  'generate-ir',
  'compile',
  'validate',
  'preview',
  'evaluate',
  'repair',
  'version-freeze',
] as const;

export interface AgentWorkbenchProps {
  events: ExperienceBuilderEventT[];
  status: WorkbenchStatus;
  outcome: WorkbenchOutcome;
  result?: RunResultFrame;
}

interface StepRow {
  step: string;
  label: string;
  status: 'queued' | 'started' | 'completed' | 'failed';
}

export function AgentWorkbench({ events, status, outcome, result }: AgentWorkbenchProps) {
  const steps = useMemo(() => buildSteps(events), [events]);
  const completed = steps.filter((step) => step.status === 'completed').length;
  const failed = steps.some((step) => step.status === 'failed');
  const progress = Math.round((completed / steps.length) * 100);
  const validation = result?.validation;
  const composition = result?.agentTrace?.compositionPlan;
  const evaluation = result?.evaluation ?? result?.agentTrace?.evaluation;
  const isRunning = status === 'running';
  const hasCampaignPlan = Boolean(result?.campaignPlan);
  const currentStep = currentStepForRun(steps, isRunning, failed);
  const previewReady = outcome === 'artifact' && Boolean(result?.previewUrl);
  const previewError = result?.previewError?.message;
  const statusAppearance: BadgeAppearance = previewError
    ? 'negative'
    : previewReady
      ? 'positive'
      : failed
        ? 'negative'
        : isRunning
          ? 'informative'
          : outcome === 'gap'
            ? 'warning'
            : 'neutral';

  return (
    <div className={styles.root} data-testid="agent-workbench">
      <Surface
        mode="subtle"
        className={styles.statusCard}
        aria-label={`Generation status: ${currentStep.title}`}
      >
        <div className={styles.compactStatus}>
          {isRunning ? (
            <LoadingDots />
          ) : (
            <Badge size="s" appearance={statusAppearance}>
              {currentStep.badge}
            </Badge>
          )}
          <Popover>
            <PopoverTrigger
              render={
                <IconButton
                  icon="moreHorizontal"
                  size="s"
                  attention="low"
                  appearance="neutral"
                  aria-label="Generation details"
                  data-testid="agent-workbench-details"
                />
              }
            />
            <PopoverPortal
              side="bottom"
              align="end"
              sideOffset={8}
              arrow={false}
            >
              <div className={`${styles.detailsPopup} ${styles.detailsPanel}`}>
                <div className={styles.detailsSummary}>
                  <span className={styles.meta}>Experience generation</span>
                  <h3 className={styles.statusTitle}>{currentStep.title}</h3>
                  <p className={styles.body}>{currentStep.description}</p>
                </div>
                <div className={styles.grid}>
                  <IntentSummaryCard result={result} outcome={outcome} running={isRunning} />
                  <QuestionListCard hasCampaignPlan={hasCampaignPlan} outcome={outcome} />
                  <PlanChecklistCard steps={steps} />
                  <GenerationProgressCard
                    progress={progress}
                    completed={completed}
                    total={steps.length}
                    failed={failed}
                    running={isRunning}
                  />
                  <DesignCritiqueCard
                    compositionLabel={
                      composition
                        ? `${composition.pageType} · ${composition.pagePatternId}`
                        : 'Composition pending'
                    }
                    evaluationComposite={evaluation?.composite}
                    previewVerified={result?.previewVerification?.cssVariables.every(
                      (check) => check.status === 'passed'
                    )}
                  />
                  <ValidationResultsCard validation={validation} />
                  <FinalActionsCard
                    outcome={outcome}
                    running={isRunning}
                    previewUrl={result?.previewUrl}
                    previewError={previewError}
                  />
                </div>
              </div>
            </PopoverPortal>
          </Popover>
        </div>

        <div className={styles.stack}>
          <div className={styles.progressTrack} aria-hidden="true">
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
        </div>
      </Surface>
    </div>
  );
}

function LoadingDots() {
  return (
    <div className={styles.loadingDots} aria-hidden="true" data-testid="agent-loading-dots">
      <span />
      <span />
      <span />
    </div>
  );
}

function currentStepForRun(
  steps: StepRow[],
  running: boolean,
  failed: boolean,
): { title: string; description: string; badge: string } {
  if (failed) {
    const failedStep = steps.find((step) => step.status === 'failed');
    return {
      title: failedStep?.label ?? 'Generation stopped',
      description: 'The run needs a repair before the preview can be accepted.',
      badge: 'Needs repair',
    };
  }
  if (running) {
    const active = [...steps].reverse().find((step) => step.status === 'started');
    const next = steps.find((step) => step.status === 'queued');
    const step = active ?? next;
    return {
      title: step?.label ?? 'Generating preview',
      description: 'The agents are composing, rendering, and checking the experience.',
      badge: 'Running',
    };
  }
  const allCompleted = steps.every((step) => step.status === 'completed');
  if (allCompleted) {
    return {
      title: 'Preview ready',
      description: 'The generated experience is available on the canvas.',
      badge: 'Ready',
    };
  }
  return {
    title: 'Waiting for generation',
    description: 'The run will update here as soon as work starts.',
    badge: 'Queued',
  };
}

function WorkbenchCard({
  title,
  appearance,
  badge,
  children,
  wide = false,
}: {
  title: string;
  appearance: BadgeAppearance;
  badge: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <Surface mode="subtle" className={`${styles.card} ${wide ? styles.wideCard : ''}`}>
      <div className={styles.cardHeader}>
        <h3 className={styles.title}>{title}</h3>
        <Badge size="s" appearance={appearance}>
          {badge}
        </Badge>
      </div>
      {children}
    </Surface>
  );
}

function IntentSummaryCard({
  result,
  outcome,
  running,
}: {
  result?: RunResultFrame;
  outcome: WorkbenchOutcome;
  running: boolean;
}) {
  const ir = result?.ir;
  const badge: BadgeAppearance =
    outcome === 'artifact'
      ? 'positive'
      : outcome === 'gap'
        ? 'warning'
        : running
          ? 'informative'
          : 'negative';
  return (
    <WorkbenchCard title="Intent" appearance={badge} badge={running ? 'Active' : outcome}>
      <div className={styles.stack}>
        <span className={styles.label}>{ir?.artifactType ?? 'Experience artifact'}</span>
        <p className={styles.body}>
          {ir
            ? `${ir.sections.length} sections composed for ${ir.targetProfile}.`
            : 'The agents are resolving the request into a OneUI composition.'}
        </p>
      </div>
    </WorkbenchCard>
  );
}

function QuestionListCard({
  hasCampaignPlan,
  outcome,
}: {
  hasCampaignPlan: boolean;
  outcome: WorkbenchOutcome;
}) {
  const question = hasCampaignPlan
    ? 'Pick a creative direction and frame count.'
    : outcome === 'gap'
      ? 'Resolve the reported foundation or component gap.'
      : 'No clarifying question is required for this run.';
  return (
    <WorkbenchCard
      title="Questions"
      appearance={hasCampaignPlan || outcome === 'gap' ? 'warning' : 'neutral'}
      badge={hasCampaignPlan ? 'Needs input' : 'Clear'}
    >
      <p className={styles.body}>{question}</p>
    </WorkbenchCard>
  );
}

function PlanChecklistCard({ steps }: { steps: StepRow[] }) {
  return (
    <WorkbenchCard title="Plan" appearance="informative" badge="Checklist" wide>
      <ol className={styles.list}>
        {steps.map((step) => (
          <li key={step.step} className={styles.row}>
            <span className={styles.label}>{step.label}</span>
            <Badge size="s" appearance={appearanceForStep(step.status)}>
              {step.status}
            </Badge>
          </li>
        ))}
      </ol>
    </WorkbenchCard>
  );
}

function GenerationProgressCard({
  progress,
  completed,
  total,
  failed,
  running,
}: {
  progress: number;
  completed: number;
  total: number;
  failed: boolean;
  running: boolean;
}) {
  return (
    <WorkbenchCard
      title="Progress"
      appearance={failed ? 'negative' : running ? 'informative' : 'positive'}
      badge={failed ? 'Stopped' : running ? 'Running' : 'Done'}
    >
      <div className={styles.stack}>
        <span className={styles.meta}>
          {completed} of {total} stages complete
        </span>
        <div className={styles.progressTrack} aria-hidden="true">
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
      </div>
    </WorkbenchCard>
  );
}

function DesignCritiqueCard({
  compositionLabel,
  evaluationComposite,
  previewVerified,
}: {
  compositionLabel: string;
  evaluationComposite?: number;
  previewVerified?: boolean;
}) {
  return (
    <WorkbenchCard
      title="Critique"
      appearance={previewVerified ? 'positive' : 'informative'}
      badge={previewVerified ? 'Verified' : 'Reviewing'}
    >
      <div className={styles.stack}>
        <span className={styles.label}>{compositionLabel}</span>
        <p className={styles.body}>
          {evaluationComposite != null
            ? `Visual composite ${evaluationComposite.toFixed(1)}.`
            : 'Visual critique will attach after preview evaluation.'}
        </p>
      </div>
    </WorkbenchCard>
  );
}

function ValidationResultsCard({ validation }: { validation?: RunResultFrame['validation'] }) {
  const passed = validation?.passed === true;
  const codes = validation?.blocking?.map((item) => item.code) ?? [];
  return (
    <WorkbenchCard
      title="Validation"
      appearance={passed ? 'positive' : codes.length > 0 ? 'negative' : 'neutral'}
      badge={passed ? 'Passed' : codes.length > 0 ? 'Blocked' : 'Pending'}
    >
      <p className={styles.body}>
        {passed
          ? 'The IR and AST passed OneUI validation.'
          : codes.length > 0
            ? codes.join(', ')
            : 'Validation has not reported a terminal result yet.'}
      </p>
    </WorkbenchCard>
  );
}

function FinalActionsCard({
  outcome,
  running,
  previewUrl,
  previewError,
}: {
  outcome: WorkbenchOutcome;
  running: boolean;
  previewUrl?: string;
  previewError?: string;
}) {
  const ready = outcome === 'artifact' && Boolean(previewUrl);
  return (
    <WorkbenchCard
      title="Actions"
      appearance={ready ? 'positive' : previewError ? 'negative' : 'neutral'}
      badge={ready ? 'Ready' : running ? 'Waiting' : outcome}
    >
      <p className={styles.body}>
        {ready
          ? 'Preview is ready on the canvas.'
          : previewError
            ? previewError
            : 'Final actions unlock after the run produces a preview.'}
      </p>
    </WorkbenchCard>
  );
}

function buildSteps(events: ExperienceBuilderEventT[]): StepRow[] {
  const latest = new Map<string, StepRow['status']>();
  events.forEach((event) => {
    if (event.type !== 'step') return;
    latest.set(event.step, event.status);
  });
  return ORDERED_STEPS.map((step) => ({
    step,
    label: STEP_LABELS[step] ?? step,
    status: latest.get(step) ?? 'queued',
  }));
}

function appearanceForStep(status: StepRow['status']): BadgeAppearance {
  if (status === 'completed') return 'positive';
  if (status === 'failed') return 'negative';
  if (status === 'started') return 'informative';
  return 'neutral';
}

export default AgentWorkbench;
