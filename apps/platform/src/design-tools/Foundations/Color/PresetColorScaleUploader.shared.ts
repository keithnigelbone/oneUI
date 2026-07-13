/**
 * Shared types for PresetColorScaleUploader component
 */

/**
 * Upload state tracking
 */
export type UploadState = 'idle' | 'validating' | 'uploading' | 'success' | 'error';

/**
 * Upload result type
 */
export interface UploadResult {
  collectionId: string;
  name: string;
  scaleCount: number;
  scaleNames: string[];
}

/**
 * Upload function type (provided by consumer)
 */
export type UploadCollectionFn = (args: {
  name: string;
  version: string;
  jsonContent: string;
  setAsDefault?: boolean;
}) => Promise<{ collectionId: string; scaleCount: number; scaleNames: string[] }>;

/**
 * Props for PresetColorScaleUploader component
 */
export interface PresetColorScaleUploaderProps {
  /** Function to upload the collection (provided by consumer using Convex) */
  onUpload: UploadCollectionFn;
  /** Called when upload completes successfully */
  onUploadComplete?: (result: UploadResult) => void;
  /** Called when upload fails */
  onUploadError?: (error: string) => void;
  /** Whether the uploader is disabled */
  disabled?: boolean;
}

/**
 * Preview scale info for display
 */
export interface PreviewScaleInfo {
  name: string;
  baseStep: string;
  stepCount: number;
  baseColor: string;
}
