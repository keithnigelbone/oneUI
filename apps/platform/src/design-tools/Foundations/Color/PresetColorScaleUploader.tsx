/**
 * PresetColorScaleUploader
 *
 * Component for uploading JSON color scale files and creating preset collections.
 * Validates the JSON structure matches the expected schema (25-step OkLCH scales).
 */

'use client';

import { useState, useCallback, useRef, type DragEvent, type ChangeEvent } from 'react';
import { validatePresetScaleJson } from '@oneui/shared';
import type { PresetColorScaleUploaderProps, UploadState, PreviewScaleInfo } from './PresetColorScaleUploader.shared';
import styles from './PresetColorScaleUploader.module.css';

export function PresetColorScaleUploader({
  onUpload,
  onUploadComplete,
  onUploadError,
  disabled = false,
}: PresetColorScaleUploaderProps) {
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [isDragOver, setIsDragOver] = useState(false);
  const [jsonContent, setJsonContent] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [previewScales, setPreviewScales] = useState<PreviewScaleInfo[]>([]);
  const [collectionName, setCollectionName] = useState('');
  const [collectionVersion, setCollectionVersion] = useState('v1.0');
  const [setAsDefault, setSetAsDefault] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.json')) {
      setValidationErrors(['File must be a JSON file (.json)']);
      setUploadState('error');
      return;
    }

    setUploadState('validating');
    setValidationErrors([]);
    setPreviewScales([]);
    setUploadError(null);

    try {
      const content = await file.text();
      const parsed = JSON.parse(content);

      // Validate the JSON structure
      const result = validatePresetScaleJson(parsed);

      if (!result.valid) {
        setValidationErrors(result.errors);
        setUploadState('error');
        return;
      }

      // Store content and preview
      setJsonContent(content);
      setPreviewScales(result.preview || []);

      // Suggest name from file
      const suggestedName = file.name.replace('.json', '').replace(/[_-]/g, ' ');
      if (!collectionName) {
        setCollectionName(suggestedName);
      }

      setUploadState('idle');
    } catch (error) {
      setValidationErrors(['Invalid JSON format: ' + (error instanceof Error ? error.message : 'Unknown error')]);
      setUploadState('error');
    }
  }, [collectionName]);

  // Drag handlers
  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [disabled, handleFile]);

  // Click handler
  const handleClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  // File input change handler
  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  // Upload handler
  const handleUpload = useCallback(async () => {
    if (!jsonContent || !collectionName.trim()) return;

    setUploadState('uploading');
    setUploadError(null);

    try {
      const result = await onUpload({
        name: collectionName.trim(),
        version: collectionVersion.trim() || 'v1.0',
        jsonContent,
        setAsDefault,
      });

      setUploadState('success');
      onUploadComplete?.({
        collectionId: result.collectionId,
        name: collectionName.trim(),
        scaleCount: result.scaleCount,
        scaleNames: result.scaleNames,
      });

      // Reset form after successful upload
      setTimeout(() => {
        setJsonContent(null);
        setPreviewScales([]);
        setCollectionName('');
        setCollectionVersion('v1.0');
        setSetAsDefault(false);
        setUploadState('idle');
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadError(errorMessage);
      setUploadState('error');
      onUploadError?.(errorMessage);
    }
  }, [jsonContent, collectionName, collectionVersion, setAsDefault, onUpload, onUploadComplete, onUploadError]);

  // Reset handler
  const handleReset = useCallback(() => {
    setJsonContent(null);
    setPreviewScales([]);
    setValidationErrors([]);
    setUploadError(null);
    setUploadState('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

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
        aria-label="Upload JSON color scale file"
      >
        <div className={styles.dropZoneIcon}>
          {previewScales.length > 0 ? '✓' : '📁'}
        </div>
        <div className={styles.dropZoneText}>
          {previewScales.length > 0
            ? 'File loaded - configure and upload'
            : 'Drop a JSON color scale file here'
          }
        </div>
        <div className={styles.dropZoneHint}>
          or click to browse
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleInputChange}
          className={styles.hiddenInput}
          disabled={disabled}
        />
      </div>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className={styles.errorSection}>
          <div className={styles.errorTitle}>Validation Errors</div>
          <ul className={styles.errorList}>
            {validationErrors.slice(0, 10).map((error, i) => (
              <li key={i}>{error}</li>
            ))}
            {validationErrors.length > 10 && (
              <li>...and {validationErrors.length - 10} more errors</li>
            )}
          </ul>
        </div>
      )}

      {/* Preview section */}
      {previewScales.length > 0 && (
        <>
          <div className={styles.previewSection}>
            <div className={styles.previewHeader}>
              <span className={styles.previewTitle}>Scales Preview</span>
              <span className={styles.previewCount}>{previewScales.length} scales</span>
            </div>
            <div className={styles.previewScales}>
              {previewScales.map((scale) => (
                <div
                  key={scale.name}
                  className={styles.previewScale}
                >
                  <div
                    className={styles.previewScaleColor}
                    style={{ backgroundColor: scale.baseColor }}
                  />
                  <div className={styles.previewScaleInfo}>
                    <span className={styles.previewScaleName}>{scale.name}</span>
                    <span className={styles.previewScaleBase}>Base: {scale.baseStep}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Collection details form */}
          <div className={styles.formFields}>
            <div className={styles.formField}>
              <label htmlFor="collection-name">Collection Name *</label>
              <input
                id="collection-name"
                type="text"
                value={collectionName}
                onChange={(e) => setCollectionName(e.target.value)}
                placeholder="e.g., Jio Default Colors"
                disabled={uploadState === 'uploading'}
              />
            </div>
            <div className={styles.formField}>
              <label htmlFor="collection-version">Version</label>
              <input
                id="collection-version"
                type="text"
                value={collectionVersion}
                onChange={(e) => setCollectionVersion(e.target.value)}
                placeholder="e.g., v1.0"
                disabled={uploadState === 'uploading'}
              />
            </div>
          </div>

          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={setAsDefault}
              onChange={(e) => setSetAsDefault(e.target.checked)}
              disabled={uploadState === 'uploading'}
            />
            Set as default collection for new brands
          </label>
        </>
      )}

      {/* Upload error */}
      {uploadError && (
        <div className={`${styles.statusMessage} ${styles.error}`}>
          Upload failed: {uploadError}
        </div>
      )}

      {/* Status messages */}
      {uploadState === 'validating' && (
        <div className={`${styles.statusMessage} ${styles.validating}`}>
          <div className={styles.spinner} />
          Validating JSON structure...
        </div>
      )}

      {uploadState === 'uploading' && (
        <div className={`${styles.statusMessage} ${styles.uploading}`}>
          <div className={styles.spinner} />
          Uploading collection...
        </div>
      )}

      {uploadState === 'success' && (
        <div className={`${styles.statusMessage} ${styles.success}`}>
          ✓ Collection uploaded successfully!
        </div>
      )}

      {/* Actions */}
      {previewScales.length > 0 && uploadState !== 'success' && (
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
            disabled={!collectionName.trim() || uploadState === 'uploading'}
          >
            {uploadState === 'uploading' ? 'Uploading...' : 'Upload Collection'}
          </button>
        </div>
      )}
    </div>
  );
}

export type { PresetColorScaleUploaderProps };
