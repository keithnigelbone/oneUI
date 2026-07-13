/**
 * customFonts.ts
 *
 * Convex functions for managing user-uploaded custom fonts
 * Fonts are stored globally and available across all brands
 */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { requireUser, requirePlatformOwner } from './lib/auth';
import { synthesizeFontFiles, resolveFontFiles, staticWeights } from './lib/fontFiles';

/**
 * Generate a short-lived upload URL for font files
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireUser(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Save a new custom font after upload
 */
export const saveFont = mutation({
  args: {
    name: v.string(),
    familyName: v.string(),
    fileId: v.id('_storage'),
    fileName: v.string(),
    fileFormat: v.union(
      v.literal('ttf'),
      v.literal('otf'),
      v.literal('woff'),
      v.literal('woff2')
    ),
    fileSize: v.number(),
    category: v.union(
      v.literal('variable'),
      v.literal('sans-serif'),
      v.literal('serif'),
      v.literal('mono'),
      v.literal('script')
    ),
    weights: v.array(v.number()),
    isVariable: v.boolean(),
    variableAxes: v.optional(
      v.array(
        v.object({
          tag: v.string(),
          minValue: v.number(),
          maxValue: v.number(),
          defaultValue: v.number(),
        })
      )
    ),
    fallback: v.string(),
  },
  handler: async (ctx, args) => {
    await requirePlatformOwner(ctx);
    const now = Date.now();

    // Get the permanent URL for the uploaded file
    const fileUrl = await ctx.storage.getUrl(args.fileId);
    if (!fileUrl) {
      throw new Error('Failed to get file URL');
    }

    // The file entry for the just-uploaded font. A static file maps to a
    // single weight; a variable file covers a range but records its first
    // weight as the entry's nominal weight.
    const uploadedFile = {
      fileId: args.fileId,
      fileUrl,
      fileName: args.fileName,
      fileFormat: args.fileFormat,
      fileSize: args.fileSize,
      weight: args.weights[0] ?? 400,
    };

    // Check if a font with the same family name already exists.
    const existing = await ctx.db
      .query('customFonts')
      .withIndex('by_family_name', (q) => q.eq('familyName', args.familyName))
      .first();

    if (existing) {
      // Reconstruct the previous file list (synthesises from legacy single-file
      // fields when `files` is absent).
      const prevFiles = synthesizeFontFiles(existing);

      let nextFiles: typeof prevFiles;
      if (args.isVariable || existing.isVariable) {
        // A variable upload — or switching a family to/from variable — replaces
        // the whole family with this single file. Delete every prior file.
        for (const f of prevFiles) {
          try {
            await ctx.storage.delete(f.fileId);
          } catch {
            // File already removed — nothing to clean up.
          }
        }
        nextFiles = [uploadedFile];
      } else {
        // Static merge: replace the file for this weight if one exists, else
        // append. Uploading Regular then Bold builds up [400, 700].
        const sameWeight = prevFiles.find((f) => f.weight === uploadedFile.weight);
        if (sameWeight) {
          try {
            await ctx.storage.delete(sameWeight.fileId);
          } catch {
            // File already removed — nothing to clean up.
          }
        }
        nextFiles = [
          ...prevFiles.filter((f) => f.weight !== uploadedFile.weight),
          uploadedFile,
        ].sort((a, b) => a.weight - b.weight);
      }

      const primary = nextFiles[0];
      const weights = args.isVariable ? args.weights : staticWeights(nextFiles);

      await ctx.db.patch(existing._id, {
        name: args.name,
        fileId: primary.fileId,
        fileUrl: primary.fileUrl,
        fileName: primary.fileName,
        fileFormat: primary.fileFormat,
        fileSize: primary.fileSize,
        files: nextFiles,
        category: args.category,
        weights,
        isVariable: args.isVariable,
        variableAxes: args.variableAxes,
        fallback: args.fallback,
        updatedAt: now,
      });

      return { id: existing._id, updated: true };
    }

    // Create a new family record seeded with this single file.
    const id = await ctx.db.insert('customFonts', {
      name: args.name,
      familyName: args.familyName,
      fileId: uploadedFile.fileId,
      fileUrl: uploadedFile.fileUrl,
      fileName: uploadedFile.fileName,
      fileFormat: uploadedFile.fileFormat,
      fileSize: uploadedFile.fileSize,
      files: [uploadedFile],
      category: args.category,
      weights: args.weights,
      isVariable: args.isVariable,
      variableAxes: args.variableAxes,
      fallback: args.fallback,
      createdAt: now,
      updatedAt: now,
    });

    return { id, updated: false };
  },
});

