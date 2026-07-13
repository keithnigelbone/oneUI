/**
 * foundations/typography/tabs.tsx
 *
 * React.memo'd tab panel components for the Typography Foundation page.
 * `openMenuFontId` and `previewFontId` are intentionally local to FontsTab —
 * the only consumer — so a font-menu toggle never re-renders sibling tabs.
 */

import React, { useState, useEffect } from 'react';
import {
  type TypographyConfigV2,
  type TypographyRole,
  type RoleFontSlot,
  type RoleFontSlotRole,
  TYPOGRAPHY_ROLES,
  TYPOGRAPHY_SIZES,
  FONT_WEIGHTS,
  FIXED_WEIGHT_ROLES,
  EMPHASIS_WEIGHT_ROLES,
  EMPHASIS_LEVELS,
  computeLineHeightFStep,
  parseFStepNumber,
  applyBreakpointGroupBump,
  viewportToBreakpointGroup,
  fStepToDimensionStep,
  typographyTokenName,
  F_STEPS,
  type FStep,
  type BreakpointGroup,
  type DensityId,
  type AvailableBreakpoint,
  type PlatformsFoundationConfig,
  resolveTextFontId,
  resolveHeadingFontId,
  textSlotWrite,
  headingSlotWrite,
  INDIA_CORE_SCRIPT_DEFINITIONS,
  resolveTypographyScriptSupport,
  sanitizeTypographyScriptCssName,
  type TypographyScriptConfig,
  type TypographyScriptKey,
  type TypographyScriptLineHeightMode,
} from '@oneui/shared';
import {
  type FontMetadata,
  type FontCategory,
  DEFAULT_FONT_SELECTION,
  buildFontFamilyString,
  type TypographyFoundationConfig,
} from '@/design-tools/Foundations/Typography';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import { Badge } from '@oneui/ui/components/Badge';
import { Button } from '@oneui/ui/components/Button';
import { Checkbox } from '@oneui/ui/components/Checkbox';
import { Collapsible } from '@oneui/ui/components/Collapsible';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Input } from '@oneui/ui/components/Input';
import { RadioGroup, Radio } from '@oneui/ui/components/Radio';
import { Select } from '@oneui/ui/components/Select';
import { ScopedPlatform } from '@oneui/ui/components/Platform';
import { ToggleGroup } from '@oneui/ui/components/ToggleGroup';
import {
  TableHeader,
  RoleBadge,
  RenderingControl,
  FontSlotRow,
  FontMenuItem,
  FontPreviewExpansion,
  ROLE_LABELS,
  FONT_CATEGORIES,
  getEffectiveFStep,
  getEffectiveFStepForPlatform,
  getEffectiveLHOffset,
  getPixelForFStep,
  fStepConfigKey,
  rolePreviewFontFamily,
  rolePreviewFontWeight,
} from './helpers';
import typographyStyles from './typography.module.css';

// F_STEPS is stored with the half-step `f2-5` appended at the end; sort by
// numeric value so the Type Scale dropdown renders it between f2 and f3.
const F_STEPS_SORTED: FStep[] = [...F_STEPS].sort(
  (a, b) => parseFStepNumber(a) - parseFStepNumber(b),
);

/** Dimension-step label for an f-step — the bare step value, e.g. `f7` → `10`, `f0` → `4`. */
const stepLabel = (step: FStep): string => fStepToDimensionStep(step);

/** Dropdown options labelled with Figma dimension-step names (value stays the f-step). */
const STEP_OPTIONS = F_STEPS_SORTED.map((step) => ({ value: step, label: stepLabel(step) }));

// ============================================================================
// FontsTab
// ============================================================================

export interface FontsTabProps {
  config: TypographyFoundationConfig;
  v2Config: TypographyConfigV2;
  allFonts: FontMetadata[];
  filteredFonts: FontMetadata[];
  fontCategoryFilter: FontCategory | 'all' | 'uploaded';
  loadedFonts: Set<string>;
  loadingFonts: Set<string>;
  pendingFont: FontMetadata | null;
  getFontFromAllSources: (id: string) => FontMetadata | undefined;
  loadFont: (font: FontMetadata) => void;
  setConfig: React.Dispatch<React.SetStateAction<TypographyFoundationConfig>>;
  setV2Config: React.Dispatch<React.SetStateAction<TypographyConfigV2>>;
  setFontCategoryFilter: (v: FontCategory | 'all' | 'uploaded') => void;
  setPendingFont: (font: FontMetadata | null) => void;
  setFontToDelete: (font: FontMetadata | null) => void;
  setShowUploadModal: (v: boolean) => void;
  onFontFeatureToggle: (slot: 'primary' | 'secondary' | 'code', feature: 'ligatures' | 'contextualAlternates', value: boolean) => void;
  onRemoveWeight?: (font: FontMetadata, weight: number) => void;
  isLoading: boolean;
}

