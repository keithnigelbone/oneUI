# Deferred Items — Phase 04.2

Out-of-scope discoveries logged during execution (not fixed; not caused by the current plan's changes).

## From 04.2-02 (Wave 2 — IR layout primitive)

- **Pre-existing typecheck error in `@oneui/shared`** — `packages/shared/src/engine/buildNativeTheme.ts:233` `Property 'stateLayers' does not exist on type 'ResolvedTokenSet'` (TS2339). Present before this plan (the file is unmodified). Surfaces when typechecking any package that depends on `@oneui/shared`. Out of scope for the layout-primitive work.
- **Pre-existing `check:literals` violations in `@oneui/ui` Modal** — `packages/ui/src/components/Modal/Modal.module.css` (lines 100, 124: `width: 767px`) and `Modal.stories.tsx` (line 487: `rgba(0,...)`). Unrelated to the IR/validator changes; no literal was introduced by this plan (the new `TokenRefString` actively rejects literals at the IR boundary).

## From 04.2-05 (Wave 5 — transparency layer)

- **Pre-existing `@oneui/shared` `stateLayers`/`ResolvedTokenSet` typecheck drift (TS2339)** — surfaces in `packages/shared/src/engine/{buildNativeTheme.ts:233, __tests__/surfaceNew.test.ts, __tests__/engineDrift.test.ts}` and transitively in `apps/platform/src/design-tools/Foundations/Surfaces/SurfaceNewPreview.tsx`. Carried since 04.2-02; not caused by this plan (none of these files were touched). The agents/convex/lab-route files this plan changed typecheck cleanly once this pre-existing shared error is excluded.
- **Pre-existing `apps/platform/src/app/api/experience-lab/export/route.ts:262` TS2339** — `Property 'variantGroupId' does not exist on type 'never'`. Present before this plan (the export route is unmodified by 04.2-05). Out of scope for the transparency layer; flagged for a dedicated fix.
- **`check:literals` (full-repo) flags only pre-existing `@oneui/ui` Image/Modal violations** — the 04.2-05 Lab-route files (`RunTurn.tsx`, `ArtifactCardShape.tsx` + `.module.css`, `runStream.ts`, `useExperienceLabRun.ts`) are literal-clean; the transparency UI is token-only.
