/**
 * FontUploader
 *
 * Component for uploading custom font files (TTF, OTF, WOFF, WOFF2).
 * Parses font metadata using opentype.js and auto-detects variable fonts.
 */

'use client';

import {
  useState,
  useCallback,
  useRef,
  useMemo,
  type DragEvent,
  type ChangeEvent,
} from 'react';
import {
  parseFontFile,
  detectFontFormat,
  isValidFontFile,
  formatFileSize,
  getCssFallback,
  type FontFormat,
  type FontCategory,
} from './fontParser';
import { Select, type SelectOption } from '@oneui/ui-internal/components/Select';
import type {
  FontUploaderProps,
  FontUploadState,
  FontPreviewInfo,
  EditableFontMetadata,
} from './FontUploader.shared';
import styles from './FontUploader.module.css';

const SUPPORTED_FORMATS: FontFormat[] = ['ttf', 'otf', 'woff', 'woff2'];

const CATEGORY_OPTIONS: SelectOption<FontCategory>[] = [
  { value: 'variable', label: 'Variable' },
  { value: 'sans-serif', label: 'Sans Serif' },
  { value: 'serif', label: 'Serif' },
  { value: 'mono', label: 'Monospace' },
  { value: 'script', label: 'Script / Handwriting' },
];

const FALLBACK_OPTIONS: SelectOption<string>[] = [
  { value: 'sans-serif', label: 'sans-serif' },
  { value: 'serif', label: 'serif' },
  { value: 'monospace', label: 'monospace' },
  { value: 'cursive', label: 'cursive' },
  { value: 'system-ui', label: 'system-ui' },
];

