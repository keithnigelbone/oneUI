/**
 * ComposerContextMenu.tsx
 *
 * The generation-context selectors (Brand · Sub-brand · Artifact type · Output
 * profile) collapsed behind a SINGLE composer button that opens a popover menu —
 * the Codex/Claude-style "context chip" pattern. This replaces the always-visible
 * four-field `ComposerControlStrip` in the composer's `leadingInline` slot so the
 * composer stays compact and uncluttered; the strip's full logic is REUSED
 * verbatim inside the popover (no behaviour change — same controlled
 * value/onChange contract).
 *
 * The trigger button summarises the current context ("Jio · Web UI · Desktop")
 * or prompts to set it ("Set generation context") when no real brand is resolved,
 * carrying the same brand-required affordance the strip exposes inline.
 *
 * Isolation: Jio components via the `@oneui/ui-internal/*` deep alias; no
 * `(builder)` / `ExperienceCanvas` import, no `ai`/`@ai-sdk` import.
 */

'use client';

import { useId, useMemo, useState, type ComponentProps } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import {
  Popover,
  PopoverTrigger,
  PopoverPortal,
} from '@oneui/ui-internal/components/Popover/Popover';
import { getValidProfilesForType } from '@oneui/experience-builder-core';
import {
  ComposerControlStrip,
  ARTIFACT_TYPE_LABELS,
  useResolvedBrandId,
  type ComposerControlStripValue,
} from './ComposerControlStrip';
import styles from './ComposerContextMenu.module.css';

export interface ComposerContextMenuProps {
  value: ComposerControlStripValue;
  onChange: (next: ComposerControlStripValue) => void;
  disabled?: boolean;
}

export function ComposerContextMenu({
  value,
  onChange,
  disabled = false,
}: ComposerContextMenuProps) {
  const [open, setOpen] = useState(false);
  const triggerId = useId();

  // Brand NAME for the summary (the value holds the id). Reuses the same
  // read-only `brands.list` query the strip uses; `undefined` while loading.
  const brands = useQuery(api.brands.list);
  const brandResolved = useResolvedBrandId(value.brandId);

  const summary = useMemo(() => {
    const brandName = (brands ?? []).find((b) => (b._id as string) === value.brandId)?.name;
    if (!brandName || !brandResolved) return null;
    const artifactLabel = ARTIFACT_TYPE_LABELS[value.artifactType];
    const profileLabel = getValidProfilesForType(value.artifactType).find(
      (p) => p.id === value.outputProfile
    )?.label;
    return [brandName, artifactLabel, profileLabel].filter(Boolean).join(' · ');
  }, [brands, brandResolved, value.brandId, value.artifactType, value.outputProfile]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        id={triggerId}
        className={styles.trigger}
        disabled={disabled}
        data-testid="composer-context-trigger"
        data-incomplete={summary === null ? 'true' : undefined}
        aria-label={summary ? `Generation context: ${summary}` : 'Set generation context'}
      >
        <SlidersIcon className={styles.icon} />
        <span className={styles.summary}>{summary ?? 'Set generation context'}</span>
        <ChevronIcon className={styles.chevron} data-open={open ? 'true' : undefined} />
      </PopoverTrigger>
      <PopoverPortal side="top" align="start" sideOffset={8} arrow={false}>
        <div className={`${styles.popup} ${styles.menu}`} data-testid="composer-context-menu">
          <ComposerControlStrip
            value={value}
            onChange={onChange}
            disabled={disabled}
            layout="column"
          />
        </div>
      </PopoverPortal>
    </Popover>
  );
}

function SlidersIcon(props: ComponentProps<'svg'>) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h10M18 18h2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="6" r="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="8" cy="12" r="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="18" r="2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function ChevronIcon(props: ComponentProps<'svg'>) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default ComposerContextMenu;
