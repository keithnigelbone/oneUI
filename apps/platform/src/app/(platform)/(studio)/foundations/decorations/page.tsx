/**
 * foundations/decorations/page.tsx
 *
 * Decorations Foundation - Upload ornament SVGs and assign them to components.
 * Provides a library of decorative SVG assets and per-component assignment controls.
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import { Id } from '@oneui/convex/_generated/dataModel';
import { FoundationCard } from '@/design-tools/Foundations/shared';
import { Button } from '@oneui/ui/components/Button';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Select } from '@oneui/ui/components/Select';
import { Tabs } from '@oneui/ui/components/Tabs';
import { ToggleGroup } from '@oneui/ui/components/ToggleGroup';
import {
  sanitizeOrnamentSvg,
  getOrnamentAspectRatio,
  generateOrnamentCSSProperties,
  mirrorSvg,
  MAX_ORNAMENT_SVG_SIZE,
  getSvgDecorationComponents,
} from '@oneui/shared';
import { usePlatformContext } from '@/contexts/PlatformContext';
import styles from '../foundation.module.css';

/**
 * Convert SVG string to a data URL suitable for <img src>.
 * Returns a plain data URI suitable for <img src>, not CSS url() wrapped.
 */
function svgToImgSrc(svgContent: string): string {
  const encoded = encodeURIComponent(svgContent);
  return `data:image/svg+xml,${encoded}`;
}

/** Components that support SVG ornament decoration */
const ASSIGNABLE_COMPONENTS = getSvgDecorationComponents().map(
  (capability) => capability.componentName,
);

type Placement = 'edges' | 'left' | 'right';

const PLACEMENT_OPTIONS: { value: Placement; label: string }[] = [
  { value: 'edges', label: 'Both Edges' },
  { value: 'left', label: 'Left Only' },
  { value: 'right', label: 'Right Only' },
];

// ============================================================================
// Sub-components
// ============================================================================

/**
 * Drag-and-drop SVG upload area with file input fallback
 */
function OrnamentUploader({
  onUpload,
}: {
  onUpload: (name: string, svgContent: string, aspectRatio: number) => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      setError(null);

      if (!file.name.endsWith('.svg') && file.type !== 'image/svg+xml') {
        setError('Only SVG files are supported');
        return;
      }

      if (file.size > MAX_ORNAMENT_SVG_SIZE) {
        setError(`File exceeds maximum size of ${MAX_ORNAMENT_SVG_SIZE / 1024}KB`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const result = sanitizeOrnamentSvg(content);

        if (!result.valid) {
          setError(result.errors.join(', '));
          return;
        }

        const aspectRatio = getOrnamentAspectRatio(result.sanitized);
        const name = file.name.replace(/\.svg$/i, '');
        onUpload(name, result.sanitized, aspectRatio);
      };
      reader.readAsText(file);
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      // Reset so same file can be re-selected
      e.target.value = '';
    },
    [processFile]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-3-5)' }}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragOver ? 'var(--Surface-Bold)' : 'var(--Border-Subtle)'}`,
          borderRadius: 'var(--Shape-4)',
          padding: 'var(--Spacing-5)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--Spacing-3-5)',
          cursor: 'pointer',
          backgroundColor: isDragOver ? 'var(--Surface-Subtle)' : 'transparent',
          transition: 'background-color var(--Motion-Duration-Discreet-Short), border-color var(--Motion-Duration-Discreet-Short)',
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--Text-Low)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span style={{ fontSize: 'var(--Typography-Size-S)', color: 'var(--Text-Medium)' }}>
          Drop SVG file here or click to browse
        </span>
        <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)' }}>
          Max {MAX_ORNAMENT_SVG_SIZE / 1024}KB, must include viewBox
        </span>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".svg,image/svg+xml"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      {error && (
        <div style={{
          fontSize: 'var(--Typography-Size-S)',
          color: 'var(--Negative-Bold, var(--Text-High))',
          padding: 'var(--Spacing-3-5) var(--Spacing-4)',
          backgroundColor: 'var(--Negative-Subtle, var(--Surface-Subtle))',
          borderRadius: 'var(--Shape-3-5)',
        }}>
          {error}
        </div>
      )}
    </div>
  );
}

/**
 * Single ornament card in the library grid
 */
