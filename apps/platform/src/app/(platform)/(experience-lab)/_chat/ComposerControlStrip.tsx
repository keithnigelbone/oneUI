/**
 * ComposerControlStrip.tsx
 *
 * The compact run-origin selector strip for the chat composer (D-07 / CHAT-03).
 * It exposes the four generation-context selectors — Brand, Sub-brand, Artifact
 * type, Output profile — that the retired right-dock `RequestPanel` used to own,
 * and renders into `ChatComposer`'s `leadingInline` slot via the chat host.
 *
 * KEY DIFFERENCE from `RequestPanel.tsx`: this is a CONTROLLED component. It holds
 * NO tldraw shape and performs NO `editor.updateShape` write. Selections are
 * lifted to the caller through a single `onChange(next)` prop carrying the whole
 * `{ brandId, subBrandConfigId?, artifactType, outputProfile }` value object. The
 * caller (the chat host / `useLabConversation`) owns this as free-form React
 * state, reused per turn until changed.
 *
 * Lifted VERBATIM from `RequestPanel` (D-07): the `brandOptions` mapping from the
 * real read-only Convex `brands.list` query, the `ARTIFACT_TYPE_OPTIONS`, the
 * `getValidProfilesForType` profile filtering, and the type-change auto-snap.
 *
 * CRITICAL (Pitfall 4 / 02.1): the `isResolvedBrandId` memo + `'skip'` sentinel
 * are preserved exactly. The dependent `getByParentBrand` query stays skipped
 * until `brandId` resolves against the live `brands.list` — a stale/placeholder
 * id never reaches the `v.id('brands')` validator (which would throw an
 * ArgumentValidationError and crash the canvas).
 *
 * Isolation: all Jio components are `@oneui/ui-internal/components/*` deep
 * imports (LAB-02/LAB-03); no `(builder)`/`ExperienceCanvas` import, no
 * `ai`/`@ai-sdk` import.
 */

'use client';

import { useCallback, useMemo } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { Select } from '@oneui/ui-internal/components/Select/Select';
import {
  ARTIFACT_TYPES,
  type ArtifactType,
  getValidProfilesForType,
  type OutputProfile,
} from '@oneui/experience-builder-core';
import {
  IMAGE_PROVIDER_OPTIONS,
  type ImageProviderPreference,
} from './imageGenerationOptions';
import styles from './ComposerControlStrip.module.css';

// ---------------------------------------------------------------------------
// Static option sets (lifted verbatim from RequestPanel.tsx:50-64)
// ---------------------------------------------------------------------------

/** Human-readable labels for the 8 artifact types (INPUT-02 / CHAT-03). */
export const ARTIFACT_TYPE_LABELS: Record<ArtifactType, string> = {
  'web-ui': 'Web UI',
  'app-screen': 'App screen',
  dashboard: 'Dashboard',
  'social-post': 'Social post',
  'instagram-carousel': 'Instagram carousel',
  'outdoor-display': 'Outdoor display',
  slide: 'Slide',
  image: 'Image',
};

const ARTIFACT_TYPE_OPTIONS = ARTIFACT_TYPES.map((t) => ({
  value: t,
  label: ARTIFACT_TYPE_LABELS[t],
}));

// ---------------------------------------------------------------------------
// Controlled value contract
// ---------------------------------------------------------------------------

/**
 * The run-origin configuration the strip edits. Free-form React state owned by
 * the caller — NOT a tldraw shape. Mirrors the prompt-card props the retired
 * RequestPanel persisted, minus the shape plumbing.
 */
export interface ComposerControlStripValue {
  /** Selected brand `_id` (Convex `Id<'brands'>` as string), or '' when unset. */
  brandId: string;
  /** Optional sub-brand config `_id`; `undefined` = parent brand only. */
  subBrandConfigId?: string;
  /** The chosen artifact type (drives which output profiles are valid). */
  artifactType: ArtifactType;
  /** The chosen output profile (always valid for `artifactType`). */
  outputProfile: OutputProfile;
  /** Optional generated-image provider preference for topic imagery. */
  imageProvider?: ImageProviderPreference;
}

