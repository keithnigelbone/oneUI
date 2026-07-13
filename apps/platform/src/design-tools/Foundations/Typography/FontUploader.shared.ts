/**
 * Shared types for FontUploader component
 */

import type { FontFormat, FontCategory, VariableAxis } from './fontParser';

/**
 * Upload state tracking
 */
export type FontUploadState = 'idle' | 'parsing' | 'uploading' | 'success' | 'error';

/**
 * Parsed font preview information
 */
export interface FontPreviewInfo {
  familyName: string;
  fileName: string;
  fileSize: number;
  format: FontFormat;
  weights: number[];
  isVariable: boolean;
  variableAxes?: VariableAxis[];
  suggestedCategory: FontCategory;
}

/**
 * Editable font metadata (can be modified by user before upload)
 */
export interface EditableFontMetadata {
  name: string;
  category: FontCategory;
  fallback: string;
}

/**
 * Upload result type
 */
export interface FontUploadResult {
  fontId: string;
  name: string;
  familyName: string;
  isVariable: boolean;
  updated: boolean;
}

/**
 * Upload function type (provided by consumer)
 */
export type UploadFontFn = (args: {
  file: File;
  name: string;
  familyName: string;
  format: FontFormat;
  category: FontCategory;
  weights: number[];
  isVariable: boolean;
  variableAxes?: VariableAxis[];
  fallback: string;
}) => Promise<{ fontId: string; updated: boolean }>;

/**
 * Props for FontUploader component
 */
export interface FontUploaderProps {
  /** Function to upload the font (provided by consumer using Convex) */
  onUpload: UploadFontFn;
  /** Called when upload completes successfully */
  onUploadComplete?: (result: FontUploadResult) => void;
  /** Called when upload fails */
  onUploadError?: (error: string) => void;
  /** Whether the uploader is disabled */
  disabled?: boolean;
}

export type { FontFormat, FontCategory, VariableAxis };