function OrnamentCard({
  ornament,
  onDelete,
}: {
  ornament: { _id: string; name: string; svgContent: string; aspectRatio: number; category: string };
  onDelete: (id: string) => void;
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-3)',
        padding: 'var(--Spacing-4)',
        border: '1px solid var(--Border-Subtle)',
        borderRadius: 'var(--Shape-4)',
        backgroundColor: 'var(--Surface-Main)',
      }}
    >
      {/* SVG thumbnail — use <img> with data URL for reliable sizing */}
      <div
        style={{
          width: '100%',
          height: 'var(--Spacing-10)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--Shape-3-5)',
          overflow: 'hidden',
          /* Checkerboard so SVGs with any fill color are visible */
          backgroundImage: 'linear-gradient(45deg, var(--Surface-Ghost) 25%, transparent 25%, transparent 75%, var(--Surface-Ghost) 75%), linear-gradient(45deg, var(--Surface-Ghost) 25%, transparent 25%, transparent 75%, var(--Surface-Ghost) 75%)',
          backgroundSize: 'var(--Spacing-4) var(--Spacing-4)',
          backgroundPosition: '0 0, calc(var(--Spacing-4) / 2) calc(var(--Spacing-4) / 2)',
          backgroundColor: 'var(--Surface-Subtle)',
        }}
      >
        <img
          src={svgToImgSrc(ornament.svgContent)}
          alt={ornament.name}
          style={{
            maxWidth: '80%',
            maxHeight: '80%',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Info row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2)', minWidth: 0 }}>
          <span
            style={{
              fontSize: 'var(--Typography-Size-S)',
              fontWeight: 'var(--Typography-Weight-Medium)',
              color: 'var(--Text-High)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {ornament.name}
          </span>
          <div style={{ display: 'flex', gap: 'var(--Spacing-3)', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)' }}>
              {ornament.aspectRatio.toFixed(2)}:1
            </span>
            <span
              style={{
                fontSize: 'var(--Typography-Size-2XS)',
                color: 'var(--Text-Medium)',
                backgroundColor: 'var(--Surface-Subtle)',
                padding: '1px var(--Spacing-3)',
                borderRadius: 'var(--Shape-3)',
              }}
            >
              {ornament.category}
            </span>
          </div>
        </div>

        <IconButton
          attention="low"
          size="small"
          onPress={() => onDelete(ornament._id)}
          aria-label={`Delete ${ornament.name}`}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          }
        />
      </div>
    </div>
  );
}

/**
 * Render an ornament SVG as an <img> for reliable sizing.
 * Already sanitized at upload time.
 */
function InlineOrnamentSvg({
  svgContent,
  mirrored,
  height,
}: {
  svgContent: string;
  mirrored?: boolean;
  height: string;
}) {
  const content = mirrored ? mirrorSvg(svgContent) : svgContent;
  return (
    <img
      src={svgToImgSrc(content)}
      alt=""
      style={{
        height,
        width: 'auto',
        flexShrink: 0,
        objectFit: 'contain',
      }}
    />
  );
}

/**
 * Live preview of a button-like element with ornament rendered inline
 */
function OrnamentPreview({
  ornament,
  placement,
  mirror,
}: {
  ornament: { svgContent: string; aspectRatio: number } | null;
  placement: Placement;
  mirror: boolean;
}) {
  if (!ornament) {
    return (
      <div style={{
        padding: 'var(--Spacing-4)',
        color: 'var(--Text-Low)',
        fontSize: 'var(--Typography-Size-S)',
        textAlign: 'center',
      }}>
        No ornament selected
      </div>
    );
  }

  const showLeft = placement === 'edges' || placement === 'left';
  const showRight = placement === 'edges' || placement === 'right';

  const ornamentHeight = 'var(--Spacing-9)';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--Spacing-4)',
    }}>
      {/* Preview area */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--Spacing-5)',
        backgroundColor: 'var(--Surface-Subtle)',
        borderRadius: 'var(--Shape-4)',
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center' }}>
          {/* Left ornament */}
          {showLeft && (
            <InlineOrnamentSvg
              svgContent={ornament.svgContent}
              mirrored={mirror}
              height={ornamentHeight}
            />
          )}

          {/* Button body */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--Spacing-3-5) var(--Spacing-7)',
            minHeight: 'var(--Spacing-10)',
            backgroundColor: 'var(--Primary-Bold, var(--Surface-Bold))',
            color: 'var(--Primary-Bold-High, var(--Text-OnBold-High))',
            borderRadius: 'var(--Button-borderRadius, var(--Shape-Pill))',
            fontSize: 'var(--Typography-Size-M)',
            fontWeight: 'var(--Typography-Weight-Medium)',
            border: 'none',
          }}>
            Sample Button
          </div>

          {/* Right ornament */}
          {showRight && (
            <InlineOrnamentSvg
              svgContent={ornament.svgContent}
              mirrored={false}
              height={ornamentHeight}
            />
          )}
        </div>
      </div>

      {/* CSS Properties reference */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--Spacing-3)',
        fontSize: 'var(--Typography-Size-2XS)',
        color: 'var(--Text-Low)',
      }}>
        {Object.entries(
          generateOrnamentCSSProperties('Button', ornament.svgContent, ornament.aspectRatio, mirror, placement)
        ).map(([key, value]) => (
          <code
            key={key}
            style={{
              backgroundColor: 'var(--Surface-Subtle)',
              padding: '1px var(--Spacing-3)',
              borderRadius: 'var(--Shape-3)',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap',
            }}
          >
            {key}
          </code>
        ))}
      </div>
    </div>
  );
}