export const FontsTab = React.memo(function FontsTab({
  config,
  v2Config,
  allFonts,
  filteredFonts,
  fontCategoryFilter,
  loadedFonts,
  loadingFonts,
  pendingFont,
  getFontFromAllSources,
  loadFont,
  setConfig,
  setV2Config,
  setFontCategoryFilter,
  setPendingFont,
  setFontToDelete,
  setShowUploadModal,
  onFontFeatureToggle,
  onRemoveWeight,
  isLoading,
}: FontsTabProps) {
  const [openMenuFontId, setOpenMenuFontId] = useState<string | null>(null);
  const [previewFontId, setPreviewFontId] = useState<string | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    if (!openMenuFontId) return;
    const handleClickOutside = () => setOpenMenuFontId(null);
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openMenuFontId]);

  const selectedFont = React.useMemo(() => {
    const fontId = resolveTextFontId(config.fontSelection);
    if (!fontId) return null;
    return getFontFromAllSources(fontId) || null;
  }, [config.fontSelection, getFontFromAllSources]);

  // The typeface list is a single radio group. The active radio reflects the
  // font the user is acting on: the transient `pendingFont` (just clicked,
  // assignment overlay open) or, at rest, the assigned Text-slot font.
  const activeFontId = pendingFont?.id ?? selectedFont?.id ?? '';
  const handleFontSelect = React.useCallback((id: string) => {
    const font = getFontFromAllSources(id);
    if (!font) return;
    if (!loadedFonts.has(id) && !loadingFonts.has(id)) loadFont(font);
    setPendingFont(font);
  }, [getFontFromAllSources, loadedFonts, loadingFonts, loadFont, setPendingFont]);

  return (
    <>
      <FoundationCard
        title="Font Slots"
        description="Two slots, brand-customisable. Text is the workhorse — used by every role unless overridden. Heading is the optional editorial slot for hero / headline copy; assign individual roles to it in the role mapping below. Script and Code are auxiliary slots."
      >
        {/* Table Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '160px 1fr 200px',
            padding: 'var(--Spacing-3-5) var(--Spacing-0)',
          }}
        >
          <TableHeader>Slot</TableHeader>
          <TableHeader>Font</TableHeader>
          <TableHeader>Preview</TableHeader>
        </div>

        {/* Text Row */}
        <FontSlotRow
          label="Text"
          sublabel="Default for all roles"
          fontId={resolveTextFontId(config.fontSelection) ?? undefined}
          getFontFromAllSources={getFontFromAllSources}
          loadedFonts={loadedFonts}
          hasBorder
        />

        {/* Heading Row */}
        <FontSlotRow
          label="Heading"
          sublabel="Optional — assigned per role below"
          fontId={resolveHeadingFontId(config.fontSelection) ?? undefined}
          getFontFromAllSources={getFontFromAllSources}
          loadedFonts={loadedFonts}
          hasBorder
        />

        {/* Script Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '160px 1fr 200px',
            padding: 'var(--Spacing-4) var(--Spacing-0)',
            borderBottom: '1px solid var(--Neutral-Stroke-Low)',
            alignItems: 'center',
          }}
        >
          <div>
            <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Medium)' }}>Script</span>
            <div style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)' }}>Fallback languages</div>
          </div>
          {(config.fontSelection?.fallbackFontIds?.length || 0) > 0 ? (
            <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-High)', fontWeight: 'var(--Typography-Weight-Medium)' }}>
              {config.fontSelection?.fallbackFontIds?.map((id) => getFontFromAllSources(id)?.name || id).join(', ')}
            </span>
          ) : (
            <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Low)' }}>Not set</span>
          )}
          <span style={{ fontSize: 'var(--Typography-Size-2XL)', color: 'var(--Text-High)' }}>
            {(config.fontSelection?.fallbackFontIds?.length || 0) > 0 ? 'Aa Bb' : '—'}
          </span>
        </div>

        {/* Code Row (NEW V2) */}
        <FontSlotRow
          label="Code"
          sublabel="Code/M, Code/S, Code/XS"
          fontId={v2Config.fontSelection?.codeFontId}
          getFontFromAllSources={getFontFromAllSources}
          loadedFonts={loadedFonts}
          hasBorder={false}
        />

        {/* OpenType Features */}
        <div style={{ borderTop: '1px solid var(--Neutral-Stroke-Low)', marginTop: 'var(--Spacing-4)', paddingTop: 'var(--Spacing-4)' }}>
          <span style={{ fontSize: 'var(--Label-S-FontSize)', lineHeight: 'var(--Label-S-LineHeight)', fontWeight: 'var(--Label-FontWeight-Medium)', color: 'var(--Text-High)', display: 'block', marginBottom: 'var(--Spacing-3)' }}>
            OpenType Features
          </span>
          <span style={{ fontSize: 'var(--Label-XS-FontSize)', lineHeight: 'var(--Body-S-LineHeight)', color: 'var(--Text-Low)', display: 'block', marginBottom: 'var(--Spacing-4)' }}>
            Toggle ligatures and contextual alternates per slot. Disabling <code style={{ fontFamily: 'var(--Typography-Font-Code, monospace)' }}>liga</code> splits fi/fl pairs — useful for UI labels on variable fonts.
          </span>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '160px 1fr 1fr',
              padding: 'var(--Spacing-3-5) var(--Spacing-0)',
            }}
          >
            <TableHeader>Font Slot</TableHeader>
            <TableHeader>Standard ligatures (liga)</TableHeader>
            <TableHeader>Contextual alternates (clig)</TableHeader>
          </div>
          {(['primary', 'secondary', 'code'] as const).map((slot, idx) => {
            const current = v2Config.fontFeatures?.[slot];
            const ligatures = current?.ligatures ?? true;
            const contextual = current?.contextualAlternates ?? true;
            return (
              <div
                key={slot}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '160px 1fr 1fr',
                  padding: 'var(--Spacing-3-5) var(--Spacing-0)',
                  borderBottom: idx < 2 ? '1px solid var(--Neutral-Stroke-Low)' : 'none',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 'var(--Label-S-FontSize)', lineHeight: 'var(--Label-S-LineHeight)', fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))', fontWeight: 'var(--Label-FontWeight-Medium)', color: 'var(--Text-High)', textTransform: 'capitalize' }}>
                  {slot}
                </span>
                <ToggleGroup
                  value={[ligatures ? 'on' : 'off']}
                  onValueChange={(values) => onFontFeatureToggle(slot, 'ligatures', (values[0] ?? 'on') === 'on')}
                  variant="subtool"
                  size="small"
                >
                  <ToggleGroup.Item value="on">On</ToggleGroup.Item>
                  <ToggleGroup.Item value="off">Off</ToggleGroup.Item>
                </ToggleGroup>
                <ToggleGroup
                  value={[contextual ? 'on' : 'off']}
                  onValueChange={(values) => onFontFeatureToggle(slot, 'contextualAlternates', (values[0] ?? 'on') === 'on')}
                  variant="subtool"
                  size="small"
                >
                  <ToggleGroup.Item value="on">On</ToggleGroup.Item>
                  <ToggleGroup.Item value="off">Off</ToggleGroup.Item>
                </ToggleGroup>
              </div>
            );
          })}
        </div>
      </FoundationCard>

      <FoundationCard
        title="Select Typeface"
        description="Choose fonts for your brand. Use the menu on each font to assign it to a slot."
      >
        {/* Category Filter + Upload */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--Spacing-4-5)',
          }}
        >
          <ToggleGroup
            value={[fontCategoryFilter]}
            onValueChange={(values) => setFontCategoryFilter((values[0] as typeof fontCategoryFilter) ?? 'all')}
            variant="subtool"
            size="small"
          >
            {FONT_CATEGORIES.map(cat => (
              <ToggleGroup.Item key={cat.value} value={cat.value}>
                {cat.label}
              </ToggleGroup.Item>
            ))}
          </ToggleGroup>

          <Button attention="low" size="small" onPress={() => setShowUploadModal(true)}>
            + Upload Font
          </Button>
        </div>

        {/* Font List */}
        <RadioGroup
          value={activeFontId}
          onValueChange={handleFontSelect}
          aria-label="Select typeface"
          omitLayoutWrapper
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2-5)' }}
        >
          {filteredFonts.map(font => {
            const isLoaded = loadedFonts.has(font.id);
            const isLoadingFont = loadingFonts.has(font.id);
            const fontFamily = isLoaded ? buildFontFamilyString(font) : 'inherit';

            const isPrimaryFont = resolveTextFontId(config.fontSelection) === font.id;
            const isSecondaryFont = resolveHeadingFontId(config.fontSelection) === font.id;
            const isScriptFont = config.fontSelection?.fallbackFontIds?.includes(font.id) ?? false;
            const isCodeFont = v2Config.fontSelection?.codeFontId === font.id;
            const isExpanded = previewFontId === font.id;

            // Accordion toggle: expand the row to reveal every weight (and size)
            // this typeface ships. Loads the font first so the preview renders.
            const togglePreview = () => {
              if (!loadedFonts.has(font.id) && !loadingFonts.has(font.id)) loadFont(font);
              setPreviewFontId(isExpanded ? null : font.id);
            };

            return (
              <React.Fragment key={font.id}>
                <div
                  className="font-row"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--Spacing-4)',
                    padding: 'var(--Spacing-4) var(--Spacing-0)',
                    border: 'none',
                    borderBottom: 'var(--Stroke-S) solid var(--Neutral-Stroke-Low)',
                    borderRadius: 'var(--Spacing-0)',
                    cursor: isLoadingFont ? 'wait' : 'default',
                    textAlign: 'left',
                    width: '100%',
                  }}
                >
                  {/* Selection indicator — design-system Radio, driven by the
                      RadioGroup. The wrapping onClick re-opens the assignment
                      overlay even when this font is ALREADY the active value
                      (Base UI's onValueChange only fires on a value change, so a
                      click on the already-selected radio would otherwise be a
                      no-op). */}
                  <span
                    style={{ display: 'inline-flex', flexShrink: 0 }}
                    onClick={() => {
                      if (!(isLoading || isLoadingFont)) handleFontSelect(font.id);
                    }}
                  >
                    <Radio
                      value={font.id}
                      appearance="neutral"
                      aria-label={`Select ${font.name}`}
                      disabled={isLoading || isLoadingFont}
                    />
                  </span>

                  {/* Font info — click to expand the weight accordion */}
                  <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={togglePreview}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-3-5)', marginBottom: 'var(--Spacing-2-5)' }}>
                      <span style={{ fontSize: 'var(--Typography-Size-M)', fontWeight: 'var(--Typography-Weight-Medium)', color: 'var(--Text-High)' }}>
                        {font.name}
                      </span>
                      {isPrimaryFont && <RoleBadge label="Text" />}
                      {isSecondaryFont && <RoleBadge label="Heading" />}
                      {isScriptFont && <RoleBadge label="Script" />}
                      {isCodeFont && <RoleBadge label="Code" />}
                      {font.isVariable && (
                        <Badge size="xs" appearance="neutral" attention="medium">Variable</Badge>
                      )}
                    </div>
                    <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)' }}>
                      {font.weights.length} {font.weights.length === 1 ? 'weight' : 'weights'} · {font.source === 'google' ? 'Google Fonts' : font.source === 'uploaded' ? 'Uploaded' : 'Custom'}
                    </span>
                  </div>

                  {/* Font preview — also toggles the accordion */}
                  <div style={{ fontFamily, fontSize: 'var(--Typography-Size-2XL)', color: 'var(--Text-High)', minWidth: '120px', textAlign: 'right', cursor: 'pointer' }} onClick={togglePreview}>
                    {isLoadingFont ? '...' : 'Aa Bb Cc'}
                  </div>

                  {/* Expand / collapse chevron */}
                  <IconButton
                    attention="low"
                    size="small"
                    aria-label={isExpanded ? 'Collapse weights' : 'Expand weights'}
                    aria-expanded={isExpanded}
                    onPress={togglePreview}
                    icon={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform var(--Motion-Duration-Discreet-Short)' }}>
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    }
                  />

                  {/* Three-dot menu */}
                  <div style={{ position: 'relative', marginLeft: 'var(--Spacing-3)' }}>
                    <IconButton
                      attention="low"
                      size="small"
                      onPress={() => setOpenMenuFontId(openMenuFontId === font.id ? null : font.id)}
                      aria-label="Font options"
                      icon={
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--Text-Medium)' }}>
                          <circle cx="5" cy="12" r="2" />
                          <circle cx="12" cy="12" r="2" />
                          <circle cx="19" cy="12" r="2" />
                        </svg>
                      }
                    />

                    {openMenuFontId === font.id && (
                      <div className="font-menu-dropdown" role="menu" tabIndex={-1} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                        <FontMenuItem
                          label="Set as Text"
                          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>}
                          onClick={() => {
                            if (!loadedFonts.has(font.id) && !loadingFonts.has(font.id)) loadFont(font);
                            setConfig(prev => ({
                              ...prev,
                              fontFamily: buildFontFamilyString(font),
                              fontSelection: { ...(prev.fontSelection || DEFAULT_FONT_SELECTION), ...textSlotWrite(font.id) },
                            }));
                            setOpenMenuFontId(null);
                          }}
                        />
                        <FontMenuItem
                          label="Set as Heading"
                          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="9" y1="3" x2="9" y2="21" /></svg>}
                          onClick={() => {
                            if (!loadedFonts.has(font.id) && !loadingFonts.has(font.id)) loadFont(font);
                            setConfig(prev => ({
                              ...prev,
                              fontSelection: { ...(prev.fontSelection || DEFAULT_FONT_SELECTION), ...headingSlotWrite(font.id), scope: 'dual' as const },
                            }));
                            setOpenMenuFontId(null);
                          }}
                        />
                        <FontMenuItem
                          label="Add as Script"
                          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7V4h16v3" /><path d="M9 20h6" /><path d="M12 4v16" /></svg>}
                          onClick={() => {
                            if (!loadedFonts.has(font.id) && !loadingFonts.has(font.id)) loadFont(font);
                            setConfig(prev => {
                              const currentFallbacks = prev.fontSelection?.fallbackFontIds || [];
                              if (currentFallbacks.includes(font.id)) return prev;
                              return {
                                ...prev,
                                fontSelection: { ...(prev.fontSelection || DEFAULT_FONT_SELECTION), fallbackFontIds: [...currentFallbacks, font.id] },
                              };
                            });
                            setOpenMenuFontId(null);
                          }}
                        />
                        <FontMenuItem
                          label="Set as Code"
                          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>}
                          onClick={() => {
                            if (!loadedFonts.has(font.id) && !loadingFonts.has(font.id)) loadFont(font);
                            setV2Config(prev => ({
                              ...prev,
                              fontSelection: { ...prev.fontSelection, codeFontId: font.id },
                            }));
                            setOpenMenuFontId(null);
                          }}
                        />
                        <div className="font-menu-divider" />
                        <FontMenuItem
                          label={previewFontId === font.id ? 'Hide Preview' : 'Preview Font'}
                          icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
                          onClick={() => {
                            if (!loadedFonts.has(font.id) && !loadingFonts.has(font.id)) loadFont(font);
                            setPreviewFontId(previewFontId === font.id ? null : font.id);
                            setOpenMenuFontId(null);
                          }}
                        />
                        {font.source === 'uploaded' && (
                          <>
                            <div className="font-menu-divider" />
                            <FontMenuItem
                              label="Delete"
                              danger
                              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>}
                              onClick={() => {
                                setFontToDelete(font);
                                setOpenMenuFontId(null);
                              }}
                            />
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Inline Font Preview */}
                {previewFontId === font.id && loadedFonts.has(font.id) && (
                  <FontPreviewExpansion
                    font={font}
                    onClose={() => setPreviewFontId(null)}
                    onRemoveWeight={
                      font.source === 'uploaded' && !font.isVariable
                        ? onRemoveWeight
                        : undefined
                    }
                  />
                )}
              </React.Fragment>
            );
          })}
        </RadioGroup>
      </FoundationCard>
    </>
  );
});

// ============================================================================
// ScriptsTab
// ============================================================================

const SCRIPT_LINE_HEIGHT_ROLES = ['display', 'headline', 'title', 'body', 'label'] as const;

const SCRIPT_LINE_HEIGHT_OPTIONS: Array<{ value: TypographyScriptLineHeightMode; label: string }> = [
  { value: 'ui', label: 'Default line height' },
  { value: 'reading', label: 'Roomier line height' },
  { value: 'custom', label: 'Custom line height' },
];

const SCRIPT_CONTEXT_PREVIEW_ROWS: Array<{ role: Exclude<TypographyRole, 'code'>; size: string }> = [
  { role: 'headline', size: 'S' },
  { role: 'title', size: 'M' },
  { role: 'body', size: 'M' },
  { role: 'label', size: 'S' },
];

