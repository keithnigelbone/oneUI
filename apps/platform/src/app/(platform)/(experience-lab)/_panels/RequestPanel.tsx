/**
 * RequestPanel.tsx
 *
 * The docked request panel for the Experience Lab (D-01 / INPUT-01..04). It
 * edits the CURRENTLY-SELECTED prompt card: reading `editor.getSelectedShapeIds()`
 * and persisting brand / artifact type / output profile / prompt back onto the
 * shape props via `editor.updateShape` (D-04). The card object is the request
 * object — this panel is its editor surface.
 *
 * Mirrors the UX of the Builder's `PropPanel.tsx` (a Jio-`Select`-driven,
 * selection-driven editor) WITHOUT importing it — the Lab is isolated from the
 * existing Builder (LAB-03). All Jio components are deep-path imports (never the
 * `@oneui/ui` barrel), styling is token-only CSS Modules (LAB-02), and the
 * single accent moment is the one `Button attention="high" appearance="primary"`
 * Run CTA (UI-SPEC Color § Accent).
 *
 * D-02: the brand Select populates from the real read-only Convex `brands.list`
 * query. D-03: the output-profile Select options are derived from
 * `getValidProfilesForType(selectedType)` so invalid type/profile pairings are
 * unselectable AT THE UI (not merely rejected downstream).
 */

'use client';

import { useCallback, useMemo } from 'react';
import type { Editor, TLShapeId } from 'tldraw';
import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { Select } from '@oneui/ui-internal/components/Select/Select';
import { InputField } from '@oneui/ui-internal/components/InputField';
import { Button } from '@oneui/ui-internal/components/Button/Button';
import {
  ARTIFACT_TYPES,
  type ArtifactType,
  getValidProfilesForType,
  type OutputProfile,
} from '@oneui/experience-builder-core';
import {
  PROMPT_CARD_SHAPE_TYPE,
  type PromptCardShape,
} from '../_canvas/shapes/PromptCardShape';
import {
  IMAGE_PROVIDER_OPTIONS,
  type ImageProviderPreference,
} from '../_chat/imageGenerationOptions';
import styles from './RequestPanel.module.css';

// ---------------------------------------------------------------------------
// Static option sets
// ---------------------------------------------------------------------------

