/**
 * fontFiles.ts
 *
 * Shared helpers for resolving a customFonts record's per-weight files.
 *
 * A record may store an explicit `files[]` array (multi-weight families) or
 * predate it (legacy single-file records), in which case the files are
 * synthesised from the top-level `file*` fields. Stored `fileUrl`s embed the
 * deployment host, so they are re-resolved against the current deployment at
 * read time; files whose storage is absent here are dropped so only loadable
 * weights surface (no 404s, no dead `@font-face`).
 */

import type { Id } from '../_generated/dataModel';

export interface FontFileEntry {
  fileId: Id<'_storage'>;
  fileUrl: string;
  fileName: string;
  fileFormat: 'ttf' | 'otf' | 'woff' | 'woff2';
  fileSize: number;
  weight: number;
}

/** Minimal structural shape of a customFonts document these helpers read. */
interface FontDocLike {
  fileId: Id<'_storage'>;
  fileUrl: string;
  fileName: string;
  fileFormat: 'ttf' | 'otf' | 'woff' | 'woff2';
  fileSize: number;
  weights: number[];
  files?: FontFileEntry[];
}

/** Just the storage read surface we need from a Convex query/mutation ctx. */
interface StorageCtx {
  storage: { getUrl(id: Id<'_storage'>): Promise<string | null> };
}

/**
 * The record's file list, synthesising a single entry from the legacy
 * top-level `file*` fields when `files[]` is absent.
 */
export function synthesizeFontFiles(font: FontDocLike): FontFileEntry[] {
  if (font.files && font.files.length > 0) return font.files;
  return [
    {
      fileId: font.fileId,
      fileUrl: font.fileUrl,
      fileName: font.fileName,
      fileFormat: font.fileFormat,
      fileSize: font.fileSize,
      weight: font.weights[0] ?? 400,
    },
  ];
}

/**
 * Re-resolve every file's URL against this deployment (in parallel) and drop
 * files whose storage is absent here.
 */
export async function resolveFontFiles(
  ctx: StorageCtx,
  font: FontDocLike
): Promise<FontFileEntry[]> {
  const raw = synthesizeFontFiles(font);
  const resolved = await Promise.all(
    raw.map(async (f): Promise<FontFileEntry | null> => {
      const url = await ctx.storage.getUrl(f.fileId);
      return url ? { ...f, fileUrl: url } : null;
    })
  );
  return resolved.filter((f): f is FontFileEntry => f !== null);
}

/** Sorted, de-duplicated static weight set derived from the file list. */
export function staticWeights(files: FontFileEntry[]): number[] {
  return [...new Set(files.map((f) => f.weight))].sort((a, b) => a - b);
}
