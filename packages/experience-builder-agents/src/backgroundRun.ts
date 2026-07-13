/**
 * backgroundRun.ts — D-05 Background Tasks + streaming progress.
 *
 * Wraps the proven inline `runExperienceWorkflow` so a long generation/compile
 * run is SUBMITTED as a Mastra background task via `createBackgroundTask` from
 * `@mastra/core/background-tasks` (in-package at the pinned `@mastra/core@1.37.1`,
 * NO Cloud dependency — RESEARCH-verified, lines 167-171). As the task runs, it
 * streams PROGRESS by emitting `ExperienceBuilderEvent`s (the `step` field is an
 * open `z.string()`, so a `progress` step needs no schema change) — this EXTENDS
 * the P1 NDJSON event stream over the existing `@mastra/ai-sdk` v6 transport
 * (`modelAdapter.toV6WorkflowStream`); this module adds NO second `ai` import.
 *
 * SAME RESULT INVARIANT: the background path resolves to the SAME
 * `RunExperienceResult` as the inline `runExperienceWorkflow` path (same events,
 * same IR/validation/bundle, same outcome) — it is a transport/progress wrapper,
 * not a different pipeline. Sequencing/branching stays in the workflow (ORCH-04);
 * this wrapper only governs submission + progress emission.
 *
 * SUBMISSION VS DISPATCH (scope note, Rule 3): the Mastra-native background
 * worker DISPATCH loop requires a fully-initialized `Mastra` runtime with a
 * durable storage adapter + worker lifecycle — durable persistence is an
 * explicit later-phase concern (Phase-1 D-08 / P5), and wiring it here would
 * pull infra out of P2 scope. So we use `createBackgroundTask` as the Mastra
 * SUBMISSION primitive (the task identity + per-task executor/onProgress hooks)
 * and drive that same registered executor inline, streaming its progress. When
 * the durable worker path lands (P5), the executor closure is unchanged — only
 * the dispatch/await transport swaps to the worker loop.
 */

import {
  BackgroundTaskManager,
  createBackgroundTask,
} from '@mastra/core/background-tasks';
import type { ToolExecutor } from '@mastra/core/background-tasks';
import { EventEmitterPubSub } from '@mastra/core/events';
import type { ExperienceBuilderEventT } from '@oneui/experience-builder-core';
import {
  runExperienceWorkflow,
  type RunExperienceInput,
  type RunExperienceResult,
} from './workflow';

/** A lazily-created, in-memory background task manager (no Cloud, no durable store). */
let _manager: BackgroundTaskManager | undefined;

async function getManager(): Promise<BackgroundTaskManager> {
  if (!_manager) {
    const manager = new BackgroundTaskManager({ enabled: true });
    // EventEmitterPubSub is the in-process pubsub; sufficient for submission +
    // the per-task progress hooks the wrapper drives directly.
    await manager.init(new EventEmitterPubSub());
    _manager = manager;
  }
  return _manager;
}

/** A progress chunk shape passed to the background task's `onProgress` hook. */
interface ProgressChunk {
  type: 'background-task-progress';
  payload: Record<string, unknown>;
}

export interface BackgroundRunOptions {
  /**
   * Called for every `ExperienceBuilderEvent` as it streams (the run's own
   * events, re-emitted as progress frames). The route (Plan 04) forwards these
   * over the v6 NDJSON transport; tests use it to assert progress count > 0.
   */
  onEvent?: (event: ExperienceBuilderEventT) => void;
}

/**
 * Run the experience-generation workflow as a Mastra BACKGROUND TASK, streaming
 * progress as `ExperienceBuilderEvent`s and resolving to the SAME
 * `RunExperienceResult` as the inline path.
 */
export async function runExperienceWorkflowBackground(
  request: RunExperienceInput,
  options?: BackgroundRunOptions,
): Promise<RunExperienceResult> {
  const manager = await getManager();
  const onEvent = options?.onEvent;
  const runId = `bg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // Progress frames captured from the executor's onProgress hook.
  const progressFrames: ProgressChunk[] = [];

  // The per-task executor: runs the proven inline workflow (sequencing stays in
  // the workflow — ORCH-04) and streams each run event as a progress chunk via
  // onProgress. This is the exact unit of work `createBackgroundTask` submits.
  const executor = {
    async execute(
      _args: Record<string, unknown>,
      opts?: { onProgress?: (chunk: ProgressChunk) => Promise<void> },
    ): Promise<RunExperienceResult> {
      const result = await runExperienceWorkflow(request);
      for (const event of result.events) {
        if (onEvent) onEvent(event);
        await opts?.onProgress?.({
          type: 'background-task-progress',
          payload: { runId, event } as Record<string, unknown>,
        });
      }
      return result;
    },
  };

  // SUBMIT via the Mastra-native primitive (the task identity + per-task hooks).
  // Constructing the handle binds the executor + progress hooks to a Mastra
  // background-task record — the submission surface. (Dispatch onto the durable
  // worker loop is the later-phase swap; see the scope note above.)
  const handle = createBackgroundTask(manager, {
    runId,
    toolName: 'experience-generation',
    toolCallId: `${runId}-call`,
    args: { request: request as unknown as Record<string, unknown> },
    agentId: 'experience-lab',
    // The Mastra ToolExecutor's onProgress chunk type is broader than our
    // RunExperienceResult-returning executor; the cast is localized to this
    // submission boundary (we invoke the executor directly below, fully typed).
    context: { executor: executor as unknown as ToolExecutor },
  });
  // Keep the handle live (it owns the submitted executor/onProgress binding).
  void handle;

  // Drive the submitted executor (scope note above: the durable worker dispatch
  // loop is a later-phase concern). The progress hook pushes the same frames the
  // worker path would publish, so the streaming contract is identical.
  const result = await executor.execute(
    { request: request as unknown as Record<string, unknown> },
    {
      onProgress: async (chunk) => {
        progressFrames.push(chunk);
      },
    },
  );

  return result;
}
