/**
 * ButtonSurfacePreview.tsx
 *
 * Displays Button component matrix on different V4 surface backgrounds.
 * Shows how buttons adapt to their surface context using the V4 multi-role
 * stacking system with surface modes × on-colour tokens.
 *
 * Key concept: Buttons are SURFACE-CONTEXT AWARE - they adapt their colors based on the
 * parent surface they're placed on, ensuring proper contrast and accessibility.
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@oneui/ui-internal/components/Button';
import { BUTTON_TOKEN_MANIFEST } from '@oneui/ui-internal/components/Button/Button.tokens';
import type { ButtonSize as ButtonSizeType } from '@oneui/ui-internal/components/Button/Button.shared';
import { deriveSizeLabels } from './constants';
import type { SurfaceToken, MultiRoleTokenSets } from '@oneui/shared/engine';
import { getReadableTextColor } from '@oneui/shared/engine';
import { Surface } from '@oneui/ui-internal/components/Surface/Surface';
import styles from './ButtonSurfacePreview.module.css';

/** Button variants */
const BUTTON_VARIANTS = ['bold', 'subtle', 'ghost'] as const;
type ButtonVariant = typeof BUTTON_VARIANTS[number];

/** Button sizes derived from token manifest (single source of truth) */
const MANIFEST_SIZE_LABELS = deriveSizeLabels(BUTTON_TOKEN_MANIFEST.tokens);
const BUTTON_SIZES = Object.keys(MANIFEST_SIZE_LABELS) as Array<string>;
type ButtonSize = string;

/** Unified surface modes */
const UNIFIED_SURFACE_MODES: SurfaceToken[] = [
  'default', 'minimal', 'subtle', 'moderate', 'bold', 'elevated', 'blend',
];

/** Surface labels for display */
const SURFACE_LABELS: Record<SurfaceToken, string> = {
  'default': 'Default',
  'ghost': 'Ghost',
  'minimal': 'Minimal',
  'subtle': 'Subtle',
  'moderate': 'Moderate',
  'bold': 'Bold',
  'elevated': 'Elevated',
  'blend': 'Blend',
};

/** Attention labels (Figma API terminology) */
const VARIANT_LABELS: Record<ButtonVariant, string> = {
  bold: 'High',
  subtle: 'Medium',
  ghost: 'Low',
};

/** Size labels derived from token manifest */
const SIZE_LABELS = MANIFEST_SIZE_LABELS;

/** Reasons why surface stacking might be unavailable */
export type SurfaceStackingUnavailableReason =
  | 'no-surfaces-config'
  | 'no-preset-scales'
  | 'no-primary-scale'
  | 'loading'
  | null;

/** Display layout mode */
export type SurfaceDisplayMode = 'all' | 'single';

export interface ButtonSurfacePreviewProps {
  /** @deprecated Component token overrides now come from .editor-preview-scope CSS */
  tokens?: Record<string, string>;
  /** Set of enabled surface mode names to display */
  enabledSurfaces: Set<SurfaceToken>;
  /** V4 multi-role surface stacking data */
  multiRoleStacking: MultiRoleTokenSets | null;
  /** Selected accent role for surface computation */
  selectedAccentRole: string;
  /** Current theme */
  theme: 'light' | 'dark';
  /** Whether to show interaction states (idle/hover/pressed) */
  showInteractionStates: boolean;
  /** Whether to show left icon */
  showLeftIcon: boolean;
  /** Whether to show right icon */
  showRightIcon: boolean;
  /** Whether to show buttons in condensed mode */
  showCondensed?: boolean;
  /** Whether to show buttons at full width */
  showFullWidth?: boolean;
  /** Selected button size (f-step value as string) */
  selectedSize?: string;
  /** Reason why surface stacking is unavailable (for helpful error messages) */
  unavailableReason?: SurfaceStackingUnavailableReason;
  /** Display mode: 'all' for row layout, 'single' for detailed single surface */
  displayMode?: SurfaceDisplayMode;
  /** Selected surface when in single mode */
  selectedSurface?: SurfaceToken;
  /** Callback when surface is selected in single mode */
  onSurfaceSelect?: (surface: SurfaceToken) => void;
  /** Callback when display mode changes */
  onDisplayModeChange?: (mode: SurfaceDisplayMode) => void;
}

/**
 * Interactive button with hover/pressed state simulation
 */
interface InteractiveButtonProps {
  variant: ButtonVariant;
  size: string;
  showLeftIcon: boolean;
  showRightIcon: boolean;
  showState?: 'idle' | 'hover' | 'pressed';
  condensed?: boolean;
  fullWidth?: boolean;
  appearance?: string;
}

function InteractiveButton({
  variant,
  size,
  showLeftIcon,
  showRightIcon,
  showState,
  condensed,
  fullWidth,
  appearance,
}: InteractiveButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  return (
    <div
      className={styles.buttonWrapper}
      data-state={showState}
      style={fullWidth ? { display: 'flex', flex: 1 } : undefined}
      onMouseEnter={() => !showState && setIsHovered(true)}
      onMouseLeave={() => { !showState && setIsHovered(false); !showState && setIsPressed(false); }}
      onMouseDown={() => !showState && setIsPressed(true)}
      onMouseUp={() => !showState && setIsPressed(false)}
    >
      <Button
        attention={({ bold: 'high', subtle: 'medium', ghost: 'low' } as const)[variant]}
        size={(Number(size) || 10) as ButtonSizeType}
        appearance={appearance as any}
        condensed={condensed}
        fullWidth={fullWidth}
        leftIcon={showLeftIcon ? "star" : undefined}
        rightIcon={showRightIcon ? "chevronRight" : undefined}
      >
        Button
      </Button>
    </div>
  );
}