/**
 * Assignment row for a single component
 */
function ComponentAssignmentRow({
  componentName,
  ornaments,
  assignment,
  onUpsert,
  onRemove,
}: {
  componentName: string;
  ornaments: Array<{ _id: string; name: string; svgContent: string; aspectRatio: number; category: string }>;
  assignment: { ornamentId: string; placement: string; mirror: boolean } | null;
  onUpsert: (ornamentId: string, placement: Placement, mirror: boolean) => void;
  onRemove: () => void;
}) {
  const selectedOrnament = ornaments.find((o) => o._id === assignment?.ornamentId) ?? null;
  const placement = (assignment?.placement as Placement) ?? 'edges';
  const mirror = assignment?.mirror ?? true;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--Spacing-4)',
        padding: 'var(--Spacing-4)',
        border: '1px solid var(--Border-Subtle)',
        borderRadius: 'var(--Shape-4)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: 'var(--Typography-Size-M)',
            fontWeight: 'var(--Typography-Weight-Medium)',
            color: 'var(--Text-High)',
          }}
        >
          {componentName}
        </span>
        {assignment && (
          <Button attention="low" size="small" onPress={onRemove}>
            Remove
          </Button>
        )}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 'var(--Spacing-4-5)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Ornament selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2-5)' }}>
          <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)' }}>Ornament</span>
          <Select
            value={assignment?.ornamentId ?? ''}
            onChange={(value) => {
              if (value) onUpsert(value, placement, mirror);
            }}
            options={[
              { value: '', label: 'None' },
              ...ornaments.map((o) => ({
                value: o._id,
                label: o.name,
              })),
            ]}
            size="sm"
            aria-label="Select ornament"
          />
        </div>

        {/* Placement selector */}
        {assignment && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2-5)' }}>
            <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)' }}>Placement</span>
            <ToggleGroup
              value={[placement]}
              onValueChange={(values) => {
                if (values[0]) onUpsert(assignment.ornamentId, values[0] as typeof placement, mirror);
              }}
              variant="subtool"
              size="small"
            >
              {PLACEMENT_OPTIONS.map((opt) => (
                <ToggleGroup.Item key={opt.value} value={opt.value}>
                  {opt.label}
                </ToggleGroup.Item>
              ))}
            </ToggleGroup>
          </div>
        )}

        {/* Mirror toggle */}
        {assignment && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-2-5)' }}>
            <span style={{ fontSize: 'var(--Typography-Size-XS)', color: 'var(--Text-Low)' }}>Mirror</span>
            <ToggleGroup
              value={mirror ? ['mirrored'] : ['same']}
              onValueChange={(values) => onUpsert(assignment.ornamentId, placement, values[0] === 'mirrored')}
              variant="subtool"
              size="small"
            >
              <ToggleGroup.Item value="same">Same</ToggleGroup.Item>
              <ToggleGroup.Item value="mirrored">Mirrored</ToggleGroup.Item>
            </ToggleGroup>
          </div>
        )}
      </div>

      {/* Live Preview */}
      {assignment && (
        <OrnamentPreview
          ornament={selectedOrnament}
          placement={placement}
          mirror={mirror}
        />
      )}
    </div>
  );
}

// ============================================================================
// Main Page
// ============================================================================

