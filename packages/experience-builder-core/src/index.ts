/**
 * @oneui/experience-builder-core
 *
 * Framework-agnostic contracts for the Jio AI Experience Builder Lab.
 * Pure-TS, JSON-compatible values only — runs in Node, browser, or worker.
 *
 * This barrel is the frozen, importable foundation that plans 02–05 consume.
 */

// Artifact / card object model (D-05)
export * from './ir/artifactTypes';

// Markup-free IR schema (IR-01 / IR-02 / IR-04)
export * from './ir/schema';

// Output-profile table (D-03)
export * from './profiles/outputProfileTable';
export * from './profiles/renderContext';

// Non-web profile → brand-foundation platform/breakpoint map (D-02)
export * from './profiles/profilePlatformMap';

// IR → AST mapper (registry-safe; no element nodes) (IR-03)
export * from './ir/irToAst';

// IR JSON-patch diff/apply (IR-03)
export * from './ir/patch';

// Page/section composition contract (COMPOSITION-01)
export * from './composition/schema';
export * from './composition/patterns';

// Component-only live-canvas CompositionSpec (SPEC-01)
export * from './compositionSpec/schema';
export * from './compositionSpec/converters';
export * from './compositionSpec/quality';

// Contract types
export * from './contracts/foundationResolve';
export * from './contracts/campaignPlan';
export * from './contracts/registryItem';
export * from './contracts/validation';
export * from './contracts/events';
export * from './contracts/production';