/**
 * Row-based surface display using V4 stacking data
 */
function SurfaceRowV4({
  surfaceModeName,
  multiRoleStacking,
  selectedAccentRole,
  theme,
  showLeftIcon,
  showRightIcon,
  showCondensed,
  showFullWidth,
  selectedSize = '10',
}: {
  surfaceModeName: SurfaceToken;
  multiRoleStacking: MultiRoleTokenSets;
  selectedAccentRole: string;
  theme: 'light' | 'dark';
  showLeftIcon: boolean;
  showRightIcon: boolean;
  showCondensed?: boolean;
  showFullWidth?: boolean;
  selectedSize?: string;
}) {
  // Note: this preview reads `multiRoleStacking` in a legacy shape that
  // predates the `{ darkMode, parentStep, roles }` interface. Cast to `any`
  // to preserve current runtime behavior while the upstream shape is
  // finalised — index-safety is enforced via optional chaining below.
  const roleStacking = (multiRoleStacking as any)[selectedAccentRole];
  const modes = roleStacking?.[theme];

  const surfaceMode = modes?.[surfaceModeName];
  // INTENTIONAL-LITERAL: #808080 fallback hex — neutral gray for undefined surface before data resolves; no CSS token accessible in JS context
  const surfaceHex = surfaceMode?.hex ?? '#808080';
  const textColor = getReadableTextColor(surfaceHex);

  // Surface-aware button token remapping now comes from CSS [data-surface] selectors
  // generated by generateSurfaceContextCSSV4() in brand CSS. Setting data-surface
  // on the container triggers the cascade-based remapping — no inline vars needed.

  return (
    <div
      className={styles.surfaceRow}
      data-surface={surfaceModeName}
      style={{
        backgroundColor: surfaceHex,
      }}
    >
      <div className={styles.surfaceRowLabel} style={{ color: textColor }}>
        <span className={styles.surfaceRowName}>{SURFACE_LABELS[surfaceModeName]}</span>
        <span className={styles.surfaceRowStep}>{surfaceMode?.step ?? '—'}</span>
      </div>
      <div
        className={styles.surfaceRowButtons}
        style={showFullWidth ? { flex: 1, flexDirection: 'column', alignItems: 'stretch' } : undefined}
      >
        {BUTTON_VARIANTS.map((variant) => (
          <InteractiveButton
            key={variant}
            variant={variant}
            size={selectedSize}
            showLeftIcon={showLeftIcon}
            showRightIcon={showRightIcon}
            condensed={showCondensed}
            fullWidth={showFullWidth}
            appearance={selectedAccentRole}
          />
        ))}
      </div>
    </div>
  );
}

/** Get user-friendly message for unavailable reason */
function getUnavailableMessage(reason: SurfaceStackingUnavailableReason): {
  title: string;
  description: string;
} {
  switch (reason) {
    case 'loading':
      return {
        title: 'Loading...',
        description: 'Loading surface configuration data.',
      };
    case 'no-surfaces-config':
      return {
        title: 'Surfaces Not Configured',
        description: 'This brand does not have surfaces foundation configured. Go to Foundations > Surfaces to set up surface stacking.',
      };
    case 'no-preset-scales':
      return {
        title: 'No Color Scales Selected',
        description: 'This brand does not have preset color scales selected. Go to Foundations > Color to select a color palette.',
      };
    case 'no-primary-scale':
      return {
        title: 'Primary Scale Not Found',
        description: 'The configured primary scale was not found in the selected preset. Check your surfaces configuration.',
      };
    default:
      return {
        title: 'Surface Data Not Available',
        description: 'Configure surfaces and color scales in the Foundations section.',
      };
  }
}

export function ButtonSurfacePreview({
  tokens,
  enabledSurfaces,
  multiRoleStacking,
  selectedAccentRole,
  theme,
  showInteractionStates,
  showLeftIcon,
  showRightIcon,
  showCondensed,
  showFullWidth,
  selectedSize = '10',
  unavailableReason,
  displayMode = 'all',
  selectedSurface = 'default',
  onSurfaceSelect,
  onDisplayModeChange,
}: ButtonSurfacePreviewProps) {
  if (!multiRoleStacking) {
    const message = getUnavailableMessage(unavailableReason ?? null);
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyStateTitle}>{message.title}</p>
        <p className={styles.emptyStateDescription}>{message.description}</p>
      </div>
    );
  }

  const enabledSurfaceList = UNIFIED_SURFACE_MODES.filter(
    s => enabledSurfaces.has(s)
  );

  if (enabledSurfaceList.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No surfaces selected. Enable surfaces in the panel to see the preview.</p>
      </div>
    );
  }

  // Row-based layout - one surface per row
  return (
    <div className={styles.container} data-draggable="false">
      <div className={styles.surfaceRows}>
        {enabledSurfaceList.map((surfaceModeName) => (
          <SurfaceRowV4
            key={surfaceModeName}
            surfaceModeName={surfaceModeName}
            multiRoleStacking={multiRoleStacking}
            selectedAccentRole={selectedAccentRole}
            theme={theme}
            showLeftIcon={showLeftIcon}
            showRightIcon={showRightIcon}
            showCondensed={showCondensed}
            showFullWidth={showFullWidth}
            selectedSize={selectedSize}
          />
        ))}
      </div>
    </div>
  );
}

export default ButtonSurfacePreview;
