/**
 * foundations/gradients/page.tsx
 *
 * Gradients Foundation — a per-brand list of named gradients, each with an
 * on-colour (the content colour intended to sit on the gradient fill).
 *
 * Gradients are flat brand-level tokens (like Elevation): each gradient emits
 * `--Gradient-{n}` (the fill) and `--Gradient-{n}-On` (its on-colour). Editing
 * happens in the side <Sheet> (draft → Save); the page auto-saves the committed
 * config via api.foundations.upsertByType with type: 'gradients'.
 */

'use client';

import { useState, useCallback, useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@oneui/convex';
import { Id } from '@oneui/convex/_generated/dataModel';
import type { GradientDef, GradientsFoundationConfig } from '@oneui/shared';
import { oklchToHex, parseOklchString } from '@oneui/shared';
import { gradientToCSS } from '@oneui/shared/engine';
import { Sheet } from '@/design-tools/Foundations/shared';
import { GradientsEditSheet, newGradient, type GradientColorScale } from './GradientsEditSheet';
import { Button } from '@oneui/ui/components/Button';
import { Badge } from '@oneui/ui/components/Badge';
import { Icon } from '@oneui/ui/components/Icon';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { useAutoSave } from '@/hooks';
import styles from '../foundation.module.css';
import gradientStyles from './gradients.module.css';

function getDefaultConfig(): GradientsFoundationConfig {
  return { gradients: [newGradient(1)] };
}

/** Parse an OKLCH string ("oklch(50% 0.18 340)") to hex, or null if unparseable. */
function parseOklchToHex(oklch: string): string | null {
  const parsed = parseOklchString(oklch);
  return parsed ? oklchToHex(parsed.lightness, parsed.chroma, parsed.hue) : null;
}

/** Read-time coercion: accept any persisted shape, fall back to a default. */
function safeConfig(raw: unknown): GradientsFoundationConfig {
  if (raw && typeof raw === 'object' && Array.isArray((raw as GradientsFoundationConfig).gradients)) {
    return { gradients: (raw as GradientsFoundationConfig).gradients };
  }
  return getDefaultConfig();
}

export default function GradientsFoundationPage() {
  const { currentBrand } = usePlatformContext();
  const brandId = currentBrand?.id as Id<'brands'> | undefined;
  const isSystemBrand = !!(currentBrand as { isSystem?: boolean })?.isSystem;

  // Read gradients from the brand overview payload rather than getByType.
  // getByType validates its `type` arg server-side, so calling it with
  // 'gradients' throws on any deployment that predates this foundation (the
  // rollout window before `convex dev` / `convex deploy` runs). The overview
  // query only takes { brandId } — always valid — so the page renders during
  // rollout and light-up is automatic: `gradients` appears in the payload once
  // the backend is updated.
  const overview = useQuery(
    api.foundations.getBrandOverviewData,
    brandId ? { brandId } : 'skip',
  );
  // Brand colour scales feed the stop colour picker (role × 25 steps).
  // Custom scales (colorScales table) carry hex directly; preset-based brands
  // instead expose OKLCH steps via the overview payload's presetSelection.
  const colorScales = useQuery(
    api.colorScales.list,
    brandId ? { brandId } : 'skip',
  );

  const brandColorScales = useMemo<GradientColorScale[]>(() => {
    const custom = (colorScales ?? [])
      .map((s) => ({
        name: s.name,
        steps: (s.steps ?? [])
          .map((st) => ({ step: Number(st.step), hex: st.hex }))
          .filter((st) => !!st.hex),
      }))
      .filter((sc) => sc.steps.length > 0);
    if (custom.length) return custom;

    const preset = (overview as { presetSelection?: { selectedScales?: unknown } } | null | undefined)
      ?.presetSelection?.selectedScales;
    if (!Array.isArray(preset)) return [];
    return (preset as { name: string; steps?: { step: string; oklch: string }[] }[])
      .map((s) => ({
        name: s.name,
        steps: (s.steps ?? [])
          .map((st) => ({ step: Number(st.step), hex: parseOklchToHex(st.oklch) }))
          .filter((st): st is { step: number; hex: string } => !!st.hex),
      }))
      .filter((sc) => sc.steps.length > 0);
  }, [colorScales, overview]);

  // The backend advertises gradient support once the payload carries the key.
  const backendReady = !!overview && 'gradients' in (overview as Record<string, unknown>);
  const existingFoundation =
    overview === undefined
      ? undefined
      : ((overview as { gradients?: { config?: unknown } | null }).gradients ?? null);

  const [config, setConfig] = useState<GradientsFoundationConfig>(getDefaultConfig());
  // Whether the saved config has been adopted (or confirmed absent). Autosave
  // waits on this so a slow overview resolve can't clobber persisted gradients.
  const [loaded, setLoaded] = useState(false);
  // Set once the user commits an edit. Because the editor is usable before the
  // (heavy) overview query resolves, a local edit can land BEFORE the saved
  // config arrives — this flag stops the adopt-once effect from overwriting it.
  const [userEdited, setUserEdited] = useState(false);
  const prevBrandIdRef = useRef(brandId);
  const loadedRef = useRef(false);

  const { isSaving, saveNow } = useAutoSave({
    config,
    brandId,
    type: 'gradients',
    // Only persist once the backend knows the type AND we've adopted any saved
    // config; until then editing is local-only (see backendReady note above).
    enabled: loaded && !isSystemBrand && backendReady,
  });

  // The editor is usable immediately from the default config — it does NOT wait
  // on the (heavy) overview query. When a saved gradients foundation resolves we
  // adopt it once; a brand switch resets to the default until the new brand
  // loads.
  useEffect(() => {
    if (prevBrandIdRef.current !== brandId) {
      prevBrandIdRef.current = brandId;
      loadedRef.current = false;
      setLoaded(false);
      setUserEdited(false);
      setConfig(getDefaultConfig());
      return;
    }
    if (loadedRef.current) return;

    // The user already edited locally before the saved config resolved — never
    // overwrite their edits. Once the backend is ready, mark loaded AND persist
    // them explicitly: autosave's enable-transition captures the current config
    // as its baseline and skips the first save, so this pre-load edit would
    // otherwise never reach the server.
    if (userEdited) {
      if (backendReady) {
        loadedRef.current = true;
        setLoaded(true);
        if (!isSystemBrand) void saveNow();
      }
      return;
    }

    if (existingFoundation?.config) {
      setConfig(safeConfig(existingFoundation.config));
      loadedRef.current = true;
      setLoaded(true);
    } else if (existingFoundation === null) {
      // Query resolved with nothing saved — keep the default, mark loaded.
      loadedRef.current = true;
      setLoaded(true);
    }
  }, [existingFoundation, brandId, userEdited, backendReady, isSystemBrand, saveNow]);

  // ── Brand-config editing via the side sheet (draft → Save) ──────────────
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<GradientDef[] | null>(null);

  // While the sheet is open, the page previews the live draft.
  const displayGradients = draft ?? config.gradients;

  const openEdit = useCallback(() => {
    // Deep-ish clone so draft edits never mutate the committed config.
    setDraft(config.gradients.map((g) => ({ ...g, stops: g.stops.map((s) => ({ ...s })) })));
    setSheetOpen(true);
  }, [config.gradients]);

  const discardEdit = useCallback(() => {
    setSheetOpen(false);
    setDraft(null);
  }, []);

  const saveEdit = useCallback(() => {
    if (draft) {
      setConfig({ gradients: draft });
      // Mark the config as user-owned so a late overview resolve can't clobber
      // it (see the adopt-once effect above).
      setUserEdited(true);
    }
    setDraft(null);
    setSheetOpen(false);
  }, [draft]);

  const isReadOnly = isSystemBrand;

  return (
    <div className={styles.page}>
      <div className={gradientStyles.pageHeaderRow}>
        <div className={styles.header}>
          <h1 className={styles.title}>Gradients</h1>
          <p className={styles.description}>
            Brand gradients — linear, radial, or conic — each paired with an on-colour for
            content placed on the fill. Every gradient emits <code>--Gradient-{'{n}'}</code> and{' '}
            <code>--Gradient-{'{n}'}-On</code>.
            {currentBrand && (
              <span className={styles.brandIndicator}>
                {' '}Configuring for <strong>{currentBrand.name}</strong>
              </span>
            )}
          </p>
        </div>
        {!isReadOnly && (
          <Button
            attention="high"
            size="small"
            start={<Icon icon="edit" emphasis="tintedA11y" />}
            onPress={openEdit}
            disabled={brandId == null}
          >
            Edit
          </Button>
        )}
      </div>

      <div className={styles.content}>
        <div className={gradientStyles.gradientList}>
          {displayGradients.length === 0 && (
            <div className={gradientStyles.emptyState}>
              <span className={gradientStyles.emptyText}>
                No gradients yet. Use Edit to add one.
              </span>
            </div>
          )}

          {displayGradients.map((g, index) => {
            const css = gradientToCSS(g);
            return (
              <section key={g.id} className={gradientStyles.gradientCard}>
                <div className={gradientStyles.cardHeader}>
                  <h2 className={gradientStyles.cardTitle}>{g.name}</h2>
                  <span className={gradientStyles.cardMeta}>--Gradient-{index + 1}</span>
                </div>
                <div className={gradientStyles.previewRow}>
                  <div className={gradientStyles.swatch} style={{ background: css }}>
                    <span className={gradientStyles.swatchLabel} style={{ color: g.onColor }}>
                      Aa
                    </span>
                  </div>
                  <div className={gradientStyles.samples}>
                    {/* Real components so the preview reflects Jio's actual
                        Button/Badge shape, typography and sizing. */}
                    <Button
                      attention="high"
                      style={
                        {
                          // Fill the (bold) button with the gradient + on-colour text.
                          '--Button-backgroundColor': css,
                          '--Button-backgroundColor-bold': css,
                          '--Button-textColor': g.onColor,
                          '--Button-textColor-bold': g.onColor,
                        } as CSSProperties
                      }
                    >
                      Button
                    </Button>
                    <Badge
                      attention="low"
                      appearance="neutral"
                      style={{
                        // Gradient outline on the real low-emphasis Badge: page-colour
                        // fill on the padding-box, gradient on the border-box, border
                        // made transparent so only the gradient shows in the ring.
                        background: `linear-gradient(var(--Surface-Main), var(--Surface-Main)) padding-box, ${css} border-box`,
                        borderColor: 'transparent',
                      }}
                    >
                      Badge
                    </Badge>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <Sheet
        open={sheetOpen}
        title="Edit Gradients"
        onClose={discardEdit}
        onDiscard={discardEdit}
        onSave={saveEdit}
      >
        {draft && (
          <GradientsEditSheet
            gradients={draft}
            onChange={setDraft}
            colorScales={brandColorScales}
          />
        )}
      </Sheet>

      {isSaving && <div className={gradientStyles.savingIndicator}>Saving…</div>}
    </div>
  );
}