/** Human-readable labels for the 8 artifact types (INPUT-02). */
const ARTIFACT_TYPE_LABELS: Record<ArtifactType, string> = {
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

/**
 * The artifact types that reveal the campaign-brief fields (D-04). When the
 * prompt card's `artifactType` is one of these, the RequestPanel progressively
 * discloses Audience / Objective / Channel — no new card kind, the fields ride
 * the existing prompt card.
 */
const CAMPAIGN_ARTIFACT_TYPES: ReadonlySet<ArtifactType> = new Set([
  'social-post',
  'instagram-carousel',
]);

/**
 * Channel options gated to the chosen campaign artifact type (mirrors the
 * output-profile Select's per-type gating, D-03). A leading empty option lets
 * the user clear the channel back to "no channel".
 */
const CHANNEL_OPTIONS_BY_TYPE: Partial<Record<ArtifactType, Array<{ value: string; label: string }>>> = {
  'social-post': [
    { value: '', label: 'Select a channel' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'x', label: 'X (Twitter)' },
    { value: 'linkedin', label: 'LinkedIn' },
  ],
  'instagram-carousel': [
    { value: '', label: 'Select a channel' },
    { value: 'instagram', label: 'Instagram' },
  ],
};

// ---------------------------------------------------------------------------
// Selection helpers
// ---------------------------------------------------------------------------

export interface RequestPanelProps {
  /** The Lab's scoped tldraw editor, or null before mount. */
  editor: Editor | null;
  /**
   * The currently-selected prompt card (resolved by the canvas shell). When
   * `null` the panel shows its empty state.
   */
  selectedPrompt: PromptCardShape | null;
  /** Fires the plan-05 Run flow for the selected prompt card (the Run CTA). */
  onRun: () => void;
  /** Whether a run is currently in flight (disables the CTA + shows progress). */
  isRunning?: boolean;
}

export function RequestPanel({
  editor,
  selectedPrompt,
  onRun,
  isRunning = false,
}: RequestPanelProps) {
  // D-02 / INPUT-01: real read-only Convex brands query. `undefined` while
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

  const selectedType = (selectedPrompt?.props.artifactType ?? 'web-ui') as ArtifactType;

  // D-02 / INPUT-01: the sub-brand Select is DEPENDENT on the chosen brand. The
  // query is skipped (disabled) until a brand is chosen — `'skip'` keeps it
  // dormant, `undefined` while loading, `[]` when the brand has no sub-brands
  // (never a fabricated list, exactly like the brand query's contract).
  //
  // Gate on the brandId being a REAL, currently-loaded brand `_id` — not merely
  // truthy. A card can carry a stale or placeholder brandId (persisted canvas
  // state from an older session, a seed value, etc.) that is NOT a valid
  // `Id<'brands'>`. `getByParentBrand` validates `v.id('brands')`, so passing
  // such a value throws an ArgumentValidationError that crashes the whole
  // canvas. Skipping until the id resolves against the live brand list keeps the
  // panel resilient (the brand query's "never fabricate / never crash" contract).
  const selectedBrandId = selectedPrompt?.props.brandId;
  const isResolvedBrandId = useMemo(
    () =>
      Boolean(selectedBrandId) &&
      (brands ?? []).some((b) => (b._id as string) === selectedBrandId),
    [brands, selectedBrandId],
  );
  const subBrands = useQuery(
    api.subBrandConfigs.getByParentBrand,
    isResolvedBrandId ? { parentBrandId: selectedBrandId as Id<'brands'> } : 'skip',
  );

  const subBrandOptions = useMemo(
    () => [
      // D-02 default: an explicit "parent brand only" choice that clears the prop.
      { value: '', label: '(Parent brand only)' },
      ...(subBrands ?? []).map((s) => ({ value: s._id as string, label: s.name })),
    ],
    [subBrands],
  );

  // D-03 / INPUT-03: profile options are FILTERED by the selected artifact type
  // — invalid pairings never appear as options.
  const profileOptions = useMemo(
    () =>
      getValidProfilesForType(selectedType).map((p) => ({
        value: p.id,
        label: p.label,
      })),
    [selectedType],
  );

  const updateProp = useCallback(
    (propName: keyof PromptCardShape['props'], value: unknown) => {
      if (!editor || !selectedPrompt) return;
      editor.updateShape({
        id: selectedPrompt.id as TLShapeId,
        type: PROMPT_CARD_SHAPE_TYPE as never,
        props: { [propName]: value },
      });
    },
    [editor, selectedPrompt],
  );

  const handleBrandChange = useCallback(
    (value: string) => updateProp('brandId', value),
    [updateProp],
  );

  const handleSubBrandChange = useCallback(
    // Empty string ("(Parent brand only)") clears the prop back to undefined.
    (value: string) => updateProp('subBrandConfigId', value || undefined),
    [updateProp],
  );

  const handleTypeChange = useCallback(
    (value: string) => {
      const nextType = value as ArtifactType;
      updateProp('artifactType', nextType);
      // D-03: when the type changes, the previously-selected profile may no
      // longer be valid — snap to the first valid profile for the new type so
      // the card never holds an invalid type/profile pair.
      const validForNext = getValidProfilesForType(nextType);
      const stillValid =
        selectedPrompt &&
        validForNext.some((p) => p.id === (selectedPrompt.props.outputProfile as OutputProfile));
      if (!stillValid && validForNext[0]) {
        updateProp('outputProfile', validForNext[0].id);
      }
    },
    [updateProp, selectedPrompt],
  );

  const handleProfileChange = useCallback(
    (value: string) => updateProp('outputProfile', value as OutputProfile),
    [updateProp],
  );
  const handleImageProviderChange = useCallback(
    (value: string) => updateProp('imageProvider', value as ImageProviderPreference),
    [updateProp],
  );

  const handlePromptChange = useCallback(
    (value: string) => updateProp('prompt', value),
    [updateProp],
  );

  // D-04 campaign brief handlers. Empty string clears the prop back to undefined.
  const handleAudienceChange = useCallback(
    (value: string) => updateProp('audience', value || undefined),
    [updateProp],
  );
  const handleObjectiveChange = useCallback(
    (value: string) => updateProp('objective', value || undefined),
    [updateProp],
  );
  const handleChannelChange = useCallback(
    (value: string) => updateProp('channel', value || undefined),
    [updateProp],
  );

  // D-04: reveal the campaign-brief group only for social-post / instagram-carousel.
  const isCampaignType = CAMPAIGN_ARTIFACT_TYPES.has(selectedType);
  const channelOptions = CHANNEL_OPTIONS_BY_TYPE[selectedType] ?? [];

  if (!selectedPrompt) {
    return (
      <aside className={styles.panel} data-testid="request-panel" aria-label="Request">
        <h2 className={styles.panelTitle}>Request</h2>
        <p className={styles.emptyState} data-testid="request-panel-empty">
          Select a prompt card on the canvas to configure its brand, artifact
          type, and output profile.
        </p>
      </aside>
    );
  }

  const { brandId, outputProfile, prompt } = selectedPrompt.props;
  const canRun = Boolean(brandId) && Boolean(prompt.trim());

  return (
    <aside className={styles.panel} data-testid="request-panel" aria-label="Request">
      <h2 className={styles.panelTitle}>Request</h2>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="request-brand">
          Brand
        </label>
        <Select
          value={brandId}
          onChange={handleBrandChange}
          options={brandOptions}
          placeholder={brands === undefined ? 'Loading brands…' : 'Select a brand'}
          aria-label="Brand"
          className={styles.control}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="request-subbrand">
          Sub-brand
        </label>
        <Select
          value={selectedPrompt.props.subBrandConfigId ?? ''}
          onChange={handleSubBrandChange}
          options={subBrandOptions}
          placeholder={!brandId ? 'Select a brand first' : '(Parent brand only)'}
          aria-label="Sub-brand"
          className={styles.control}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="request-type">
          Artifact type
        </label>
        <Select
          value={selectedType}
          onChange={handleTypeChange}
          options={ARTIFACT_TYPE_OPTIONS}
          placeholder="Select an artifact type"
          aria-label="Artifact type"
          className={styles.control}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="request-profile">
          Output profile
        </label>
        <Select
          value={outputProfile}
          onChange={handleProfileChange}
          options={profileOptions}
          placeholder="Select an output profile"
          aria-label="Output profile"
          className={styles.control}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor="request-image-provider">
          Image source
        </label>
        <Select
          value={selectedPrompt.props.imageProvider ?? 'none'}
          onChange={handleImageProviderChange}
          options={IMAGE_PROVIDER_OPTIONS}
          placeholder="Select image source"
          aria-label="Image source"
          className={styles.control}
        />
      </div>

      {/* D-04: campaign-brief progressive disclosure — revealed only for
          social-post / instagram-carousel. No new card kind; the fields persist
          on the prompt card and post with the run. */}
      {isCampaignType && (
        <div className={styles.briefGroup} data-testid="request-campaign-brief">
          <h3 className={styles.briefGroupTitle}>Campaign brief</h3>

          <div className={styles.field}>
            <InputField
              label="Audience"
              value={selectedPrompt.props.audience ?? ''}
              onChange={handleAudienceChange}
              placeholder="Who is this for? (e.g. urban prepaid users, 18–24)"
              appearance="secondary"
              data-testid="request-audience"
            />
          </div>

          <div className={styles.field}>
            <InputField
              label="Objective"
              value={selectedPrompt.props.objective ?? ''}
              onChange={handleObjectiveChange}
              placeholder="What should this campaign achieve?"
              appearance="secondary"
              data-testid="request-objective"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.fieldLabel} htmlFor="request-channel">
              Channel
            </label>
            <Select
              value={selectedPrompt.props.channel ?? ''}
              onChange={handleChannelChange}
              options={channelOptions}
              placeholder="Select a channel"
              aria-label="Channel"
              className={styles.control}
            />
          </div>
        </div>
      )}

      <div className={styles.field}>
        <InputField
          label="Prompt"
          value={prompt}
          onChange={handlePromptChange}
          placeholder="Describe the experience you want to generate…"
          appearance="secondary"
          data-testid="request-prompt"
        />
      </div>

      <div className={styles.cta}>
        <Button
          attention="high"
          appearance="primary"
          onClick={onRun}
          disabled={!canRun || isRunning}
          data-testid="request-run"
        >
          Run generation
        </Button>
      </div>
    </aside>
  );
}

export default RequestPanel;