const SCRIPT_PREVIEW_COPY: Partial<Record<string, Partial<Record<Exclude<TypographyRole, 'code'>, string>>>> = {
  devanagari: {
    headline: 'नई सेवा आज से सभी ग्राहकों के लिए उपलब्ध है',
    title: 'खाता, भुगतान और सहायता की जानकारी एक ही स्थान पर देखें',
    body: 'आज सुबह टीम ने नई सेवा शुरू की। उपयोगकर्ता अब अपने खाते की जानकारी साफ तरीके से देख सकते हैं। संदेश, भुगतान और सहायता एक ही जगह मिलते हैं।',
    label: 'खाता स्थिति अपडेट हुई। भुगतान लंबित है। सहायता उपलब्ध है।',
  },
  bengali: {
    headline: 'নতুন পরিষেবা আজ সব গ্রাহকের জন্য চালু হলো',
    title: 'অ্যাকাউন্ট, পেমেন্ট ও সহায়তার তথ্য এক জায়গায় দেখুন',
    body: 'আজ সকালে দলটি নতুন পরিষেবা চালু করেছে। ব্যবহারকারীরা এখন অ্যাকাউন্টের তথ্য সহজে দেখতে পারেন। বার্তা, পেমেন্ট ও সহায়তা একই জায়গায় পাওয়া যায়।',
    label: 'অ্যাকাউন্ট আপডেট হয়েছে। পেমেন্ট বাকি আছে। সহায়তা পাওয়া যাবে।',
  },
  gujarati: {
    headline: 'નવી સેવા આજે બધા ગ્રાહકો માટે શરૂ થઈ',
    title: 'ખાતું, ચુકવણી અને સહાયની માહિતી એક જગ્યાએ જુઓ',
    body: 'આજે સવારે ટીમે નવી સેવા શરૂ કરી। વપરાશકર્તાઓ હવે ખાતાની માહિતી સરળ રીતે જોઈ શકે છે। સંદેશા, ચુકવણી અને સહાય એક જ જગ્યાએ મળે છે।',
    label: 'ખાતું અપડેટ થયું। ચુકવણી બાકી છે। સહાય ઉપલબ્ધ છે।',
  },
  gurmukhi: {
    headline: 'ਨਵੀਂ ਸੇਵਾ ਅੱਜ ਸਾਰੇ ਗਾਹਕਾਂ ਲਈ ਸ਼ੁਰੂ ਹੋਈ',
    title: 'ਖਾਤਾ, ਭੁਗਤਾਨ ਅਤੇ ਸਹਾਇਤਾ ਦੀ ਜਾਣਕਾਰੀ ਇਕ ਥਾਂ ਵੇਖੋ',
    body: 'ਅੱਜ ਸਵੇਰੇ ਟੀਮ ਨੇ ਨਵੀਂ ਸੇਵਾ ਸ਼ੁਰੂ ਕੀਤੀ। ਵਰਤੋਂਕਾਰ ਹੁਣ ਆਪਣੇ ਖਾਤੇ ਦੀ ਜਾਣਕਾਰੀ ਆਸਾਨੀ ਨਾਲ ਵੇਖ ਸਕਦੇ ਹਨ। ਸੁਨੇਹੇ, ਭੁਗਤਾਨ ਅਤੇ ਸਹਾਇਤਾ ਇਕ ਥਾਂ ਮਿਲਦੇ ਹਨ।',
    label: 'ਖਾਤਾ ਅਪਡੇਟ ਹੋਇਆ। ਭੁਗਤਾਨ ਬਾਕੀ ਹੈ। ਸਹਾਇਤਾ ਉਪਲਬਧ ਹੈ।',
  },
  kannada: {
    headline: 'ಹೊಸ ಸೇವೆ ಇಂದು ಎಲ್ಲಾ ಗ್ರಾಹಕರಿಗೆ ಲಭ್ಯವಾಗಿದೆ',
    title: 'ಖಾತೆ, ಪಾವತಿ ಮತ್ತು ಸಹಾಯದ ವಿವರಗಳನ್ನು ಒಂದೇ ಕಡೆ ನೋಡಿ',
    body: 'ಇಂದು ಬೆಳಗ್ಗೆ ತಂಡವು ಹೊಸ ಸೇವೆಯನ್ನು ಆರಂಭಿಸಿದೆ. ಬಳಕೆದಾರರು ಈಗ ಖಾತೆಯ ಮಾಹಿತಿಯನ್ನು ಸುಲಭವಾಗಿ ನೋಡಬಹುದು. ಸಂದೇಶಗಳು, ಪಾವತಿ ಮತ್ತು ಸಹಾಯ ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ಸಿಗುತ್ತವೆ.',
    label: 'ಖಾತೆ ನವೀಕರಿಸಲಾಗಿದೆ. ಪಾವತಿ ಬಾಕಿಯಿದೆ. ಸಹಾಯ ಲಭ್ಯವಿದೆ.',
  },
  malayalam: {
    headline: 'പുതിയ സേവനം ഇന്ന് എല്ലാ ഉപഭോക്താക്കൾക്കും ലഭ്യമാണ്',
    title: 'അക്കൗണ്ട്, പേയ്മെന്റ്, സഹായ വിവരങ്ങൾ ഒരിടത്ത് കാണുക',
    body: 'ഇന്ന് രാവിലെ സംഘം പുതിയ സേവനം ആരംഭിച്ചു. ഉപയോക്താക്കൾക്ക് ഇപ്പോൾ അക്കൗണ്ട് വിവരങ്ങൾ എളുപ്പത്തിൽ കാണാം. സന്ദേശങ്ങൾ, പേയ്മെന്റ്, സഹായം എല്ലാം ഒരിടത്ത് ലഭിക്കും.',
    label: 'അക്കൗണ്ട് പുതുക്കി. പേയ്മെന്റ് ബാക്കിയുണ്ട്. സഹായം ലഭ്യമാണ്.',
  },
  oriya: {
    headline: 'ନୂଆ ସେବା ଆଜି ସମସ୍ତ ଗ୍ରାହକଙ୍କ ପାଇଁ ଆରମ୍ଭ ହେଲା',
    title: 'ଖାତା, ପେମେଣ୍ଟ ଓ ସହାୟତା ସୂଚନା ଏକ ସ୍ଥାନରେ ଦେଖନ୍ତୁ',
    body: 'ଆଜି ସକାଳେ ଦଳ ନୂଆ ସେବା ଆରମ୍ଭ କଲା। ବ୍ୟବହାରକାରୀମାନେ ଏବେ ଖାତା ସୂଚନା ସହଜରେ ଦେଖିପାରିବେ। ସନ୍ଦେଶ, ପେମେଣ୍ଟ ଓ ସହାୟତା ଏକ ସ୍ଥାନରେ ମିଳିବ।',
    label: 'ଖାତା ଅଦ୍ୟତନ ହେଲା। ପେମେଣ୍ଟ ବାକି ଅଛି। ସହାୟତା ମିଳିବ।',
  },
  tamil: {
    headline: 'புதிய சேவை இன்று அனைத்து வாடிக்கையாளர்களுக்கும் திறந்தது',
    title: 'கணக்கு, கட்டணம், உதவி விவரங்களை ஒரே இடத்தில் பாருங்கள்',
    body: 'இன்று காலை குழு புதிய சேவையை தொடங்கியது. பயனர்கள் இப்போது கணக்கு தகவலை எளிதாக பார்க்கலாம். செய்திகள், கட்டணம் மற்றும் உதவி ஒரே இடத்தில் கிடைக்கும்.',
    label: 'கணக்கு புதுப்பிக்கப்பட்டது. கட்டணம் நிலுவையில் உள்ளது. உதவி கிடைக்கும்.',
  },
  telugu: {
    headline: 'కొత్త సేవ ఇవాళ అన్ని వినియోగదారులకు అందుబాటులోకి వచ్చింది',
    title: 'ఖాతా, చెల్లింపు మరియు సహాయ వివరాలను ఒకే చోట చూడండి',
    body: 'ఈ ఉదయం బృందం కొత్త సేవను ప్రారంభించింది. వినియోగదారులు ఇప్పుడు ఖాతా సమాచారాన్ని సులభంగా చూడగలరు. సందేశాలు, చెల్లింపు మరియు సహాయం ఒకే చోట లభిస్తాయి.',
    label: 'ఖాతా నవీకరించబడింది. చెల్లింపు పెండింగ్‌లో ఉంది. సహాయం అందుబాటులో ఉంది.',
  },
  arabic: {
    headline: 'الخدمة الجديدة متاحة اليوم لجميع العملاء',
    title: 'اعرض الحساب والمدفوعات والدعم في مكان واحد',
    body: 'أطلق الفريق الخدمة الجديدة هذا الصباح. يمكن للمستخدمين الآن مراجعة معلومات الحساب بسهولة. الرسائل والمدفوعات والدعم متاحة في مكان واحد.',
    label: 'تم تحديث الحساب. الدفع قيد الانتظار. الدعم متاح الآن.',
  },
};

function makeCustomScriptId(existingIds: Set<string>): string {
  let index = 1;
  let candidate = `custom-script-${index}`;
  while (existingIds.has(candidate)) {
    index += 1;
    candidate = `custom-script-${index}`;
  }
  return candidate;
}

