/**
 * production.ts
 *
 * Public production-readiness contracts for the isolated AI Experience Lab.
 * These are JSON-compatible schemas only. Runtime adapters live in the platform,
 * agents, preview, or Convex packages so the core package stays framework-free.
 */

import { z } from 'zod';
import { ExperienceBuilderEvent } from './events';
import { JioValidationResult } from './validation';

export const ExperienceRunStatus = z.enum([
  'queued',
  'running',
  'suspended',
  'artifact',
  'gap',
  'error',
  'cancelled',
]);
export type ExperienceRunStatusT = z.infer<typeof ExperienceRunStatus>;

export const ExperienceRunToolCall = z
  .object({
    toolName: z.string().min(1),
    provider: z.string().optional(),
    status: z.enum(['started', 'completed', 'failed', 'skipped']),
    startedAt: z.number().optional(),
    completedAt: z.number().optional(),
    durationMs: z.number().nonnegative().optional(),
    errorCode: z.string().optional(),
  })
  .strict();
export type ExperienceRunToolCallT = z.infer<typeof ExperienceRunToolCall>;

export const ExperienceRunModelUsage = z
  .object({
    provider: z.string().min(1),
    model: z.string().min(1),
    promptTokens: z.number().int().nonnegative().optional(),
    completionTokens: z.number().int().nonnegative().optional(),
    totalTokens: z.number().int().nonnegative().optional(),
    estimatedCostUsd: z.number().nonnegative().optional(),
  })
  .strict();
export type ExperienceRunModelUsageT = z.infer<typeof ExperienceRunModelUsage>;

export const ExperienceRunArtifactRef = z
  .object({
    artifactId: z.string().min(1),
    versionId: z.string().min(1),
    artifactType: z.string().min(1),
    outputProfile: z.string().min(1),
    previewUrl: z.string().optional(),
    thumbnailStorageId: z.string().optional(),
    exportIds: z.array(z.string()).default([]),
  })
  .strict();
export type ExperienceRunArtifactRefT = z.infer<typeof ExperienceRunArtifactRef>;

export const ExperienceRunRecord = z
  .object({
    runId: z.string().min(1),
    tenantId: z.string().optional(),
    brandId: z.string().min(1),
    subBrandConfigId: z.string().optional(),
    canvasDocumentId: z.string().optional(),
    conversationThreadId: z.string().optional(),
    status: ExperienceRunStatus,
    request: z.record(z.string(), z.unknown()),
    events: z.array(ExperienceBuilderEvent).default([]),
    validation: JioValidationResult.optional(),
    artifacts: z.array(ExperienceRunArtifactRef).default([]),
    modelUsage: z.array(ExperienceRunModelUsage).default([]),
    toolCalls: z.array(ExperienceRunToolCall).default([]),
    createdAt: z.number(),
    updatedAt: z.number(),
    completedAt: z.number().optional(),
  })
  .strict();
export type ExperienceRunRecordT = z.infer<typeof ExperienceRunRecord>;

export const DesignContextSource = z.enum([
  'storybook-mcp',
  'registry-snapshot',
  'design-md',
  'local-source',
  'token-rules',
]);
export type DesignContextSourceT = z.infer<typeof DesignContextSource>;

export const DesignContextEntry = z
  .object({
    id: z.string().min(1),
    source: DesignContextSource,
    title: z.string().min(1),
    componentId: z.string().optional(),
    storyId: z.string().optional(),
    path: z.string().optional(),
    content: z.string().default(''),
    props: z.array(z.string()).default([]),
    slots: z.array(z.string()).default([]),
    variants: z.array(z.string()).default([]),
    tokens: z.array(z.string()).default([]),
  })
  .strict();
export type DesignContextEntryT = z.infer<typeof DesignContextEntry>;

export const DesignContextResolution = z
  .object({
    status: z.enum(['available', 'partial', 'unavailable', 'not-required']),
    query: z.string().optional(),
    components: z.array(z.string()).default([]),
    entries: z.array(DesignContextEntry).default([]),
    docsUsed: z.array(z.string()).default([]),
    missingComponents: z.array(z.string()).default([]),
    warnings: z.array(z.string()).default([]),
    source: z.enum(['mcp', 'hybrid', 'local-fallback', 'not-required']),
    url: z.string().optional(),
    error: z.string().optional(),
  })
  .strict();
export type DesignContextResolutionT = z.infer<typeof DesignContextResolution>;

export const HandoffFile = z
  .object({
    path: z.string().min(1),
    kind: z.enum(['ir', 'composition-spec', 'react', 'css', 'asset', 'report', 'export']),
    contentType: z.string().optional(),
    storageId: z.string().optional(),
  })
  .strict();
export type HandoffFileT = z.infer<typeof HandoffFile>;

export const ExperienceHandoffBundle = z
  .object({
    runId: z.string().min(1),
    artifactId: z.string().optional(),
    versionId: z.string().optional(),
    brandId: z.string().min(1),
    prompt: z.string().default(''),
    ir: z.unknown().optional(),
    compositionSpec: z.unknown().optional(),
    validation: JioValidationResult.optional(),
    previewUrl: z.string().optional(),
    storybookRefs: z.array(z.string()).default([]),
    files: z.array(HandoffFile).default([]),
    createdAt: z.number(),
  })
  .strict();
export type ExperienceHandoffBundleT = z.infer<typeof ExperienceHandoffBundle>;

export const SandboxOperationalCheck = z
  .object({
    id: z.string().min(1),
    provider: z.literal('daytona'),
    snapshotName: z.string().optional(),
    status: z.enum(['passed', 'failed', 'skipped']),
    bootMs: z.number().nonnegative().optional(),
    previewUrl: z.string().optional(),
    egressBlocked: z.boolean().optional(),
    ttlExpiresAt: z.number().optional(),
    error: z.string().optional(),
    checkedAt: z.number(),
  })
  .strict();
export type SandboxOperationalCheckT = z.infer<typeof SandboxOperationalCheck>;

export const ComplianceScore = z
  .object({
    scorer: z.enum([
      'ir-validity',
      'token-compliance',
      'component-availability',
      'surface-safety',
      'accessibility',
      'export-validity',
      'visual-quality',
    ]),
    passed: z.boolean(),
    score: z.number().min(0).max(1).optional(),
    findings: z.array(z.string()).default([]),
  })
  .strict();
export type ComplianceScoreT = z.infer<typeof ComplianceScore>;
