/**
 * foundations/typography/overlays.tsx
 *
 * Fixed-position overlays for the typography foundation page:
 *   - FontSelectionToast   — slide-up action bar when a font is pending
 *   - FontUploadModal      — full-screen modal for uploading a custom font
 *   - DeleteFontDialog     — confirmation dialog before deleting an uploaded font
 */

import React from 'react';
import {
  type FontMetadata,
  buildFontFamilyString,
  FontUploader,
  type FontCategory,
} from '@/design-tools/Foundations/Typography';
import { Button } from '@oneui/ui/components/Button';
import { IconButton } from '@oneui/ui/components/IconButton';
import { ModalOverlay, ToastButton } from './helpers';

// ============================================================================
// FontSelectionToast
// ============================================================================

export interface FontSelectionToastProps {
  pendingFont: FontMetadata | null;
  loadedFonts: Set<string>;
  selectedFontId: string | null | undefined;
  onAddAsText: () => void;
  onAddAsHeading: () => void;
  onAddAsScript: () => void;
  onAddAsCode: () => void;
  onCancel: () => void;
}

export const FontSelectionToast = React.memo(function FontSelectionToast({
  pendingFont,
  loadedFonts,
  selectedFontId,
  onAddAsText,
  onAddAsHeading,
  onAddAsScript,
  onAddAsCode,
  onCancel,
}: FontSelectionToastProps) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        padding: 'var(--Spacing-4-5)',
        pointerEvents: 'none',
        zIndex: 100,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--Spacing-4)',
          padding: 'var(--Spacing-4) var(--Spacing-4-5)',
          backgroundColor: 'var(--Surface-Main)',
          borderRadius: 'var(--Shape-4)',
          boxShadow: 'var(--Elevation-4)',
          transform: pendingFont ? 'translateY(0)' : 'translateY(100px)',
          opacity: pendingFont ? 1 : 0,
          transition: 'transform 250ms ease-out, opacity 250ms ease-out',
          pointerEvents: 'auto',
        }}
      >
        {pendingFont && (
          <>
            <div
              style={{
                fontFamily: loadedFonts.has(pendingFont.id) ? buildFontFamilyString(pendingFont) : 'inherit',
                fontSize: 'var(--Typography-Size-L)',
                fontWeight: 600,
                color: 'var(--Text-High)',
              }}
            >
              {pendingFont.name}
            </div>

            <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--Surface-Subtle)' }} />

            <ToastButton attention="high" onClick={onAddAsText}>
              Add as Text
            </ToastButton>

            {selectedFontId && selectedFontId !== pendingFont.id && (
              <ToastButton attention="low" onClick={onAddAsHeading}>
                Add as Heading
              </ToastButton>
            )}

            {pendingFont.category === 'script' && (
              <ToastButton attention="low" onClick={onAddAsScript}>
                Add as Script
              </ToastButton>
            )}

            {pendingFont.category === 'mono' && (
              <ToastButton attention="low" onClick={onAddAsCode}>
                Add as Code
              </ToastButton>
            )}

            <ToastButton attention="low" onClick={onCancel}>
              Cancel
            </ToastButton>
          </>
        )}
      </div>
    </div>
  );
});

// ============================================================================
// FontUploadModal
// ============================================================================

export interface FontUploadModalProps {
  onClose: () => void;
  onUpload: (args: {
    file: File;
    name: string;
    familyName: string;
    format: 'ttf' | 'otf' | 'woff' | 'woff2';
    category: FontCategory;
    weights: number[];
    isVariable: boolean;
    variableAxes?: Array<{
      tag: string;
      minValue: number;
      maxValue: number;
      defaultValue: number;
    }>;
    fallback: string;
  }) => Promise<{ fontId: string; updated: boolean }>;
}

export const FontUploadModal = React.memo(function FontUploadModal({
  onClose,
  onUpload,
}: FontUploadModalProps) {
  return (
    <ModalOverlay onClose={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-modal-title"
        style={{
          backgroundColor: 'var(--Surface-Main)',
          borderRadius: 'var(--Shape-4-5)',
          padding: 'var(--Spacing-5)',
          width: '100%',
          maxWidth: '500px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: 'var(--Elevation-5)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--Spacing-4-5)' }}>
          <div>
            <h2
              id="upload-modal-title"
              style={{
                fontFamily: 'var(--Typography-Font-Primary)',
                fontSize: 'var(--Title-M-FontSize)',
                lineHeight: 'var(--Title-M-LineHeight)',
                fontWeight: 'var(--Title-M-FontWeight)',
                color: 'var(--Text-High)',
                margin: 0,
              }}
            >
              Upload Custom Font
            </h2>
            <p
              style={{
                fontFamily: 'var(--Typography-Font-Primary)',
                fontSize: 'var(--Body-S-FontSize)',
                lineHeight: 'var(--Body-S-LineHeight)',
                fontWeight: 'var(--Body-FontWeight-Low)',
                color: 'var(--Text-Medium)',
                margin: 'var(--Spacing-3) 0 0 0',
              }}
            >
              Upload TTF, OTF, WOFF, or WOFF2 font files
            </p>
          </div>
          <IconButton
            attention="low"
            size="small"
            icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>}
            onPress={onClose}
            aria-label="Close upload modal"
          />
        </div>
        <FontUploader
          onUpload={onUpload}
          onUploadComplete={() => setTimeout(onClose, 1500)}
          onUploadError={() => {}}
        />
      </div>
    </ModalOverlay>
  );
});

// ============================================================================
// DeleteFontDialog
// ============================================================================

export interface DeleteFontDialogProps {
  font: FontMetadata;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteFontDialog = React.memo(function DeleteFontDialog({
  font,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteFontDialogProps) {
  return (
    <ModalOverlay onClose={() => !isDeleting && onCancel()}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        style={{
          backgroundColor: 'var(--Surface-Main)',
          borderRadius: 'var(--Shape-4-5)',
          padding: 'var(--Spacing-5)',
          width: '100%',
          maxWidth: '400px',
          boxShadow: 'var(--Elevation-5)',
        }}
      >
        <h3
          id="delete-dialog-title"
          style={{
            fontFamily: 'var(--Typography-Font-Primary)',
            fontSize: 'var(--Title-M-FontSize)',
            lineHeight: 'var(--Title-M-LineHeight)',
            fontWeight: 'var(--Title-M-FontWeight)',
            color: 'var(--Text-High)',
            margin: '0 0 var(--Spacing-3-5) 0',
          }}
        >
          Delete Font
        </h3>
        <p
          id="delete-dialog-description"
          style={{
            fontFamily: 'var(--Typography-Font-Primary)',
            fontSize: 'var(--Body-S-FontSize)',
            lineHeight: 'var(--Body-S-LineHeight)',
            fontWeight: 'var(--Body-FontWeight-Low)',
            color: 'var(--Text-Medium)',
            margin: '0 0 var(--Spacing-4-5) 0',
          }}
        >
          Are you sure you want to delete <strong>{font.name}</strong>? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 'var(--Spacing-3-5)', justifyContent: 'flex-end' }}>
          <Button
            attention="low"
            size="small"
            onPress={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            attention="high"
            size="small"
            appearance="negative"
            onPress={onConfirm}
            loading={isDeleting}
          >
            Delete
          </Button>
        </div>
      </div>
    </ModalOverlay>
  );
});