function parseLangTags(value: string): string[] {
  return value
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

function getScriptPreviewCopy(
  scriptId: string,
  role: Exclude<TypographyRole, 'code'>,
  fallback: string,
): string {
  return SCRIPT_PREVIEW_COPY[scriptId]?.[role] ?? fallback;
}

export interface ScriptsTabProps {
  v2Config: TypographyConfigV2;
  allFonts: FontMetadata[];
  loadedFonts: Set<string>;
  getFontFromAllSources: (id: string) => FontMetadata | undefined;
  selectedPlatformId: string;
  selectedBreakpointId: string;
  selectedDensity: DensityId;
  platformsConfig: PlatformsFoundationConfig | undefined;
  onPresetChange: (preset: 'india-core-v1' | 'custom') => void;
  onScriptChange: (scriptId: TypographyScriptKey, patch: Partial<TypographyScriptConfig>) => void;
  onScriptAdd: (scriptId: string) => void;
  onScriptRemove: (scriptId: string) => void;
}

export const ScriptsTab = React.memo(function ScriptsTab({
  v2Config,
  allFonts,
  loadedFonts,
  getFontFromAllSources,
  selectedPlatformId,
  selectedBreakpointId,
  selectedDensity,
  platformsConfig,
  onPresetChange,
  onScriptChange,
  onScriptAdd,
  onScriptRemove,
}: ScriptsTabProps) {
  const scripts = React.useMemo(
    () => resolveTypographyScriptSupport(v2Config.scriptSupport),
    [v2Config.scriptSupport],
  );

  const coreIds = React.useMemo(
    () => new Set<string>(INDIA_CORE_SCRIPT_DEFINITIONS.map((script) => script.id)),
    [],
  );

  const scriptFontOptions = React.useMemo(() => {
    const optionMap = new Map<string, { value: string; label: string }>();
    for (const font of allFonts) {
      if (font.category !== 'script' && font.source !== 'uploaded') continue;
      optionMap.set(font.id, {
        value: font.id,
        label: `${font.name}${font.source === 'uploaded' ? ' · Uploaded' : ''}`,
      });
    }
    for (const script of scripts) {
      const fontId = script.uiFontId;
      if (optionMap.has(fontId)) continue;
      const font = getFontFromAllSources(fontId);
      optionMap.set(fontId, { value: fontId, label: font?.name ?? fontId });
    }
    return [...optionMap.values()].sort((a, b) => a.label.localeCompare(b.label));
  }, [allFonts, getFontFromAllSources, scripts]);

  const existingIds = React.useMemo(
    () => new Set(scripts.map((script) => String(script.id))),
    [scripts],
  );

  const [isEditingScripts, setIsEditingScripts] = useState(false);
  const [selectedScriptIds, setSelectedScriptIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    const scriptIds = new Set(scripts.map((script) => String(script.id)));

    setSelectedScriptIds((current) => {
      const next = new Set([...current].filter((id) => scriptIds.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [scripts]);

  const selectedCount = selectedScriptIds.size;

  const toggleScriptSelection = React.useCallback((scriptId: string, selected: boolean) => {
    setSelectedScriptIds((current) => {
      const next = new Set(current);
      if (selected) next.add(scriptId);
      else next.delete(scriptId);
      return next;
    });
  }, []);

  const handleRemoveSelectedScripts = React.useCallback(() => {
    for (const scriptId of selectedScriptIds) {
      if (coreIds.has(scriptId)) {
        onScriptChange(scriptId as TypographyScriptKey, { enabled: false });
      } else {
        onScriptRemove(scriptId);
      }
    }
    setSelectedScriptIds(new Set());
  }, [coreIds, onScriptChange, onScriptRemove, selectedScriptIds]);

  const getPreviewFontFamily = React.useCallback(
    (fontId: string, scriptCssName: string) => {
      const font = getFontFromAllSources(fontId);
      if (font && loadedFonts.has(font.id)) return buildFontFamilyString(font);
      return `var(--Typography-Font-Script-${scriptCssName}-UI, var(--Typography-Font-Script, inherit))`;
    },
    [getFontFromAllSources, loadedFonts],
  );

  const getPreviewLineHeight = React.useCallback(
    (role: Exclude<TypographyRole, 'code'>, size: string, extraSteps: number) => {
      const fStep = getEffectiveFStepForPlatform(role, size, v2Config, selectedPlatformId, selectedBreakpointId, platformsConfig);
      const offset = getEffectiveLHOffset(role, v2Config) + extraSteps;
      return `var(--Dimension-${computeLineHeightFStep(fStep, offset)})`;
    },
    [v2Config],
  );

  const getLineHeightMetrics = React.useCallback(
    (role: Exclude<TypographyRole, 'code'>, size: string, extraSteps: number) => {
      const fontSizeFStep = getEffectiveFStepForPlatform(role, size, v2Config, selectedPlatformId, selectedBreakpointId, platformsConfig);
      const baseOffset = getEffectiveLHOffset(role, v2Config);
      const baseLineHeightFStep = computeLineHeightFStep(fontSizeFStep, baseOffset);
      const scriptLineHeightFStep = computeLineHeightFStep(fontSizeFStep, baseOffset + extraSteps);
      const tokenName = typographyTokenName(role, size);

      return {
        tokenName,
        fontSizeFStep,
        baseOffset,
        extraSteps,
        baseLineHeightFStep,
        scriptLineHeightFStep,
        fontPx: getPixelForFStep(fontSizeFStep, selectedPlatformId, selectedBreakpointId, selectedDensity, platformsConfig),
        baseLineHeightPx: getPixelForFStep(baseLineHeightFStep, selectedPlatformId, selectedBreakpointId, selectedDensity, platformsConfig),
        scriptLineHeightPx: getPixelForFStep(scriptLineHeightFStep, selectedPlatformId, selectedBreakpointId, selectedDensity, platformsConfig),
      };
    },
    [platformsConfig, selectedBreakpointId, selectedDensity, selectedPlatformId, v2Config],
  );

  const buildLongPreviewText = React.useCallback((
    scriptId: string,
    role: Exclude<TypographyRole, 'code'>,
    fallback: string,
  ) => {
    const copy = getScriptPreviewCopy(scriptId, role, fallback);
    return `${copy} ${copy} ${copy} ${copy}`;
  }, []);

  return (
    <FoundationCard
      title="Script Languages"
      description="Each enabled script loads one font family. The line-height profile changes vertical rhythm without fetching a second font."
    >
      <div className={typographyStyles.scriptToolbar}>
        <div className={typographyStyles.scriptPresetControl}>
          <Select
            value={v2Config.scriptSupport?.preset ?? 'india-core-v1'}
            onChange={(value) => onPresetChange(value as 'india-core-v1' | 'custom')}
            options={[
              { value: 'india-core-v1', label: 'India core v1' },
              { value: 'custom', label: 'Custom' },
            ]}
            size="sm"
            aria-label="Script preset"
          />
        </div>
        <div className={typographyStyles.scriptToolbarActions}>
          <Button
            attention={isEditingScripts ? 'high' : 'low'}
            size="small"
            onPress={() => {
              setIsEditingScripts((current) => !current);
              setSelectedScriptIds(new Set());
            }}
          >
            {isEditingScripts ? 'Done' : 'Edit scripts'}
          </Button>
          <Button
            attention="low"
            size="small"
            onPress={() => onScriptAdd(makeCustomScriptId(existingIds))}
          >
            + Add script
          </Button>
        </div>
      </div>

      {isEditingScripts && (
        <div className={typographyStyles.scriptEditBar}>
          <span className={typographyStyles.scriptHelpText}>
            Select scripts to remove. Built-in core scripts are turned off; custom scripts are deleted.
          </span>
          <Button
            attention="low"
            size="small"
            disabled={selectedCount === 0}
            onPress={handleRemoveSelectedScripts}
          >
            Remove selected{selectedCount > 0 ? ` (${selectedCount})` : ''}
          </Button>
        </div>
      )}

      <div className={typographyStyles.scriptAccordionList}>
        {scripts.map((script) => {
          const isCore = coreIds.has(String(script.id));
          const uiFont = getFontFromAllSources(script.uiFontId);
          const scriptId = String(script.id);
          const previewFamily =
            uiFont && loadedFonts.has(uiFont.id)
              ? buildFontFamilyString(uiFont)
              : `var(--Typography-Font-Script-${script.cssName}-UI, var(--Typography-Font-Script, inherit))`;
          const bodyMetrics = getLineHeightMetrics('body', 'M', script.lineHeightDeltas.body ?? 0);
          const firstLang = script.langTags[0];

          return (
            <Collapsible
              key={script.id}
              className={typographyStyles.scriptAccordion}
            >
              <Collapsible.Trigger className={typographyStyles.scriptSummary}>
                {isEditingScripts && (
                  <span
                    className={typographyStyles.scriptSelectCell}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Checkbox
                      size="s"
                      appearance="neutral"
                      checked={selectedScriptIds.has(scriptId)}
                      onCheckedChange={(checked) => toggleScriptSelection(scriptId, checked === true)}
                      id={`script-select-${scriptId}`}
                      aria-label={`Select script ${script.label}`}
                    />
                  </span>
                )}
                <span className={typographyStyles.scriptSummaryMain}>
                  <span className={typographyStyles.scriptSummaryTitle}>{script.label}</span>
                  <span className={typographyStyles.scriptSummaryMeta}>
                    {script.langTags.length > 0 ? script.langTags.join(', ') : 'data-script only'}
                  </span>
                </span>
                <span className={typographyStyles.scriptSummaryFont} style={{ fontFamily: previewFamily }}>
                  {getScriptPreviewCopy(scriptId, 'label', script.sample)}
                </span>
                <span className={typographyStyles.scriptSummaryBadges}>
                  <Badge size="xs" appearance={script.enabled ? 'positive' : 'neutral'} attention="medium">
                    {script.enabled ? 'On' : 'Off'}
                  </Badge>
                  <Badge size="xs" appearance="neutral" attention="medium">
                    {script.lineHeightMode === 'reading' ? 'Roomier' : script.lineHeightMode === 'custom' ? 'Custom' : 'Default'}
                  </Badge>
                </span>
              </Collapsible.Trigger>

              <Collapsible.Panel className={typographyStyles.scriptPanelShell}>
              <div className={typographyStyles.scriptPanel}>
                <div className={typographyStyles.scriptConfigGrid}>
                  <div className={typographyStyles.scriptIdentityBlock}>
                    {isCore ? (
                      <>
                        <span className={typographyStyles.scriptFieldLabel}>Language</span>
                        <span className={typographyStyles.scriptFieldValue}>{script.label}</span>
                        <span className={typographyStyles.scriptTokenText}>
                          {script.langTags.length > 0 ? `:lang(${script.langTags.join(', ')})` : 'data-script only'}
                        </span>
                      </>
                    ) : (
                      <label className={typographyStyles.scriptField}>
                        <span className={typographyStyles.scriptFieldLabel}>Language</span>
                        <Input
                          value={script.label}
                          onChange={(value) => onScriptChange(script.id, {
                            label: value,
                            cssName: sanitizeTypographyScriptCssName(value),
                          })}
                          size="s"
                        />
                        <span className={typographyStyles.scriptTokenText}>
                          {script.id}
                        </span>
                      </label>
                    )}
                  </div>

                  <label className={typographyStyles.scriptField}>
                    <span className={typographyStyles.scriptFieldLabel}>Status</span>
                    <ToggleGroup
                      value={[script.enabled ? 'enabled' : 'disabled']}
                      onValueChange={(values) => onScriptChange(script.id, {
                        enabled: (values[0] ?? 'enabled') === 'enabled',
                      })}
                      variant="subtool"
                      size="small"
                    >
                      <ToggleGroup.Item value="enabled">On</ToggleGroup.Item>
                      <ToggleGroup.Item value="disabled">Off</ToggleGroup.Item>
                    </ToggleGroup>
                  </label>

                  <label className={typographyStyles.scriptField}>
                    <span className={typographyStyles.scriptFieldLabel}>Font</span>
                    <Select
                      value={script.uiFontId}
                      onChange={(value) => {
                        const fontId = String(value);
                        onScriptChange(script.id, { uiFontId: fontId, readingFontId: fontId });
                      }}
                      options={scriptFontOptions}
                      size="sm"
                      searchable
                      aria-label={`${script.label} font`}
                    />
                  </label>

                  <label className={typographyStyles.scriptField}>
                    <span className={typographyStyles.scriptFieldLabel}>Line-height profile</span>
                    <Select
                      value={script.lineHeightMode}
                      onChange={(value) => {
                        const lineHeightMode = value as TypographyScriptLineHeightMode;
                        onScriptChange(script.id, {
                          lineHeightMode,
                          ...(lineHeightMode === 'custom' ? { lineHeightDeltas: script.lineHeightDeltas } : {}),
                        });
                      }}
                      options={SCRIPT_LINE_HEIGHT_OPTIONS}
                      size="sm"
                      aria-label={`${script.label} line-height profile`}
                    />
                    <span className={typographyStyles.scriptTokenText}>
                      Body/M: {bodyMetrics.fontSizeFStep} + {bodyMetrics.baseOffset} + {bodyMetrics.extraSteps} = {bodyMetrics.scriptLineHeightFStep}
                    </span>
                  </label>
                </div>

                {!isCore && (
                  <div className={typographyStyles.scriptCustomGrid}>
                    <label className={typographyStyles.scriptField}>
                      <span className={typographyStyles.scriptFieldLabel}>Language tags</span>
                      <Input
                        value={script.langTags.join(', ')}
                        onChange={(value) => onScriptChange(script.id, { langTags: parseLangTags(value) })}
                        size="s"
                        placeholder="hi, mr"
                      />
                    </label>
                    <label className={typographyStyles.scriptField}>
                      <span className={typographyStyles.scriptFieldLabel}>Sample text</span>
                      <Input
                        value={script.sample}
                        onChange={(value) => onScriptChange(script.id, { sampleText: value })}
                        size="s"
                      />
                    </label>
                    <Button attention="low" size="small" onPress={() => onScriptRemove(String(script.id))}>
                      Remove
                    </Button>
                  </div>
                )}

                {script.lineHeightMode === 'custom' && (
                  <div className={typographyStyles.scriptCustomLineHeight}>
                    <span className={typographyStyles.scriptFieldLabel}>Role</span>
                    <span className={typographyStyles.scriptFieldLabel}>Base</span>
                    <span className={typographyStyles.scriptFieldLabel}>Addition</span>
                    <span className={typographyStyles.scriptFieldLabel}>Result</span>
                    {SCRIPT_LINE_HEIGHT_ROLES.map((role) => {
                      const size = (TYPOGRAPHY_SIZES[role] as readonly string[]).includes('M') ? 'M' : TYPOGRAPHY_SIZES[role][0];
                      const extraSteps = script.lineHeightDeltas[role] ?? 0;
                      const metrics = getLineHeightMetrics(role, size, extraSteps);

                      return (
                        <React.Fragment key={role}>
                          <span className={typographyStyles.scriptFieldValue}>
                            {ROLE_LABELS[role]}/{size}
                          </span>
                          <span className={typographyStyles.scriptTokenText}>
                            {metrics.fontSizeFStep} + {metrics.baseOffset} = {metrics.baseLineHeightFStep}
                          </span>
                          <Input
                            type="number"
                            value={String(extraSteps)}
                            onChange={(value) => onScriptChange(script.id, {
                              lineHeightDeltas: {
                                ...script.lineHeightDeltas,
                                [role]: Math.max(0, Math.min(6, parseInt(value, 10) || 0)),
                              },
                            })}
                            size="s"
                          />
                          <span className={typographyStyles.scriptTokenText}>
                            --{metrics.tokenName}-LineHeight: var(--Dimension-{metrics.scriptLineHeightFStep})
                          </span>
                        </React.Fragment>
                      );
                    })}
                    <span className={typographyStyles.scriptHelpText}>
                      Script addition is measured in the same f-step units as the normal Line Height tab. Code typography is not remapped by script context.
                    </span>
                  </div>
                )}

                <div className={typographyStyles.scriptPreviewSection}>
                  <div className={typographyStyles.scriptPreviewHeader}>
                    <div>
                      <span className={typographyStyles.scriptPreviewTitle}>{script.label} preview</span>
                      <span className={typographyStyles.scriptHelpText}>
                        The sample width is intentionally narrow so script line height can be checked across at least three rows.
                      </span>
                    </div>
                    <div className={typographyStyles.scriptPreviewBadges}>
                      <Badge size="xs" appearance="neutral" attention="medium" style={{ fontFamily: 'var(--Typography-Font-Code)' }}>
                        data-script=&quot;{script.id}&quot;
                      </Badge>
                      <Badge size="xs" appearance="neutral" attention="medium" style={{ fontFamily: 'var(--Typography-Font-Code)' }}>
                        {firstLang ? `lang="${firstLang}"` : 'data-script only'}
                      </Badge>
                      <Badge size="xs" appearance="neutral" attention="medium" style={{ fontFamily: 'var(--Typography-Font-Code)' }}>
                        --Typography-Font-Script-{script.cssName}-UI
                      </Badge>
                    </div>
                  </div>

                  <div className={typographyStyles.scriptPreviewRows}>
                    {SCRIPT_CONTEXT_PREVIEW_ROWS.map(({ role, size }) => {
                      const metrics = getLineHeightMetrics(role, size, script.lineHeightDeltas[role] ?? 0);
                      const sample = buildLongPreviewText(scriptId, role, script.sample);
                      const fontFamily = getPreviewFontFamily(script.uiFontId, script.cssName);
                      const scriptLineHeight = getPreviewLineHeight(role, size, script.lineHeightDeltas[role] ?? 0);

                      return (
                        <div key={`${role}-${size}`} className={typographyStyles.scriptPreviewRow}>
                          <div className={typographyStyles.scriptPreviewMeta}>
                            <span className={typographyStyles.scriptFieldLabel}>Role</span>
                            <span className={typographyStyles.scriptFieldValue}>{ROLE_LABELS[role]}/{size}</span>
                            <span className={typographyStyles.scriptTokenText}>--{metrics.tokenName}-LineHeight</span>
                            <span className={typographyStyles.scriptTokenText}>
                              {metrics.fontSizeFStep} + {metrics.baseOffset} + {metrics.extraSteps} = {metrics.scriptLineHeightFStep}
                            </span>
                          </div>

                          <div className={typographyStyles.scriptPreviewSamples}>
                            <div className={typographyStyles.scriptPreviewSample}>
                              <span className={typographyStyles.scriptTokenText}>
                                Base · {metrics.baseLineHeightPx}px
                              </span>
                              <div
                                className={typographyStyles.scriptPreviewText}
                                style={{
                                  fontFamily,
                                  fontSize: `var(--${metrics.tokenName}-FontSize)`,
                                  lineHeight: `var(--Dimension-${metrics.baseLineHeightFStep})`,
                                  height: `calc(var(--Dimension-${metrics.baseLineHeightFStep}) * 4)`,
                                }}
                              >
                                {sample}
                              </div>
                            </div>
                            <div
                              className={typographyStyles.scriptPreviewSample}
                              data-script={script.id}
                              data-script-mode={script.lineHeightMode === 'reading' ? 'reading' : undefined}
                            >
                              <span className={typographyStyles.scriptTokenText}>
                                Script · {metrics.scriptLineHeightPx}px
                              </span>
                              <div
                                lang={firstLang}
                                className={typographyStyles.scriptPreviewText}
                                style={{
                                  fontFamily,
                                  fontSize: `var(--${metrics.tokenName}-FontSize)`,
                                  lineHeight: scriptLineHeight,
                                  height: `calc(${scriptLineHeight} * 4)`,
                                }}
                              >
                                {sample}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              </Collapsible.Panel>
            </Collapsible>
          );
        })}
      </div>
    </FoundationCard>
  );
});

// ============================================================================
// TypeScaleTab
// ============================================================================

export interface TypeScaleTabProps {
  v2Config: TypographyConfigV2;
  selectedPlatformId: string;
  selectedBreakpointId: string;
  selectedDensity: DensityId;
  availableBreakpoints: AvailableBreakpoint[];
  platformsConfig: PlatformsFoundationConfig | undefined;
  actions?: React.ReactNode;
  onFStepChange: (role: TypographyRole, size: string, fStep: FStep) => void;
  onRoleFontSlotChange: (role: RoleFontSlotRole, slot: RoleFontSlot) => void;
  onWeightOverride?: (key: string, weight: number) => void;
  getRoleWeights?: (role: RoleFontSlotRole) => number[];
}

/** Common CSS weight names for the Type Scale weight picker. */
const WEIGHT_NAMES: Record<number, string> = {
  100: 'Thin', 200: 'Extra Light', 300: 'Light', 400: 'Regular',
  500: 'Medium', 600: 'Semi Bold', 700: 'Bold', 800: 'Extra Bold', 900: 'Black',
};

export const TypeScaleTab = React.memo(function TypeScaleTab({
  v2Config,
  selectedPlatformId,
  selectedBreakpointId,
  selectedDensity,
  availableBreakpoints,
  platformsConfig,
  actions,
  onFStepChange,
  onRoleFontSlotChange,
  onWeightOverride,
  getRoleWeights,
}: TypeScaleTabProps) {
  // Breakpoint group (S/M/L) of the selected platform — Display & Headline step
  // up at the L group (viewport ≥ 991px), so the px reflects the bumped step.
  const selectedGroup: BreakpointGroup = viewportToBreakpointGroup(
    availableBreakpoints.find(
      (bp) => bp.platformId === selectedPlatformId && bp.breakpointId === selectedBreakpointId,
    )?.widthPx ?? 360,
  );

  return (
    <FoundationCard
      title="Type Scale"
      description="Typography sizes map to dimension steps (Figma naming, e.g. #10). Display and Headline step up one tier on large screens (the L breakpoint group). All roles are brand-customizable — changing Label, Body, or Title sizes propagates to Button, body text, and headings."
      actions={actions}
    >
      <div>
        {/* Table Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '150px 168px 148px 84px 46px',
            columnGap: 'var(--Spacing-4)',
            padding: 'var(--Spacing-3-5) var(--Spacing-0)',
          }}
        >
          <TableHeader>Role / Size</TableHeader>
          <TableHeader>Step</TableHeader>
          <TableHeader>Font Slot</TableHeader>
          <TableHeader>{
            (() => {
              const match = availableBreakpoints.find(
                (bp) => bp.platformId === selectedPlatformId && bp.breakpointId === selectedBreakpointId,
              );
              return match ? `${match.platformLabel} · ${match.breakpointLabel} px` : 'px';
            })()
          }</TableHeader>
          <TableHeader>Edit</TableHeader>
        </div>

        {/* Table Body */}
        {TYPOGRAPHY_ROLES.map((role) => {
          const sizes = TYPOGRAPHY_SIZES[role];

          return (
            <React.Fragment key={role}>
              {/* Role group header */}
              <div
                style={{
                  padding: 'var(--Spacing-3-5) var(--Spacing-0)',
                  borderBottom: '1px solid var(--Neutral-Stroke-Low)',
                }}
              >
                <span style={{ fontSize: 'var(--Typography-Size-S)', fontWeight: 'var(--Typography-Weight-Medium)', color: 'var(--Text-High)' }}>
                  {ROLE_LABELS[role]}
                </span>
                <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)', marginLeft: 'var(--Spacing-3-5)' }}>
                  Brand-customizable
                </span>
              </div>

              {/* Size rows */}
              {sizes.map((size, sizeIdx) => {
                // Base (S/M) step is what the brand edits; at the L group, Display
                // & Headline bump up, and the px reflects that bumped step.
                const baseFStep = getEffectiveFStep(role, size, v2Config);
                const effectiveFStep = applyBreakpointGroupBump(role, size, baseFStep, selectedGroup);
                const isBumped = effectiveFStep !== baseFStep;
                const pxValue = getPixelForFStep(effectiveFStep, selectedPlatformId, selectedBreakpointId, selectedDensity, platformsConfig);
                const isCodeRole = role === 'code';
                const effectiveFontSlot: RoleFontSlot = !isCodeRole
                  ? v2Config.roleFontSlots?.[role as RoleFontSlotRole] ?? 'primary'
                  : 'primary';

                return (
                  <div
                    key={`${role}-${size}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '150px 168px 148px 84px 46px',
                      columnGap: 'var(--Spacing-4)',
                      padding: 'var(--Spacing-3) var(--Spacing-0)',
                      borderBottom: sizeIdx < sizes.length - 1 ? '1px solid var(--Neutral-Stroke-Low)' : 'none',
                      // Top-align: the Font-Slot cell can be two rows tall (slot +
                      // weight), so centering would float every other cell to the
                      // middle. The small paddingTop on text/badge cells lines them
                      // up with the first control's label.
                      alignItems: 'start',
                    }}
                  >
                    {/* Role/Size */}
                    <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Medium)', paddingTop: 'var(--Spacing-2-5)' }}>
                      {typographyTokenName(role, size)}
                    </span>

                    {/* Dimension step — the dropdown edits the base (S/M) step.
                        On the L group, Display/Headline step up; we show
                        "base → effective" so the resolved px is explained. */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--Spacing-2)' }}>
                      <Select
                        value={baseFStep}
                        onChange={(value) => onFStepChange(role, size, value as FStep)}
                        options={STEP_OPTIONS}
                        size="sm"
                        aria-label={`Dimension step for ${role} ${size}`}
                      />
                      {isBumped && (
                        <span style={{ color: 'var(--Text-Low)', whiteSpace: 'nowrap', fontFamily: 'var(--Typography-Font-Code, monospace)', fontSize: 'var(--Typography-Size-XS)' }}>
                          → {stepLabel(effectiveFStep)}
                        </span>
                      )}
                    </div>

                    {/* Font Slot (+ weight picker for fixed-weight roles) */}
                    {isCodeRole ? (
                      <Badge
                        size="xs"
                        appearance="neutral"
                        attention="medium"
                        style={{ justifySelf: 'start', marginTop: 'var(--Spacing-2)' }}
                      >
                        Code
                      </Badge>
                    ) : (() => {
                      // Display / Headline / Title carry a fixed weight per size
                      // (stored in weightOverrides). Offer a weight picker limited
                      // to the weights the assigned font actually ships, so e.g. a
                      // Heading can be set to Bold when the font has a 700 file.
                      const isFixedWeightRole = (FIXED_WEIGHT_ROLES as readonly string[]).includes(role);
                      const weightKey = `${typographyTokenName(role, size)}-FontWeight`;
                      const defaultWeight = (FONT_WEIGHTS[role] as Record<string, number> | undefined)?.[size] ?? 400;
                      const currentWeight = v2Config.weightOverrides?.[weightKey] ?? defaultWeight;
                      const available = getRoleWeights?.(role as RoleFontSlotRole) ?? [];
                      const hasKnownWeights = available.length > 0;
                      // When the font's weights are known, offer ONLY those —
                      // never inject the role default (which the font may not
                      // ship), otherwise the picker would let you pick e.g. 700
                      // for a 400-only font and silently faux-bold. Fall back to
                      // the standard range (plus the current value) only when the
                      // font's weights are unknown.
                      const weightSet = hasKnownWeights
                        ? [...new Set(available)].sort((a, b) => a - b)
                        : Array.from(new Set([300, 400, 500, 600, 700, 800, 900, currentWeight])).sort((a, b) => a - b);
                      // Keep the controlled Select valid: if the stored/default
                      // weight isn't one the font ships, display the closest
                      // shipped weight instead of a blank control.
                      const displayWeight = weightSet.includes(currentWeight)
                        ? currentWeight
                        : weightSet.reduce(
                            (best, w) => (Math.abs(w - currentWeight) < Math.abs(best - currentWeight) ? w : best),
                            weightSet[0],
                          );
                      const weightOptions = weightSet.map((w) => ({
                        value: String(w),
                        label: WEIGHT_NAMES[w] ? `${w} · ${WEIGHT_NAMES[w]}` : String(w),
                      }));
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)' }}>
                          <Select
                            value={effectiveFontSlot}
                            onChange={(value) =>
                              onRoleFontSlotChange(role as RoleFontSlotRole, value as RoleFontSlot)
                            }
                            options={[
                              { value: 'primary', label: 'Text' },
                              { value: 'secondary', label: 'Heading' },
                            ]}
                            size="sm"
                            aria-label={`Font slot for ${role}`}
                          />
                          {isFixedWeightRole && onWeightOverride && (
                            <Select
                              value={String(displayWeight)}
                              onChange={(value) => onWeightOverride(weightKey, parseInt(value, 10) || 400)}
                              options={weightOptions}
                              size="sm"
                              aria-label={`Weight for ${typographyTokenName(role, size)}`}
                            />
                          )}
                        </div>
                      );
                    })()}

                    {/* Pixel value, resolved at the selected platform (incl. the L-group bump) */}
                    <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Medium)', fontFamily: 'var(--Typography-Font-Code, monospace)', paddingTop: 'var(--Spacing-2-5)' }}>
                      {pxValue}px
                    </span>

                    {/* Editable indicator */}
                    <Badge
                      size="xs"
                      appearance="positive"
                      attention="medium"
                      style={{ justifySelf: 'start', marginTop: 'var(--Spacing-2)' }}
                    >
                      Yes
                    </Badge>
                  </div>
                );
              })}
            </React.Fragment>
          );
        })}
      </div>
    </FoundationCard>
  );
});

// ============================================================================
// LineHeightTab
// ============================================================================

export interface LineHeightTabProps {
  v2Config: TypographyConfigV2;
  selectedPlatformId: string;
  selectedBreakpointId: string;
  selectedDensity: DensityId;
  platformsConfig: PlatformsFoundationConfig | undefined;
  actions?: React.ReactNode;
  onLineHeightOffsetChange: (role: TypographyRole, offset: number) => void;
}

export const LineHeightTab = React.memo(function LineHeightTab({
  v2Config,
  selectedPlatformId,
  selectedBreakpointId,
  selectedDensity,
  platformsConfig,
  actions,
  onLineHeightOffsetChange,
}: LineHeightTabProps) {
  return (
    <FoundationCard
      title="Line Height Offsets"
      description="Line height = var(--Dimension-f{fontSize_step + offset}). Adjust per-role offsets to tune vertical rhythm."
      actions={actions}
    >
      <div>
        {/* Table Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '120px 80px 1fr 160px',
            columnGap: 'var(--Spacing-4)',
            padding: 'var(--Spacing-3-5) var(--Spacing-0)',
          }}
        >
          <TableHeader>Role</TableHeader>
          <TableHeader>Offset</TableHeader>
          <TableHeader>Formula</TableHeader>
          <TableHeader>Example (M size)</TableHeader>
        </div>

        {/* Rows */}
        {TYPOGRAPHY_ROLES.map((role, idx) => {
          const offset = getEffectiveLHOffset(role, v2Config);
          const exampleSize = (TYPOGRAPHY_SIZES[role] as readonly string[]).includes('M') ? 'M' : TYPOGRAPHY_SIZES[role][0];
          const fontSizeFStep = getEffectiveFStepForPlatform(role, exampleSize, v2Config, selectedPlatformId, selectedBreakpointId, platformsConfig);
          const lineHeightFStep = computeLineHeightFStep(fontSizeFStep, offset);
          const pxFontSize = getPixelForFStep(fontSizeFStep, selectedPlatformId, selectedBreakpointId, selectedDensity, platformsConfig);
          const pxLineHeight = getPixelForFStep(lineHeightFStep, selectedPlatformId, selectedBreakpointId, selectedDensity, platformsConfig);

          return (
            <div
              key={role}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 80px 1fr 160px',
                columnGap: 'var(--Spacing-4)',
                padding: 'var(--Spacing-3-5) var(--Spacing-0)',
                borderBottom: idx < TYPOGRAPHY_ROLES.length - 1 ? '1px solid var(--Neutral-Stroke-Low)' : 'none',
                alignItems: 'center',
              }}
            >
              {/* Role */}
              <span style={{ fontSize: 'var(--Typography-Size-S)', fontWeight: 'var(--Typography-Weight-Medium)', color: 'var(--Text-High)' }}>
                {ROLE_LABELS[role]}
              </span>

              {/* Offset input */}
              <Input
                type="number"
                value={String(offset)}
                onChange={(value) => onLineHeightOffsetChange(role, Math.max(0, Math.min(8, parseInt(value) || 0)))}
                size="s"
                style={{ width: '56px' }}
              />

              {/* Formula (dimension steps; line height = font step shifted by the offset) */}
              <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)', fontFamily: 'var(--Typography-Font-Code, monospace)' }}>
                step {stepLabel(fontSizeFStep)} (+{offset}) → {stepLabel(lineHeightFStep)}
              </span>

              {/* Example */}
              <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Medium)' }}>
                {ROLE_LABELS[role]}/{exampleSize}: {pxFontSize}px / {pxLineHeight}px
              </span>
            </div>
          );
        })}
      </div>

      {/* Visual preview */}
      <div style={{ marginTop: 'var(--Spacing-4-5)' }}>
        <div style={{ fontSize: 'var(--Title-S-FontSize)', lineHeight: 'var(--Title-S-LineHeight)', fontWeight: 'var(--Title-S-FontWeight)', fontFamily: 'var(--Title-FontFamily, var(--Typography-Font-Text))', color: 'var(--Text-High)', marginBottom: 'var(--Spacing-3-5)' }}>
          Visual Preview
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
          {TYPOGRAPHY_ROLES.map((role) => {
            const exampleSize = (TYPOGRAPHY_SIZES[role] as readonly string[]).includes('M') ? 'M' : TYPOGRAPHY_SIZES[role][0];
            const fontSizeFStep = getEffectiveFStepForPlatform(role, exampleSize, v2Config, selectedPlatformId, selectedBreakpointId, platformsConfig);
            const offset = getEffectiveLHOffset(role, v2Config);
            const lineHeightFStep = computeLineHeightFStep(fontSizeFStep, offset);
            const pxFontSize = getPixelForFStep(fontSizeFStep, selectedPlatformId, selectedBreakpointId, selectedDensity, platformsConfig);
            const pxLineHeight = getPixelForFStep(lineHeightFStep, selectedPlatformId, selectedBreakpointId, selectedDensity, platformsConfig);

            return (
              <div key={role}>
                <div style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)', marginBottom: 'var(--Spacing-2-5)' }}>
                  {ROLE_LABELS[role]}/{exampleSize} — {pxFontSize}px / {pxLineHeight}px line height
                </div>
                <div
                  style={{
                    fontFamily: rolePreviewFontFamily(role),
                    fontWeight: rolePreviewFontWeight(role, exampleSize),
                    fontSize: `${pxFontSize}px`,
                    lineHeight: `${pxLineHeight}px`,
                    color: 'var(--Text-High)',
                    paddingBlock: 'var(--Spacing-3)',
                    borderLeft: '2px solid var(--Neutral-Stroke-Low)',
                    paddingLeft: 'var(--Spacing-4)',
                    maxWidth: '100%',
                    overflowWrap: 'break-word',
                  }}
                >
                  The quick brown fox jumps over the lazy dog.<br />
                  Typography is the art and technique of arranging type.
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </FoundationCard>
  );
});

// ============================================================================
// LetterSpacingTab
// ============================================================================

export interface LetterSpacingTabProps {
  v2Config: TypographyConfigV2;
  selectedPlatformId: string;
  selectedBreakpointId: string;
  selectedDensity: DensityId;
  platformsConfig: PlatformsFoundationConfig | undefined;
  onLetterSpacingChange: (role: TypographyRole, value: number) => void;
  onLetterSpacingReset: (role: TypographyRole) => void;
}

export const LetterSpacingTab = React.memo(function LetterSpacingTab({
  v2Config,
  selectedPlatformId,
  selectedBreakpointId,
  selectedDensity,
  platformsConfig,
  onLetterSpacingChange,
  onLetterSpacingReset,
}: LetterSpacingTabProps) {
  return (
    <FoundationCard
      title="Letter Spacing"
      description="Per-role tracking adjustments (em units). Useful to tighten Display/Headline on variable fonts or loosen small labels for legibility. Default is 0."
    >
      <div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '140px 120px 1fr 120px',
            columnGap: 'var(--Spacing-4)',
            padding: 'var(--Spacing-3-5) var(--Spacing-0)',
          }}
        >
          <TableHeader>Role</TableHeader>
          <TableHeader>Value (em)</TableHeader>
          <TableHeader>Preview</TableHeader>
          <TableHeader>Reset</TableHeader>
        </div>
        {TYPOGRAPHY_ROLES.map((role, idx) => {
          const value = v2Config.letterSpacing?.[role] ?? 0;
          const exampleSize = (TYPOGRAPHY_SIZES[role] as readonly string[]).includes('M')
            ? 'M'
            : TYPOGRAPHY_SIZES[role][0];
          const fontSizeFStep = getEffectiveFStepForPlatform(role, exampleSize, v2Config, selectedPlatformId, selectedBreakpointId, platformsConfig);
          const pxFontSize = getPixelForFStep(
            fontSizeFStep,
            selectedPlatformId,
            selectedBreakpointId,
            selectedDensity,
            platformsConfig,
          );
          const offset = getEffectiveLHOffset(role, v2Config);
          const lineHeightFStep = computeLineHeightFStep(fontSizeFStep, offset);
          const pxLineHeight = getPixelForFStep(
            lineHeightFStep,
            selectedPlatformId,
            selectedBreakpointId,
            selectedDensity,
            platformsConfig,
          );
          // Cap the rendered preview size so a Display row doesn't blow out
          // the grid column. The numeric input still drives the real spacing
          // value; the preview is just a visual sanity check.
          const previewFontSize = Math.min(pxFontSize, 32);
          return (
            <div
              key={role}
              style={{
                display: 'grid',
                gridTemplateColumns: '140px 120px 1fr 120px',
                columnGap: 'var(--Spacing-4)',
                padding: 'var(--Spacing-3-5) var(--Spacing-0)',
                borderBottom: idx < TYPOGRAPHY_ROLES.length - 1 ? '1px solid var(--Neutral-Stroke-Low)' : 'none',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 'var(--Label-S-FontSize)', lineHeight: 'var(--Label-S-LineHeight)', fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))', fontWeight: 'var(--Label-FontWeight-Medium)', color: 'var(--Text-High)' }}>
                {ROLE_LABELS[role]}
              </span>
              <Input
                type="number"
                value={String(value)}
                onChange={(next) => {
                  const parsed = Number(next);
                  if (Number.isFinite(parsed)) {
                    const clamped = Math.max(-0.1, Math.min(0.1, parsed));
                    onLetterSpacingChange(role, clamped);
                  }
                }}
                size="s"
                style={{ width: '88px' }}
              />
              <span
                style={{
                  fontSize: `${previewFontSize}px`,
                  lineHeight: `${pxLineHeight}px`,
                  color: 'var(--Text-High)',
                  letterSpacing: `${value}em`,
                  fontFamily: rolePreviewFontFamily(role),
                  fontWeight: rolePreviewFontWeight(role, exampleSize),
                  overflowWrap: 'break-word',
                }}
              >
                Profile · Settings · Home
              </span>
              <Button
                attention="low"
                size="small"
                onPress={() => onLetterSpacingReset(role)}
                disabled={value === 0}
              >
                Reset
              </Button>
            </div>
          );
        })}
      </div>
    </FoundationCard>
  );
});

// ============================================================================
// WeightsTab
// ============================================================================

export interface WeightsTabProps {
  v2Config: TypographyConfigV2;
  onWeightOverride: (key: string, weight: number) => void;
}

export const WeightsTab = React.memo(function WeightsTab({
  v2Config,
  onWeightOverride,
}: WeightsTabProps) {
  return (
    <>
      {/* Fixed-weight roles */}
      <FoundationCard
        title="Fixed-Weight Roles"
        description="Display, Headline, and Title have fixed weights per size. Optical sizing is applied to smaller sizes."
      >
        <div>
          {/* Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '140px 100px 100px',
              columnGap: 'var(--Spacing-4)',
              padding: 'var(--Spacing-3-5) var(--Spacing-0)',
            }}
          >
            <TableHeader>Role / Size</TableHeader>
            <TableHeader>Weight</TableHeader>
            <TableHeader>Optical Sizing</TableHeader>
          </div>

          {FIXED_WEIGHT_ROLES.map((role) => {
            const sizes = TYPOGRAPHY_SIZES[role];
            const weights = FONT_WEIGHTS[role] as Record<string, number>;

            return (
              <React.Fragment key={role}>
                <div style={{ padding: 'var(--Spacing-3-5) var(--Spacing-0)', borderBottom: '1px solid var(--Neutral-Stroke-Low)' }}>
                  <span style={{ fontSize: 'var(--Typography-Size-S)', fontWeight: 'var(--Typography-Weight-Medium)', color: 'var(--Text-High)' }}>
                    {ROLE_LABELS[role]}
                  </span>
                </div>
                {sizes.map((size, sizeIdx) => {
                  const weightKey = `${typographyTokenName(role, size)}-FontWeight`;
                  const weight = v2Config.weightOverrides?.[weightKey] ?? weights[size];
                  const opszEntry = v2Config.opticalSizing?.[role];
                  const opszMode = opszEntry?.mode ?? 'auto';
                  const opszBadge = opszMode === 'auto' ? 'auto' : opszMode === 'disabled' ? 'off' : `${opszEntry?.opszValue ?? '?'}`;

                  return (
                    <div
                      key={`${role}-${size}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '140px 100px 100px',
                        columnGap: 'var(--Spacing-4)',
                        padding: 'var(--Spacing-3) var(--Spacing-0)',
                        borderBottom: sizeIdx < sizes.length - 1 ? '1px solid var(--Neutral-Stroke-Low)' : 'none',
                        alignItems: 'center',
                      }}
                    >
                      <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Medium)' }}>
                        {typographyTokenName(role, size)}
                      </span>
                      <Input
                        type="number"
                        value={String(weight)}
                        onChange={(value) => onWeightOverride(weightKey, parseInt(value) || 400)}
                        size="s"
                        style={{ width: '72px' }}
                      />
                      <Badge
                        size="xs"
                        appearance={opszMode === 'manual' ? 'informative' : 'neutral'}
                        attention="medium"
                        style={{ justifySelf: 'start' }}
                      >
                        opsz:{opszBadge}
                      </Badge>
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </FoundationCard>

      {/* Emphasis-weight roles */}
      <FoundationCard
        title="Emphasis-Weight Roles"
        description="Body, Label, and Code use an emphasis system: High, Medium, Low."
      >
        <div>
          {/* Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '120px repeat(3, 1fr)',
              columnGap: 'var(--Spacing-4)',
              padding: 'var(--Spacing-3-5) var(--Spacing-0)',
            }}
          >
            <TableHeader>Role</TableHeader>
            {EMPHASIS_LEVELS.map(level => (
              <TableHeader key={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</TableHeader>
            ))}
          </div>

          {EMPHASIS_WEIGHT_ROLES.map((role, roleIdx) => {
            const weights = FONT_WEIGHTS[role];

            return (
              <div
                key={role}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '120px repeat(3, 1fr)',
                  columnGap: 'var(--Spacing-4)',
                  padding: 'var(--Spacing-3-5) var(--Spacing-0)',
                  borderBottom: roleIdx < EMPHASIS_WEIGHT_ROLES.length - 1 ? '1px solid var(--Neutral-Stroke-Low)' : 'none',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 'var(--Typography-Size-S)', fontWeight: 'var(--Typography-Weight-Medium)', color: 'var(--Text-High)' }}>
                  {ROLE_LABELS[role]}
                </span>
                {EMPHASIS_LEVELS.map(level => {
                  const defaultWeight = (weights as Record<string, number>)[level];
                  const overrideKey = `${typographyTokenName(role, 'FontWeight-' + level.charAt(0).toUpperCase() + level.slice(1))}`;
                  const weight = v2Config.weightOverrides?.[overrideKey] ?? defaultWeight;

                  return (
                    <Input
                      key={level}
                      type="number"
                      value={String(weight)}
                      onChange={(value) => onWeightOverride(overrideKey, parseInt(value) || 400)}
                      size="s"
                      style={{ width: '72px' }}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </FoundationCard>
    </>
  );
});

// ============================================================================
// OpticalSizingTab
// ============================================================================

export interface OpticalSizingTabProps {
  v2Config: TypographyConfigV2;
  onOpticalSizingChange: (role: TypographyRole, mode: 'auto' | 'disabled' | 'manual', opszValue?: number) => void;
}

export const OpticalSizingTab = React.memo(function OpticalSizingTab({
  v2Config,
  onOpticalSizingChange,
}: OpticalSizingTabProps) {
  const GRID_COLS = '140px 220px 120px minmax(0, 1fr)';
  const CELL_PAD = 'var(--Spacing-3-5) var(--Spacing-0)';

  return (
    <FoundationCard
      title="Optical Sizing"
      description="Control how the font's opsz variable axis responds to size. Auto (recommended) lets the browser match the opsz value to the rendered font size — strokes, spacing, and letterform details adapt automatically."
    >
      <div>
        {/* Table header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: GRID_COLS,
            padding: CELL_PAD,
            gap: 'var(--Spacing-4)',
            alignItems: 'center',
          }}
        >
          <TableHeader>Role</TableHeader>
          <TableHeader>Mode</TableHeader>
          <TableHeader>Opsz Value</TableHeader>
          <TableHeader>Preview</TableHeader>
        </div>

        {TYPOGRAPHY_ROLES.map((role, idx) => {
          const entry = v2Config.opticalSizing?.[role];
          const mode = entry?.mode ?? 'auto';
          const opszValue = entry?.opszValue ?? 32;

          const previewSize = (TYPOGRAPHY_SIZES[role] as readonly string[]).includes('M')
            ? 'M'
            : TYPOGRAPHY_SIZES[role][0];
          const previewFontFamily =
            role === 'code'
              ? 'var(--Typography-Font-Code, monospace)'
              : `var(--${role.charAt(0).toUpperCase() + role.slice(1)}-FontFamily, var(--Typography-Font-Text))`;
          const previewFontWeight =
            role === 'display' || role === 'headline' || role === 'title'
              ? (FONT_WEIGHTS[role] as Record<string, number>)[previewSize] ?? 700
              : (FONT_WEIGHTS[role] as { medium: number }).medium;
          const previewFontSize = `var(--${(role.charAt(0).toUpperCase() + role.slice(1))}-${previewSize}-FontSize)`;
          const previewLineHeight = `var(--${(role.charAt(0).toUpperCase() + role.slice(1))}-${previewSize}-LineHeight)`;

          return (
            <div
              key={role}
              style={{
                display: 'grid',
                gridTemplateColumns: GRID_COLS,
                padding: CELL_PAD,
                borderBottom:
                  idx < TYPOGRAPHY_ROLES.length - 1
                    ? 'var(--Stroke-M) solid var(--Neutral-Stroke-Low)'
                    : 'none',
                alignItems: 'center',
                gap: 'var(--Spacing-4)',
              }}
            >
              {/* Role label */}
              <span
                style={{
                  fontSize: 'var(--Label-S-FontSize)',
                  lineHeight: 'var(--Label-S-LineHeight)',
                  fontFamily: 'var(--Label-FontFamily, var(--Typography-Font-Text))',
                  fontWeight: 'var(--Label-FontWeight-Medium)',
                  color: 'var(--Text-High)',
                }}
              >
                {ROLE_LABELS[role]}
              </span>

              {/* Mode toggle */}
              <ToggleGroup
                value={[mode]}
                onValueChange={(values) => {
                  const next = (values[0] ?? 'auto') as 'auto' | 'disabled' | 'manual';
                  onOpticalSizingChange(
                    role,
                    next,
                    next === 'manual' ? opszValue : undefined,
                  );
                }}
                variant="subtool"
                size="small"
              >
                <ToggleGroup.Item value="auto">Auto</ToggleGroup.Item>
                <ToggleGroup.Item value="disabled">Off</ToggleGroup.Item>
                <ToggleGroup.Item value="manual">Manual</ToggleGroup.Item>
              </ToggleGroup>

              {/* Opsz value */}
              <div style={{ paddingLeft: 'var(--Spacing-3)' }}>
                {mode === 'manual' ? (
                  <Input
                    type="number"
                    value={String(opszValue)}
                    onChange={(v) => {
                      const n = parseInt(v);
                      if (!isNaN(n) && n >= 6 && n <= 288) {
                        onOpticalSizingChange(role, 'manual', n);
                      }
                    }}
                    size="small"
                    style={{ width: '80px' }}
                    aria-label={`${ROLE_LABELS[role]} optical size value`}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: 'var(--Label-XS-FontSize)',
                      color: 'var(--Text-Low)',
                      fontFamily: 'var(--Typography-Font-Code, monospace)',
                    }}
                  >
                    {mode === 'auto' ? 'auto' : '—'}
                  </span>
                )}
              </div>

              {/* Live preview */}
              <div
                style={{
                  fontSize: previewFontSize,
                  lineHeight: previewLineHeight,
                  fontFamily: previewFontFamily,
                  fontWeight: previewFontWeight,
                  color: 'var(--Text-High)',
                  fontOpticalSizing: mode === 'auto' ? 'auto' : 'none',
                  ...(mode === 'manual'
                    ? { fontVariationSettings: `'opsz' ${opszValue}` }
                    : {}),
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  textOverflow: 'ellipsis',
                } as React.CSSProperties}
              >
                The quick brown fox
              </div>
            </div>
          );
        })}
      </div>

      {/* Best-practice info panel */}
      <div
        style={{
          marginTop: 'var(--Spacing-4-5)',
          padding: 'var(--Spacing-4)',
          backgroundColor: 'var(--Surface-Subtle)',
          borderRadius: 'var(--Shape-4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--Spacing-3-5)',
        }}
      >
        <span style={{ fontSize: 'var(--Title-S-FontSize)', lineHeight: 'var(--Title-S-LineHeight)', fontWeight: 'var(--Title-S-FontWeight)', fontFamily: 'var(--Title-FontFamily, var(--Typography-Font-Text))', color: 'var(--Text-High)' }}>
          Best Practices
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3)' }}>
          <p style={{ fontSize: 'var(--Label-XS-FontSize)', lineHeight: 'var(--Body-S-LineHeight)', color: 'var(--Text-Medium)', margin: 0 }}>
            <strong style={{ color: 'var(--Text-High)' }}>Auto (recommended)</strong> — Browser automatically sets the <code style={{ fontFamily: 'var(--Typography-Font-Code, monospace)' }}>opsz</code> axis equal to the computed font-size in pt. Stroke weight, spacing, and letterform detail adapt correctly at every size. Use this for all variable fonts.
          </p>
          <p style={{ fontSize: 'var(--Label-XS-FontSize)', lineHeight: 'var(--Body-S-LineHeight)', color: 'var(--Text-Medium)', margin: 0 }}>
            <strong style={{ color: 'var(--Text-High)' }}>Off</strong> — Disables automatic optical sizing (<code style={{ fontFamily: 'var(--Typography-Font-Code, monospace)' }}>font-optical-sizing: none</code>). Use for non-variable fonts or when you want a frozen optical appearance.
          </p>
          <p style={{ fontSize: 'var(--Label-XS-FontSize)', lineHeight: 'var(--Body-S-LineHeight)', color: 'var(--Text-Medium)', margin: 0 }}>
            <strong style={{ color: 'var(--Text-High)' }}>Manual</strong> — Freezes the <code style={{ fontFamily: 'var(--Typography-Font-Code, monospace)' }}>opsz</code> axis at a specific pt value regardless of rendered size. Brand CSS injects <code style={{ fontFamily: 'var(--Typography-Font-Code, monospace)' }}>--&#123;Role&#125;-OpszVariation: &apos;opsz&apos; N</code>, and all components using that role automatically pick it up via <code style={{ fontFamily: 'var(--Typography-Font-Code, monospace)' }}>font-variation-settings: var(--&#123;Role&#125;-OpszVariation, normal)</code>.
          </p>
        </div>
      </div>
    </FoundationCard>
  );
});

// ============================================================================
// RenderingTab
// ============================================================================

export interface RenderingTabProps {
  v2Config: TypographyConfigV2;
  onRenderingChange: (key: 'textRendering' | 'webkitFontSmoothing' | 'fontSynthesis', value: string) => void;
}

export const RenderingTab = React.memo(function RenderingTab({
  v2Config,
  onRenderingChange,
}: RenderingTabProps) {
  return (
    <FoundationCard
      title="Font Rendering Quality"
      description="Global rendering controls emitted as an html block in brand CSS. Applies to all consumers of this brand — platform, Storybook, CDN exports."
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
        <RenderingControl
          label="Text rendering"
          description="optimizeLegibility enables kerning and ligatures at all sizes. geometricPrecision prioritizes glyph shape over subpixel positioning."
          value={v2Config.rendering?.textRendering ?? 'optimizeLegibility'}
          onChange={(v) => onRenderingChange('textRendering', v)}
          options={[
            { value: 'auto', label: 'Auto' },
            { value: 'optimizeLegibility', label: 'Optimize Legibility' },
            { value: 'geometricPrecision', label: 'Geometric Precision' },
            { value: 'optimizeSpeed', label: 'Optimize Speed' },
          ]}
        />
        <RenderingControl
          label="Font smoothing"
          description="antialiased gives thinner, cleaner strokes on macOS — recommended for variable fonts. subpixel-antialiased preserves horizontal detail but thickens strokes."
          value={v2Config.rendering?.webkitFontSmoothing ?? 'antialiased'}
          onChange={(v) => onRenderingChange('webkitFontSmoothing', v)}
          options={[
            { value: 'auto', label: 'Auto' },
            { value: 'antialiased', label: 'Antialiased' },
            { value: 'subpixel-antialiased', label: 'Subpixel Antialiased' },
          ]}
        />
        <RenderingControl
          label="Font synthesis"
          description="Set to none to disable browser-synthesized bold/italic. Forces the browser to only use weights that ship with the font — prevents faux-bold on variable fonts with a narrow wght range."
          value={v2Config.rendering?.fontSynthesis ?? 'weight style'}
          onChange={(v) => onRenderingChange('fontSynthesis', v)}
          options={[
            { value: 'auto', label: 'Auto' },
            { value: 'weight style', label: 'Weight & Style' },
            { value: 'none', label: 'None (strict)' },
          ]}
        />
      </div>
    </FoundationCard>
  );
});

// ============================================================================
// PreviewTab
// ============================================================================

export interface PreviewTabProps {
  v2Config: TypographyConfigV2;
  selectedPlatformId: string;
  selectedBreakpointId: string;
  selectedDensity: DensityId;
  availableBreakpoints: AvailableBreakpoint[];
  platformsConfig: PlatformsFoundationConfig | undefined;
  actions?: React.ReactNode;
}

export const PreviewTab = React.memo(function PreviewTab({
  v2Config,
  selectedPlatformId,
  selectedBreakpointId,
  selectedDensity,
  availableBreakpoints,
  platformsConfig,
  actions,
}: PreviewTabProps) {
  return (
    <FoundationCard
      title="Typography Specimen"
      description="All 25 typography sizes rendered with actual CSS token variables."
      actions={actions}
    >
      <ScopedPlatform
        platformId={selectedPlatformId}
        breakpointId={selectedBreakpointId}
        density={selectedDensity}
        category={
          availableBreakpoints.find(
            (bp) => bp.platformId === selectedPlatformId && bp.breakpointId === selectedBreakpointId,
          )?.category
        }
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-6)' }}
      >
        {TYPOGRAPHY_ROLES.map((role) => {
          const sizes = TYPOGRAPHY_SIZES[role];
          const isFixedWeight = (FIXED_WEIGHT_ROLES as readonly string[]).includes(role);

          return (
            <div key={role}>
              {/* Role header */}
              <div style={{ fontSize: 'var(--Title-S-FontSize)', lineHeight: 'var(--Title-S-LineHeight)', fontWeight: 'var(--Title-S-FontWeight)', fontFamily: 'var(--Title-FontFamily, var(--Typography-Font-Text))', color: 'var(--Text-High)', marginBottom: 'var(--Spacing-4)', paddingBottom: 'var(--Spacing-3)', borderBottom: '1px solid var(--Neutral-Stroke-Low)' }}>
                {ROLE_LABELS[role]}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
                {sizes.map((size) => {
                  const effectiveFStep = getEffectiveFStepForPlatform(role, size, v2Config, selectedPlatformId, selectedBreakpointId, platformsConfig);
                  const lhOffset = getEffectiveLHOffset(role, v2Config);
                  const lineHeightFStep = computeLineHeightFStep(effectiveFStep, lhOffset);
                  const pxSize = getPixelForFStep(effectiveFStep, selectedPlatformId, selectedBreakpointId, selectedDensity, platformsConfig);
                  const pxLH = getPixelForFStep(lineHeightFStep, selectedPlatformId, selectedBreakpointId, selectedDensity, platformsConfig);

                  let weight: number;
                  if (isFixedWeight) {
                    const weights = FONT_WEIGHTS[role as 'display' | 'headline' | 'title'] as Record<string, number>;
                    weight = v2Config.weightOverrides?.[`${typographyTokenName(role, size)}-FontWeight`] ?? weights[size];
                  } else {
                    weight = v2Config.weightOverrides?.[`${typographyTokenName(role, 'FontWeight-Medium')}`] ?? (FONT_WEIGHTS[role as 'body' | 'label' | 'code'] as { medium: number }).medium;
                  }

                  const tokenName = typographyTokenName(role, size);
                  const opszEntry = v2Config.opticalSizing?.[role];
                  const opszMode = opszEntry?.mode ?? 'auto';
                  const opszLabel = opszMode === 'auto'
                    ? 'opsz:auto'
                    : opszMode === 'disabled'
                    ? 'opsz:off'
                    : `opsz:${opszEntry?.opszValue ?? '?'}`;

                  return (
                    <div
                      key={`${role}-${size}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 100px 160px 50px 80px',
                        alignItems: 'baseline',
                        gap: 'var(--Spacing-4)',
                      }}
                    >
                      {/* Preview text */}
                      <div
                        style={{
                          fontSize: `${pxSize}px`,
                          lineHeight: `${pxLH}px`,
                          fontWeight: weight,
                          fontFamily:
                            role === 'code'
                              ? 'var(--Typography-Font-Code, monospace)'
                              : `var(--${role.charAt(0).toUpperCase() + role.slice(1)}-FontFamily, var(--Typography-Font-Text))`,
                          color: 'var(--Text-High)',
                          fontOpticalSizing: opszMode === 'auto' ? 'auto' : 'none',
                          ...(opszMode === 'manual' && opszEntry?.opszValue !== undefined
                            ? { fontVariationSettings: `'opsz' ${opszEntry.opszValue}` }
                            : {}),
                        } as React.CSSProperties}
                      >
                        The quick brown fox
                      </div>

                      {/* Token name */}
                      <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)', fontFamily: 'var(--Typography-Font-Code, monospace)' }}>
                        {tokenName}
                      </span>
                      {/* Size / Line height / Weight */}
                      <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)', fontFamily: 'var(--Typography-Font-Code, monospace)' }}>
                        {pxSize}px / {pxLH}px / {weight}
                      </span>
                      {/* Dimension step (resolved at the selected platform) */}
                      <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)', fontFamily: 'var(--Typography-Font-Code, monospace)' }}>
                        {stepLabel(effectiveFStep)}
                      </span>
                      {/* Optical size indicator */}
                      <Badge
                        size="xs"
                        appearance={opszMode === 'manual' ? 'informative' : 'neutral'}
                        attention="medium"
                      >
                        {opszLabel}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </ScopedPlatform>
    </FoundationCard>
  );
});