/**
 * List all custom fonts
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
    const fonts = await ctx.db.query('customFonts').order('desc').collect();

    // Re-resolve every storage URL against THIS deployment. Stored `fileUrl`s
    // embed the deployment host, so a record seeded/copied from another
    // deployment (whose storage files did not come along) would 404. Files
    // whose storage is absent here are dropped so only loadable weights surface
    // instead of throwing NetworkErrors in the font loader.
    return await Promise.all(
      fonts.map(async (font) => {
        const resolved = await resolveFontFiles(ctx, font);

        // Nothing resolvable on this deployment — return the record untouched
        // so the client still attempts the stored URL (the loader tolerates a
        // failure) rather than presenting a font with zero weights.
        if (resolved.length === 0) return font;

        const primary = resolved[0];
        return {
          ...font,
          files: resolved,
          // Keep the variable range intact; recompute the static weight set from
          // the files that actually resolved.
          weights: font.isVariable ? font.weights : staticWeights(resolved),
          fileId: primary.fileId,
          fileUrl: primary.fileUrl,
        };
      })
    );
  },
});

/**
 * Get a single custom font by ID
 */
export const get = query({
  args: {
    id: v.id('customFonts'),
  },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

/**
 * Update font metadata (name, category, fallback)
 */
export const update = mutation({
  args: {
    id: v.id('customFonts'),
    name: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal('variable'),
        v.literal('sans-serif'),
        v.literal('serif'),
        v.literal('mono'),
        v.literal('script')
      )
    ),
    fallback: v.optional(v.string()),
  },
  handler: async (ctx, { id, name, category, fallback }) => {
    await requirePlatformOwner(ctx);
    const existing = await ctx.db.get(id);
    if (!existing) {
      throw new Error('Font not found');
    }

    await ctx.db.patch(id, {
      ...(name !== undefined && { name }),
      ...(category !== undefined && { category }),
      ...(fallback !== undefined && { fallback }),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Delete a custom font and its file from storage
 */
export const remove = mutation({
  args: {
    id: v.id('customFonts'),
  },
  handler: async (ctx, { id }) => {
    await requirePlatformOwner(ctx);
    const font = await ctx.db.get(id);
    if (!font) {
      throw new Error('Font not found');
    }

    // Delete every weight file from storage (falling back to the legacy
    // single file for records predating the `files` array).
    const fileIds =
      font.files && font.files.length > 0
        ? font.files.map((f) => f.fileId)
        : [font.fileId];
    for (const fileId of fileIds) {
      try {
        await ctx.storage.delete(fileId);
      } catch {
        // File already removed — nothing to clean up.
      }
    }

    // Delete the database record
    await ctx.db.delete(id);

    return { success: true };
  },
});

/**
 * Remove a single weight file from a font family. Deletes the whole family
 * (and its record) when the last remaining weight is removed.
 */
export const removeWeight = mutation({
  args: {
    id: v.id('customFonts'),
    weight: v.number(),
  },
  handler: async (ctx, { id, weight }) => {
    await requirePlatformOwner(ctx);
    const font = await ctx.db.get(id);
    if (!font) {
      throw new Error('Font not found');
    }

    // Variable fonts are a single file covering the whole range — there is no
    // per-weight file to remove.
    if (font.isVariable) {
      throw new Error('Cannot remove an individual weight from a variable font');
    }

    const prevFiles = synthesizeFontFiles(font);

    const target = prevFiles.find((f) => f.weight === weight);
    if (!target) {
      return { success: true, removed: false };
    }

    try {
      await ctx.storage.delete(target.fileId);
    } catch {
      // File already removed — nothing to clean up.
    }

    const nextFiles = prevFiles.filter((f) => f.weight !== weight);

    // Last weight removed → drop the whole family record.
    if (nextFiles.length === 0) {
      await ctx.db.delete(id);
      return { success: true, removed: true, deletedFamily: true };
    }

    const primary = nextFiles[0];
    await ctx.db.patch(id, {
      fileId: primary.fileId,
      fileUrl: primary.fileUrl,
      fileName: primary.fileName,
      fileFormat: primary.fileFormat,
      fileSize: primary.fileSize,
      files: nextFiles,
      weights: staticWeights(nextFiles),
      updatedAt: Date.now(),
    });

    return { success: true, removed: true, deletedFamily: false };
  },
});