export default function DecorationsFoundationPage() {
  const { currentBrand } = usePlatformContext();
  const brandId = currentBrand?.id as Id<'brands'> | undefined;
  const [activeTab, setActiveTab] = useState<'library' | 'assignments'>('library');

  // Queries
  const ornaments = useQuery(api.brandOrnaments.listByBrand, brandId ? { brandId } : 'skip');
  const decorations = useQuery(api.brandOrnaments.listDecorationsByBrand, brandId ? { brandId } : 'skip');

  // Mutations
  const createOrnament = useMutation(api.brandOrnaments.create);
  const removeOrnament = useMutation(api.brandOrnaments.remove);
  const upsertDecoration = useMutation(api.brandOrnaments.upsertDecoration);
  const removeDecoration = useMutation(api.brandOrnaments.removeDecoration);

  const isLoading = brandId != null && ornaments === undefined;

  // Handlers
  const handleUpload = useCallback(
    async (name: string, svgContent: string, aspectRatio: number) => {
      if (!brandId) return;
      await createOrnament({
        brandId,
        name,
        svgContent,
        aspectRatio,
        category: 'edge',
      });
    },
    [brandId, createOrnament]
  );

  const handleDeleteOrnament = useCallback(
    async (ornamentId: string) => {
      await removeOrnament({ ornamentId: ornamentId as Id<'brandOrnaments'> });
    },
    [removeOrnament]
  );

  const handleUpsertDecoration = useCallback(
    async (componentName: string, ornamentId: string, placement: Placement, mirror: boolean) => {
      if (!brandId) return;
      await upsertDecoration({
        brandId,
        componentName,
        ornamentId: ornamentId as Id<'brandOrnaments'>,
        placement,
        mirror,
      });
    },
    [brandId, upsertDecoration]
  );

  const handleRemoveDecoration = useCallback(
    async (componentName: string) => {
      if (!brandId) return;
      await removeDecoration({ brandId, componentName });
    },
    [brandId, removeDecoration]
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Decorations</h1>
        <p className={styles.description}>
          Upload ornament SVGs and assign them to components for brand-specific decorative styling.
          {currentBrand && (
            <span className={styles.brandIndicator}>
              {' '}Configuring for <strong>{currentBrand.name}</strong>
            </span>
          )}
        </p>
      </div>

      <div className={styles.content}>
        <div className={styles.foundationTabsRow}>
          <Tabs.Root
            value={activeTab}
            onValueChange={(value) => setActiveTab((value as 'library' | 'assignments') ?? 'library')}
          >
            <Tabs.List className={styles.foundationTabsList}>
              <Tabs.Item value="library">Library</Tabs.Item>
              <Tabs.Item value="assignments">Assignments</Tabs.Item>
              <Tabs.Indicator />
            </Tabs.List>
          </Tabs.Root>
        </div>

        <div className={styles.tabPanelStack}>
        {isLoading && (
          <FoundationCard title="Decorations" description="Loading...">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'var(--Spacing-6)',
              color: 'var(--Text-Low)',
            }}>
              Loading...
            </div>
          </FoundationCard>
        )}

        {/* Card 1: Ornament Library */}
        {!isLoading && activeTab === 'library' && (
          <FoundationCard
            title="Ornament Library"
            description="Upload SVG ornament assets for this brand. Each ornament must have a viewBox for proper scaling."
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4-5)' }}>
              <OrnamentUploader onUpload={handleUpload} />

              {ornaments && ornaments.length > 0 ? (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: 'var(--Spacing-4)',
                  }}
                >
                  {ornaments.map((ornament) => (
                    <OrnamentCard
                      key={ornament._id}
                      ornament={ornament}
                      onDelete={handleDeleteOrnament}
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.placeholder}>
                  No ornaments uploaded yet. Drop an SVG above to get started.
                </div>
              )}
            </div>
          </FoundationCard>
        )}

        {/* Card 2: Component Assignments */}
        {!isLoading && activeTab === 'assignments' && (
          <FoundationCard
            title="Component Assignments"
            description="Assign ornaments to components and configure placement. Changes apply in real-time via brand CSS injection."
          >
            {ornaments && ornaments.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--Spacing-4)' }}>
                {ASSIGNABLE_COMPONENTS.map((componentName) => {
                  const assignment = decorations?.find((d) => d.componentName === componentName) ?? null;
                  return (
                    <ComponentAssignmentRow
                      key={componentName}
                      componentName={componentName}
                      ornaments={ornaments}
                      assignment={assignment ? {
                        ornamentId: assignment.ornamentId as string,
                        placement: assignment.placement,
                        mirror: assignment.mirror,
                      } : null}
                      onUpsert={(ornamentId, placement, mirror) =>
                        handleUpsertDecoration(componentName, ornamentId, placement, mirror)
                      }
                      onRemove={() => handleRemoveDecoration(componentName)}
                    />
                  );
                })}
              </div>
            ) : (
              <div className={styles.placeholder}>
                Upload ornaments to the library above before assigning them to components.
              </div>
            )}
          </FoundationCard>
        )}
        </div>
      </div>
    </div>
  );
}