export interface ComposerControlStripProps {
  /** Controlled run-origin value. */
  value: ComposerControlStripValue;
  /** Lifts the next value to the caller. The strip writes nothing else. */
  onChange: (next: ComposerControlStripValue) => void;
  /** Disables every selector (e.g. while a run is streaming). */
  disabled?: boolean;
  /**
   * Field layout. `'row'` (default) is the compact inline strip; `'column'`
   * stacks the fields full-width for the popover context menu.
   */
  layout?: 'row' | 'column';
}

/**
 * Resolve whether `brandId` is a REAL, currently-loaded `brands` doc id (GAP-02 /
 * Pitfall 4). This is the SINGLE source of the "resolved brand" notion shared by
 * the strip (to gate the dependent `getByParentBrand` query) AND the chat host
 * (to gate generation). It reuses the live read-only `brands.list` query and the
 * exact `.some(...)` membership check the strip's `'skip'` sentinel relies on —
 * a stale/placeholder/empty `brandId` is NEVER treated as resolved.
 *
 * `undefined` while `brands.list` is still loading is treated as NOT resolved
 * (conservative: no run fires against an unverified id).
 */
export function useResolvedBrandId(brandId: string): boolean {
  const brands = useQuery(api.brands.list);
  return useMemo(
    () =>
      Boolean(brandId) &&
      (brands ?? []).some((b) => (b._id as string) === brandId),
    [brands, brandId],
  );
}