export function FontUploader({
  onUpload,
  onUploadComplete,
  onUploadError,
  disabled = false,
}: FontUploaderProps) {
  const [uploadState, setUploadState] = useState<FontUploadState>('idle');
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewInfo, setPreviewInfo] = useState<FontPreviewInfo | null>(null);
  const [editableMetadata, setEditableMetadata] =
    useState<EditableFontMetadata | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFile = useCallback(async (selectedFile: File) => {
    if (!isValidFontFile(selectedFile)) {
      setValidationErrors([
        'Unsupported file format. Please use TTF, OTF, WOFF, or WOFF2.',
      ]);
      setUploadState('error');
      return;
    }

    setUploadState('parsing');
    setValidationErrors([]);
    setPreviewInfo(null);
    setEditableMetadata(null);
    setUploadError(null);

    const result = await parseFontFile(selectedFile);

    if (!result.valid || !result.metadata) {
      setValidationErrors(result.errors);
      setUploadState('error');
      return;
    }

    const format = detectFontFormat(selectedFile);
    if (!format) {
      setValidationErrors(['Could not detect font format']);
      setUploadState('error');
      return;
    }

    // Create preview info
    const preview: FontPreviewInfo = {
      familyName: result.metadata.familyName,
      fileName: selectedFile.name,
      fileSize: selectedFile.size,
      format,
      weights: result.metadata.weights,
      isVariable: result.metadata.isVariable,
      variableAxes: result.metadata.variableAxes,
      suggestedCategory: result.metadata.suggestedCategory,
    };

    setFile(selectedFile);
    setPreviewInfo(preview);
    setEditableMetadata({
      name: result.metadata.familyName,
      category: result.metadata.suggestedCategory,
      fallback: getCssFallback(result.metadata.suggestedCategory),
    });
    setUploadState('idle');
  }, []);

  // Drag handlers
  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [disabled, handleFile]
  );

  // Click handler
  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  // File input change handler
  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile]
  );

  // Upload handler
  const handleUpload = useCallback(async () => {
    if (!file || !previewInfo || !editableMetadata) return;

    setUploadState('uploading');
    setUploadError(null);

    try {
      const result = await onUpload({
        file,
        name: editableMetadata.name.trim(),
        familyName: previewInfo.familyName,
        format: previewInfo.format,
        category: editableMetadata.category,
        weights: previewInfo.weights,
        isVariable: previewInfo.isVariable,
        variableAxes: previewInfo.variableAxes,
        fallback: editableMetadata.fallback,
      });

      setUploadState('success');
      onUploadComplete?.({
        fontId: result.fontId,
        name: editableMetadata.name.trim(),
        familyName: previewInfo.familyName,
        isVariable: previewInfo.isVariable,
        updated: result.updated,
      });

      // Reset form after successful upload
      setTimeout(() => {
        setFile(null);
        setPreviewInfo(null);
        setEditableMetadata(null);
        setUploadState('idle');
      }, 2000);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Upload failed';
      setUploadError(errorMessage);
      setUploadState('error');
      onUploadError?.(errorMessage);
    }
  }, [
    file,
    previewInfo,
    editableMetadata,
    onUpload,
    onUploadComplete,
    onUploadError,
  ]);

  // Reset handler
  const handleReset = useCallback(() => {
    setFile(null);
    setPreviewInfo(null);
    setEditableMetadata(null);
    setValidationErrors([]);
    setUploadError(null);
    setUploadState('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  // Format weights for display
  const formattedWeights = useMemo(() => {
    if (!previewInfo) return '';
    if (previewInfo.isVariable && previewInfo.weights.length > 1) {
      return `${previewInfo.weights[0]} - ${previewInfo.weights[previewInfo.weights.length - 1]}`;
    }
    return previewInfo.weights.join(', ');
  }, [previewInfo]);

  return (
    <div className={styles.container}>
      {/* Drop zone */}
      <div
        className={`${styles.dropZone} ${isDragOver ? styles.dragOver : ''} ${disabled ? styles.disabled : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Upload font file"
      >
        <div className={styles.dropZoneIcon}>
          {previewInfo ? '✓' : ''}
        </div>
        <div className={styles.dropZoneText}>
          {previewInfo
            ? 'Font loaded - configure and upload'
            : 'Drop a font file here'}
        </div>
        <div className={styles.dropZoneHint}>or click to browse</div>
        <div className={styles.formatBadges}>
          {SUPPORTED_FORMATS.map((format) => (
            <span key={format} className={styles.formatBadge}>
              {format}
            </span>
          ))}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".ttf,.otf,.woff,.woff2"
          onChange={handleInputChange}
          className={styles.hiddenInput}
          disabled={disabled}
        />
      </div>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className={styles.errorSection}>
          <div className={styles.errorTitle}>Error</div>
          <ul className={styles.errorList}>
            {validationErrors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Preview section */}
      {previewInfo && editableMetadata && (
        <>
          <div className={styles.previewSection}>
            <div className={styles.previewHeader}>
              <span className={styles.previewTitle}>Font Details</span>
              <div className={styles.previewBadges}>
                <span className={styles.badge}>{previewInfo.format.toUpperCase()}</span>
                {previewInfo.isVariable && (
                  <span className={`${styles.badge} ${styles.variable}`}>
                    Variable
                  </span>
                )}
              </div>
            </div>

            <div className={styles.previewInfo}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Family:</span>
                <span className={styles.infoValue}>
                  {previewInfo.familyName}
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>File:</span>
                <span className={styles.infoValue}>
                  {previewInfo.fileName} ({formatFileSize(previewInfo.fileSize)}
                  )
                </span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Weights:</span>
                <span className={styles.infoValue}>{formattedWeights}</span>
              </div>
              {previewInfo.variableAxes && previewInfo.variableAxes.length > 0 && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Axes:</span>
                  <div className={styles.axesList}>
                    {previewInfo.variableAxes.map((axis) => (
                      <div key={axis.tag} className={styles.axisItem}>
                        <span className={styles.axisTag}>{axis.tag}</span>
                        <span className={styles.axisRange}>
                          {axis.minValue} - {axis.maxValue} (default:{' '}
                          {axis.defaultValue})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Editable fields */}
          <div className={styles.formFields}>
            <div className={`${styles.formField} ${styles.fullWidth}`}>
              <label htmlFor="font-name">Display Name *</label>
              <input
                id="font-name"
                type="text"
                value={editableMetadata.name}
                onChange={(e) =>
                  setEditableMetadata((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
                placeholder="e.g., JioType Variable"
                disabled={uploadState === 'uploading'}
              />
            </div>
            <div className={styles.formField}>
              <label htmlFor="font-category">Category</label>
              <Select
                value={editableMetadata.category}
                onChange={(value) =>
                  setEditableMetadata((prev) =>
                    prev ? { ...prev, category: value } : null
                  )
                }
                options={CATEGORY_OPTIONS}
                disabled={uploadState === 'uploading'}
                aria-label="Font category"
              />
            </div>
            <div className={styles.formField}>
              <label htmlFor="font-fallback">CSS Fallback</label>
              <Select
                value={editableMetadata.fallback}
                onChange={(value) =>
                  setEditableMetadata((prev) =>
                    prev ? { ...prev, fallback: value } : null
                  )
                }
                options={FALLBACK_OPTIONS}
                disabled={uploadState === 'uploading'}
                aria-label="CSS fallback font"
              />
            </div>
          </div>
        </>
      )}

      {/* Upload error */}
      {uploadError && (
        <div className={`${styles.statusMessage} ${styles.error}`}>
          Upload failed: {uploadError}
        </div>
      )}

      {/* Status messages */}
      {uploadState === 'parsing' && (
        <div className={`${styles.statusMessage} ${styles.parsing}`}>
          <div className={styles.spinner} />
          Parsing font file...
        </div>
      )}

      {uploadState === 'uploading' && (
        <div className={`${styles.statusMessage} ${styles.uploading}`}>
          <div className={styles.spinner} />
          Uploading font...
        </div>
      )}

      {uploadState === 'success' && (
        <div className={`${styles.statusMessage} ${styles.success}`}>
          Font uploaded successfully!
        </div>
      )}

      {/* Actions */}
      {previewInfo && uploadState !== 'success' && (
        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.actionButton} ${styles.secondary}`}
            onClick={handleReset}
            disabled={uploadState === 'uploading'}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`${styles.actionButton} ${styles.primary}`}
            onClick={handleUpload}
            disabled={
              !editableMetadata?.name.trim() || uploadState === 'uploading'
            }
          >
            {uploadState === 'uploading' ? 'Uploading...' : 'Upload Font'}
          </button>
        </div>
      )}
    </div>
  );
}

export type { FontUploaderProps };
