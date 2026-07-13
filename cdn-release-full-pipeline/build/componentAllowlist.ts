/**
 * componentAllowlist.ts — publish-time view of the released-component list.
 *
 * The canonical list lives in `packages/ui/src/registry/releasedComponents.ts`
 * (single source of truth, also consumed by the public-barrel generator and
 * machine-docs tooling). This module only assembles the shape `stagePackage.ts`
 * consumes.
 *
 * Used by `stagePackage.ts` at publish time to:
 *   1. Replace the wildcard `"./components/*"` entry in the staged package.json
 *      `exports` map with one explicit entry per allowed component. Subpaths not
 *      listed become unresolvable for consumers
 *      (`import from '@jds4/oneui-react/components/Foo'`).
 *   2. Point the root `.` export at the generated public barrel
 *      (`dist/index.public.*`), which omits WIP component re-exports.
 *
 * Internal components (Platform, ComponentHarness, _sliderInternals, etc.)
 * are intentionally NOT pruned from `dist/components/` — allowlisted
 * components reference some of them via relative imports at runtime
 * (e.g. Slider → ../_sliderInternals/SliderKnob). Node's `exports`
 * field still gates consumer access to those paths.
 *
 * Adding a new public component: add its directory name to
 * `RELEASED_COMPONENTS` in `releasedComponents.ts`, then run
 * `pnpm generate:public-barrel`.
 */

import {
  RELEASED_COMPONENTS,
  PUBLIC_INFRA_COMPONENT_MODULES,
} from '../../packages/ui/src/registry/releasedComponents';

/**
 * Component directory names (under `packages/ui/src/components/`) exposed as
 * explicit `./components/<Name>` subpaths in the published artifact:
 * the released components plus the infrastructure modules (BrandProvider,
 * Surface) every consumer app needs.
 */
export const ALLOWED_COMPONENTS: readonly string[] = [
  ...RELEASED_COMPONENTS,
  ...PUBLIC_INFRA_COMPONENT_MODULES,
];
