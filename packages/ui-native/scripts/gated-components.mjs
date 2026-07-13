/**
 * gated-components.mjs — single source of truth for "gated" components.
 *
 * A gated component is implementation-complete but intentionally NOT part of
 * the public `@oneui/ui-native` API yet. Three parts of the pipeline read this
 * list so they never contradict each other:
 *
 *   - src/index.ts                  — its export line is commented out (manual,
 *                                     enforced by scripts/check-exports.mjs).
 *   - scripts/copy-to-root-dist.mjs — strips its shipped types + usage docs.
 *   - packages/kb-rn JDS<Name>.ts   — its KB entry is marked status: 'planned'
 *                                     (enforced by scripts/check-exports.mjs).
 *
 * To PROMOTE a component to public:
 *   1. Remove its name from this array.
 *   2. Add its export line to src/index.ts.
 *   3. Set its KB status (packages/kb-rn) to 'stable' | 'beta' | 'alpha'.
 *
 * To GATE a component:
 *   1. Add its name here.
 *   2. Comment out / remove its export in src/index.ts.
 *   3. Set its KB status to 'planned'.
 */
export const GATED_COMPONENTS = ['LinkButton', 'Spinner', 'Separator'];