export function ComposerControlStrip({
  value,
  onChange,
  disabled = false,
  layout = 'row',
}: ComposerControlStripProps) {
  const { brandId, subBrandConfigId, artifactType, outputProfile } = value;

  // CHAT-03 / D-02: real read-only Convex brands query. `undefined` while
  // loading, `[]` when empty — never a fabricated brand list.
  const brands = useQuery(api.brands.list);

  const brandOptions = useMemo(
    () =>
      (brands ?? []).map((b) => ({
        value: b._id as string,
        label: b.name,
      })),
    [brands],
  );

  // CRITICAL — sub-brand skip-gate (lifted verbatim, Pitfall 4 /
  // RequestPanel.tsx:147-166). Gate on the brandId being a REAL, currently-
  // loaded brand `_id` — not merely truthy. A stale/placeholder brandId that is
  // NOT a valid `Id<'brands'>` must never reach `getByParentBrand` (whose
  // `v.id('brands')` validator would throw an ArgumentValidationError and crash
  // the canvas). Skip until the id resolves against the live brand list.
  //
  // GAP-02: this is the SAME `brands.list` + `.some(...)` membership check now
  // shared via `useResolvedBrandId` — the strip computes it inline (it already
  // holds `brands`) to avoid a second `brands.list` subscription.
  const isResolvedBrandId = useMemo(
    () =>
      Boolean(brandId) &&
      (brands ?? []).some((b) => (b._id as string) === brandId),
    [brands, brandId],
  );
  const subBrands = useQuery(
    api.subBrandConfigs.getByParentBrand,
    isResolvedBrandId ? { parentBrandId: brandId as Id<'brands'> } : 'skip',
  );

  const subBrandOptions = useMemo(
    () => [
      // Explicit "parent brand only" choice that clears the prop.
      { value: '', label: '(Parent brand only)' },
      ...(subBrands ?? []).map((s) => ({ value: s._id as string, label: s.name })),
    ],
    [subBrands],
  );

  // CHAT-03 / D-03: profile options are FILTERED by the selected artifact type
  // — invalid pairings never appear as options.
  const profileOptions = useMemo(
    () =>
      getValidProfilesForType(artifactType).map((p) => ({
        value: p.id,
        label: p.label,
      })),
    [artifactType],
  );

  // KEY DIFFERENCE from RequestPanel: lift the next value via onChange instead
  // of writing shape props through editor.updateShape.
  const emit = useCallback(
    (patch: Partial<ComposerControlStripValue>) => {
      onChange({ ...value, ...patch });
    },
    [onChange, value],
  );

  const handleBrandChange = useCallback(
    (next: string) => emit({ brandId: next }),
    [emit],
  );

  const handleSubBrandChange = useCallback(
    // Empty string ("(Parent brand only)") clears the prop back to undefined.
    (next: string) => emit({ subBrandConfigId: next || undefined }),
    [emit],
  );

  const handleTypeChange = useCallback(
    (next: string) => {
      const nextType = next as ArtifactType;
      // D-03: when the type changes, the previously-selected profile may no
      // longer be valid — snap to the first valid profile for the new type so
      // the strip never holds an invalid type/profile pair. Both the type and
      // the (possibly snapped) profile are lifted in a SINGLE onChange.
      const validForNext = getValidProfilesForType(nextType);
      const stillValid = validForNext.some(
        (p) => p.id === (outputProfile as OutputProfile),
      );
      emit({
        artifactType: nextType,
        ...(!stillValid && validForNext[0]
          ? { outputProfile: validForNext[0].id }
          : {}),
      });
    },
    [emit, outputProfile],
  );

  const handleProfileChange = useCallback(
    (next: string) => emit({ outputProfile: next as OutputProfile }),
    [emit],
  );

  const handleImageProviderChange = useCallback(
    (next: string) => emit({ imageProvider: next as ImageProviderPreference }),
    [emit],
  );

  return (
    <div
      className={styles.strip}
      data-layout={layout}
      data-testid="composer-control-strip"
      role="group"
      aria-label="Generation context"
    >
      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="composer-brand">
          Brand
          {/* GAP-02: brand is required before generation can start. Mark the
           * field required (visible asterisk + accessible "required" text) so
           * the requirement is visible BEFORE the user submits. */}
          <span className={styles.requiredMark} aria-hidden="true">
            {' '}*
          </span>
          <span className={styles.visuallyHidden}> (required)</span>
        </label>
        <Select
          value={brandId}
          onChange={handleBrandChange}
          options={brandOptions}
          placeholder={brands === undefined ? 'Loading brands…' : 'Select a brand'}
          disabled={disabled}
          aria-label="Brand"
          className={styles.control}
        />
        {/* Short inline hint while no real brand is resolved — disappears the
         * moment a valid brand is selected. Pairs with the in-chat ask-turn the
         * host appends when a user submits with no resolved brand. */}
        {!isResolvedBrandId && brands !== undefined && (
          <p className={styles.fieldHint} data-testid="composer-brand-hint">
            Pick a brand to start generating.
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="composer-subbrand">
          Sub-brand
        </label>
        <Select
          value={subBrandConfigId ?? ''}
          onChange={handleSubBrandChange}
          options={subBrandOptions}
          placeholder={!brandId ? 'Select a brand first' : '(Parent brand only)'}
          disabled={disabled}
          aria-label="Sub-brand"
          className={styles.control}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="composer-type">
          Artifact type
        </label>
        <Select
          value={artifactType}
          onChange={handleTypeChange}
          options={ARTIFACT_TYPE_OPTIONS}
          placeholder="Select an artifact type"
          disabled={disabled}
          aria-label="Artifact type"
          className={styles.control}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="composer-profile">
          Output profile
        </label>
        <Select
          value={outputProfile}
          onChange={handleProfileChange}
          options={profileOptions}
          placeholder="Select an output profile"
          disabled={disabled}
          aria-label="Output profile"
          className={styles.control}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="composer-image-provider">
          Image source
        </label>
        <Select
          value={value.imageProvider ?? 'none'}
          onChange={handleImageProviderChange}
          options={IMAGE_PROVIDER_OPTIONS}
          placeholder="Select image source"
          disabled={disabled}
          aria-label="Image source"
          className={styles.control}
        />
      </div>
    </div>
  );
}

export default ComposerControlStrip;
