/**
 * /api/experience-lab/export — server-side artifact export (EXP-01/02/03 / D-13).
 *
 * A card-action menu (`⋮ → Export ▸ Code / PNG / JPG / PDF`) POSTs here. The route
 * reads the artifact version's PERSISTED compiled bundle from Convex (D-12 — NO
 * re-generation), delegates the kind → emitter routing to the UNIT-TESTED pure
 * `dispatchExport` (from `@oneui/experience-builder-export`), uploads the produced
 * bytes to Convex `_storage` (mirroring `uploadThumbnail` in run/route.ts), and
 * records an APPEND-ONLY `experienceExports` row referencing the `_storage` id.
 * The result surfaces as the existing `export` card kind with a download URL.
 *
 *   - code      → exportCode      (persisted TSX + resolved Jio CSS, no re-gen)
 *   - png / jpg → exportRaster     (re-render at foundation-resolved native size,
 *                                   deviceScaleFactor = pixelDensity — D-10)
 *   - pdf       → composeCarouselPdf over the ordered carousel frame rasters (D-11)
 *
 * Security: brand-scoped (rejects the unsaved `PLACEHOLDER_BRAND_ID`, ASVS V4),
 * strict Zod body (`.strict()`, V5). The render runs in the SAME credential-free
 * Playwright path the eval screenshots use — no auth/session/Convex token reaches
 * the rendered bundle (PREV-01 / T-04-10). The Lab uses its own `experience*`
 * tables + `_storage`; it NEVER imports or writes the legacy `campaignAssets`
 * table or any `(builder)` internals (LAB-03 isolation).
 *
 * Runtime: Node (Playwright + Convex HTTP require Node — NEVER Edge).
 */

import {
  dispatchExport,
  exportCode,
  exportRaster,
  composeCarouselPdf,
  type ExportEmitters,
  type RasterCaptureFn,
  type DispatchExportInput,
  type PdfFrameJob,
} from '@oneui/experience-builder-export';
import {
  resolveFoundation,
  type ResolveFoundationInput,
} from '@oneui/experience-builder-agents';
import {
  ArtifactTypeSchema,
  OutputProfileSchema,
  type ResolvedDimensionsT,
} from '@oneui/experience-builder-core';
import { captureCodeScreenshots } from '@/lib/playwrightRenderer';
import type { ConvexHttpClient } from 'convex/browser';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { z } from 'zod';
import { createRequiredAuthedConvexClient } from '@/lib/convexServer';

export const runtime = 'nodejs';
export const maxDuration = 120;

/** The unsaved prompt-card placeholder brand id — NOT a real `brands` doc id. */
const PLACEHOLDER_BRAND_ID = 'jio';

/** MIME types per export kind, recorded on the export row for the download. */
const CONTENT_TYPE: Record<'code' | 'png' | 'jpg' | 'pdf', string> = {
  code: 'text/plain; charset=utf-8',
  png: 'image/png',
  jpg: 'image/jpeg',
  pdf: 'application/pdf',
};

/** Strict export request body (V5 / T-04-11). Unknown keys rejected. */
const ExportRequestBody = z
  .object({
    versionId: z.string().min(1),
    brandId: z.string().min(1),
    kind: z.enum(['code', 'png', 'jpg', 'pdf']),
    artifactType: ArtifactTypeSchema,
    outputProfile: OutputProfileSchema,
    /** The resolved Jio CSS bundled with a code export (D-12). */
    css: z.string().optional(),
    /** Optional sub-brand selection forwarded to the foundation resolver. */
    subBrandConfigId: z.string().optional(),
  })
  .strict();

/**
 * The real raster capture fn (EXP-02): the SAME credential-free Playwright path
 * the eval screenshots use (PREV-01 / T-04-10). Adapts `captureCodeScreenshots`
 * to the export package's `RasterCaptureFn` contract.
 */
const realCapture: RasterCaptureFn = async (input) => {
  const captures = await captureCodeScreenshots({
    code: input.code,
    viewports: input.viewports,
    deviceScaleFactor: input.deviceScaleFactor,
    format: input.format,
    ...(input.quality != null ? { quality: input.quality } : {}),
  });
  return captures.map((c) => ({ viewport: c.viewport, png: c.png }));
};

/** The real emitters wired into the pure dispatch. */
const emitters: ExportEmitters = {
  exportCode,
  exportRaster: (i) => exportRaster(i, realCapture),
  composeCarouselPdf,
};

type ExportArtifactRow = {
  variantGroupId?: string;
  brandId?: unknown;
};

/**
 * Upload export bytes to Convex `_storage` and return the storage id. Mirrors
 * `uploadThumbnail` (run/route.ts) — `generateUploadUrl` → POST bytes → read back
 * `{ storageId }`.
 */
async function uploadBytes(
  convex: ConvexHttpClient,
  bytes: Buffer | Uint8Array,
  contentType: string,
): Promise<Id<'_storage'>> {
  const uploadUrl = (await convex.mutation(
    api.renderedScreenshots.generateUploadUrl,
    {},
  )) as string;
  const uploadRes = await fetch(uploadUrl, {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body: bytes as unknown as BodyInit,
  });
  const { storageId } = (await uploadRes.json()) as { storageId: Id<'_storage'> };
  return storageId;
}

export async function POST(request: Request): Promise<Response> {
  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    return new Response('Invalid JSON body', { status: 400 });
  }

  const result = ExportRequestBody.safeParse(parsed);
  if (!result.success) {
    return new Response(
      JSON.stringify({ error: 'Invalid export request', issues: result.error.issues }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }
  const { versionId, brandId, kind, artifactType, outputProfile, css, subBrandConfigId } =
    result.data;

  // Brand-scope guard (ASVS V4): export only operates on a persisted artifact the
  // brand owns; the unsaved placeholder is never a real brands doc.
  if (brandId === PLACEHOLDER_BRAND_ID) {
    return new Response(
      JSON.stringify({ error: 'Cannot export from the unsaved placeholder brand.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return new Response(
      JSON.stringify({ error: 'Convex not configured; cannot read the artifact version.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }
  const convex = await createRequiredAuthedConvexClient(convexUrl);
  if (!convex) {
    return new Response(
      JSON.stringify({ error: 'Authentication required' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Read the PERSISTED artifact version (D-12 — no re-generation). The compiled
  // bundle is the source of truth for code AND raster export.
  let versionRow: { compiledBundle?: { code?: string }; artifactId?: unknown } | null;
  // The owning artifact carries `variantGroupId` (carousel grouping, D-11) and
  // `brandId` (ownership). Kept for the multi-page PDF path + the brand-scope check.
  let artifactRow: ExportArtifactRow | null = null;
  try {
    const got = await convex.query(api.experienceRuns.getArtifactVersion, {
      versionId: versionId as Id<'experienceArtifactVersions'>,
    });
    versionRow = got?.version as typeof versionRow;
    artifactRow = (got?.artifact ?? null) as ExportArtifactRow | null;
  } catch (err) {
    console.error('[experience-lab/export] getArtifactVersion failed:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to read the artifact version.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
  if (!versionRow || !artifactRow) {
    return new Response(
      JSON.stringify({
        error: `Artifact version "${versionId}" was not found.`,
      }),
      { status: 404, headers: { 'Content-Type': 'application/json' } },
    );
  }
  if (String(artifactRow.brandId ?? '') !== brandId) {
    return new Response(
      JSON.stringify({ error: 'Artifact version does not belong to the requested brand.' }),
      { status: 403, headers: { 'Content-Type': 'application/json' } },
    );
  }
  const persistedCode = versionRow?.compiledBundle?.code;
  if (!persistedCode) {
    return new Response(
      JSON.stringify({
        error: `No persisted compiled bundle for version "${versionId}". Cannot export.`,
      }),
      { status: 404, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Re-resolve the foundation dimensions for the raster/PDF path (D-10 / CAMP-05).
  // Same deterministic resolver the run route uses — credential-free, no re-gen.
  // Skipped for code export (it needs no dimensions).
  let resolvedDimensions: ResolvedDimensionsT | undefined;
  if (kind === 'png' || kind === 'jpg' || kind === 'pdf') {
    try {
      const platformsFoundation = await convex.query(api.foundations.getByType, {
        brandId: brandId as Id<'brands'>,
        type: 'platforms',
      });
      const cfg = (platformsFoundation as { config?: unknown } | null)?.config;
      const brandPlatforms =
        cfg &&
        typeof cfg === 'object' &&
        Array.isArray((cfg as { platforms?: unknown }).platforms)
          ? (cfg as ResolveFoundationInput['brandPlatforms'])
          : undefined;
      const resolved = resolveFoundation({
        brandId,
        artifactType,
        outputProfile,
        ...(brandPlatforms ? { brandPlatforms } : {}),
      } as ResolveFoundationInput);
      if (!resolved.ok || !resolved.resolvedDimensions) {
        // FND-03 honesty: no fabricated dimensions — a missing canvas is a gap.
        return new Response(
          JSON.stringify({
            error:
              'No foundation-resolved dimensions for this artifact. ' +
              'Add the canvas to the brand Platforms foundation, or export code.',
          }),
          { status: 422, headers: { 'Content-Type': 'application/json' } },
        );
      }
      resolvedDimensions = resolved.resolvedDimensions;
    } catch (err) {
      console.error('[experience-lab/export] foundation resolve failed:', err);
      return new Response(
        JSON.stringify({ error: 'Failed to resolve foundation dimensions.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }
  }

  // Build the kind-specific dispatch input. For PDF, read the ordered carousel
  // sibling versions (ascending orderIndex, D-11) and re-render each at its
  // resolved dimensions. (When the artifact is not part of a carousel group, the
  // PDF is the single frame.)
  let dispatchInput: DispatchExportInput;
  if (kind === 'code') {
    dispatchInput = {
      kind: 'code',
      code: { compiledBundle: { code: persistedCode }, css: css ?? '' },
    };
  } else if (kind === 'png' || kind === 'jpg') {
    dispatchInput = {
      kind,
      raster: {
        compiledBundle: { code: persistedCode },
        resolvedDimensions: resolvedDimensions!,
        label: outputProfile,
      },
    };
  } else {
    // PDF: compose the ordered carousel siblings one frame per page in ascending
    // orderIndex (D-11). When the artifact belongs to a carousel group, read every
    // sibling's persisted compiled bundle via getCarouselVersions; otherwise the
    // PDF is this single frame. Frames in a carousel share the output profile, so
    // every page renders at the same foundation-resolved dimensions (D-07).
    let frames: PdfFrameJob[] = [];
    const variantGroupId = artifactRow?.variantGroupId;
    if (variantGroupId) {
      try {
        const siblings = (await convex.query(api.experienceRuns.getCarouselVersions, {
          variantGroupId,
        })) as Array<{ orderIndex: number; version: { compiledBundle?: { code?: string } } }>;
        frames = siblings
          .map((s) => ({ orderIndex: s.orderIndex, code: s.version?.compiledBundle?.code }))
          .filter((s): s is { orderIndex: number; code: string } => !!s.code)
          .map((s) => ({
            orderIndex: s.orderIndex,
            raster: {
              compiledBundle: { code: s.code },
              resolvedDimensions: resolvedDimensions!,
              label: `${outputProfile}-${s.orderIndex}`,
            },
          }));
      } catch (err) {
        console.error('[experience-lab/export] getCarouselVersions failed:', err);
        // Fall through to the single-frame PDF below rather than failing the export.
      }
    }
    // No carousel group (or the read failed / yielded nothing) → single-frame PDF.
    if (frames.length === 0) {
      frames = [
        {
          orderIndex: 0,
          raster: {
            compiledBundle: { code: persistedCode },
            resolvedDimensions: resolvedDimensions!,
            label: outputProfile,
          },
        },
      ];
    }
    dispatchInput = { kind: 'pdf', frames };
  }

  // Delegate to the unit-tested pure dispatch (code/PNG/JPG/PDF → emitter).
  let bytes: Buffer | Uint8Array;
  let codePayload: { code: string; css: string } | undefined;
  try {
    const out = await dispatchExport(dispatchInput, emitters);
    if (out.kind === 'code') {
      codePayload = out.payload;
      // The downloadable code export is the TSX + the resolved Jio CSS, joined.
      bytes = Buffer.from(
        `${out.payload.code}\n\n/* ---- Jio CSS ---- */\n${out.payload.css}\n`,
        'utf8',
      );
    } else if (out.kind === 'pdf') {
      bytes = out.payload;
    } else {
      bytes = out.payload.bytes;
    }
  } catch (err) {
    console.error('[experience-lab/export] dispatch/emit failed:', err);
    return new Response(
      JSON.stringify({ error: 'Export generation failed.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Upload bytes to Convex `_storage`, record the append-only export row, and
  // resolve a signed download URL.
  const contentType = CONTENT_TYPE[kind];
  let storageId: Id<'_storage'>;
  let downloadUrl: string | undefined;
  try {
    storageId = await uploadBytes(convex, bytes, contentType);
    await convex.mutation(api.experienceRuns.persistExport, {
      versionId: versionId as Id<'experienceArtifactVersions'>,
      brandId: brandId as Id<'brands'>,
      kind,
      storageId,
      contentType,
    });
    downloadUrl =
      (await convex.query(api.references.getStorageUrl, { storageId })) ?? undefined;
  } catch (err) {
    console.error('[experience-lab/export] storage/persist failed:', err);
    return new Response(
      JSON.stringify({ error: 'Export storage failed.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Surface as the existing `export` card kind (D-13): the download URL + meta.
  return new Response(
    JSON.stringify({
      kind,
      contentType,
      storageId,
      ...(downloadUrl ? { downloadUrl } : {}),
      ...(codePayload ? { code: codePayload.code, css: codePayload.css } : {}),
    }),
    { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } },
  );
}
