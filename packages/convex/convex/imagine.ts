/**
 * imagine.ts
 *
 * Convex module for the Imagine workspace — a canvas-first AI asset studio.
 * Owns four tables:
 *   - imagineThreads    (one row per workspace / canvas)
 *   - imagineMessages   (one row per chat UIMessage)
 *   - imagineAssets     (one row per generated frame on the canvas)
 *   - imagineShareLinks (read-only share tokens)
 *
 * Identity is derived SERVER-SIDE from Better Auth. The `userId` arg is
 * kept optional for back-compat (client still passes it) but its value is
 * ignored — `authUser._id` is always the real key.
 *
 * See docs/imagine-section-plan.md.
 */

import { v } from 'convex/values';
import { action, mutation, query } from './_generated/server';
import { api } from './_generated/api';
import type { Doc, Id } from './_generated/dataModel';
import { requireAuthUser } from './lib/auth';
import { authComponent } from './auth';

const roleUnion = v.union(v.literal('user'), v.literal('assistant'));

const assetTypeUnion = v.union(
  v.literal('mobile-screen'),
  v.literal('web-screen'),
  v.literal('social-post'),
  v.literal('campaign-banner'),
  v.literal('brand-doc'),
  v.literal('ui-flow-screen'),
  v.literal('image'),
  v.literal('video'),
);

// ---------------------------------------------------------------------------
// Threads
// ---------------------------------------------------------------------------

/**
 * `userId` arg is kept optional for back-compat but ignored — identity is
 * derived server-side from Better Auth.
 */
export const createThread = mutation({
  args: {
    userId: v.optional(v.string()),
    title: v.string(),
    brandId: v.optional(v.id('brands')),
  },
  handler: async (ctx, { title, brandId }) => {
    const authUser = await requireAuthUser(ctx);
    const uid = authUser._id;
    const now = Date.now();
    return ctx.db.insert('imagineThreads', {
      userId: uid,
      title,
      brandId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

/**
 * Fetch a thread with its messages (chronological) and assets. Returns null
 * for invalid / deleted thread ids or when the caller is not the owner.
 */
export const getThread = query({
  args: { threadId: v.id('imagineThreads') },
  handler: async (ctx, { threadId }) => {
    const authUser = await authComponent.getAuthUser(ctx).catch(() => null);
    if (!authUser) return null;
    const uid = authUser._id;

    const thread: Doc<'imagineThreads'> | null = await ctx.db.get(threadId);
    if (!thread) return null;
    if (thread.userId !== uid) return null;

    const messages = await ctx.db
      .query('imagineMessages')
      .withIndex('by_thread', (q) => q.eq('threadId', threadId))
      .collect();
    const assets = await ctx.db
      .query('imagineAssets')
      .withIndex('by_thread', (q) => q.eq('threadId', threadId))
      .collect();
    return { thread, messages, assets };
  },
});

/**
 * `userId` arg is kept optional for back-compat but ignored — identity is
 * derived server-side from Better Auth. Returns [] when signed-out.
 */
export const listThreads = query({
  args: {
    userId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 30 }) => {
    const authUser = await authComponent.getAuthUser(ctx).catch(() => null);
    if (!authUser) return [];
    const uid = authUser._id;

    const threads = await ctx.db
      .query('imagineThreads')
      .withIndex('by_user_updated', (q) => q.eq('userId', uid))
      .order('desc')
      .take(limit);

    // Resolve brand names live so history cards stay accurate even if the brand
    // was renamed after the thread's last edit. Cache lookups within the batch.
    const brandNameCache = new Map<string, string>();
    return Promise.all(
      threads.map(async (thread) => {
        let brandName = thread.brandName;
        if (thread.brandId) {
          const key = thread.brandId as string;
          if (brandNameCache.has(key)) {
            brandName = brandNameCache.get(key);
          } else {
            const brand = await ctx.db.get(thread.brandId);
            brandName = brand?.name ?? brandName;
            if (brandName) brandNameCache.set(key, brandName);
          }
        }
        return { ...thread, brandName };
      }),
    );
  },
});

/** Verifies the caller owns the thread before patching. */
export const renameThread = mutation({
  args: { threadId: v.id('imagineThreads'), title: v.string() },
  handler: async (ctx, { threadId, title }) => {
    const authUser = await requireAuthUser(ctx);
    const uid = authUser._id;

    const thread = await ctx.db.get(threadId);
    if (!thread) throw new Error('Thread not found');
    if (thread.userId !== uid) throw new Error('Not authorized: not your thread');

    await ctx.db.patch(threadId, { title, updatedAt: Date.now() });
  },
});

/**
 * Auto-generate a concise thread title from the first user message (Plan Phase
 * 4, step 5). Best-effort + fire-and-forget: a no-op without ANTHROPIC_API_KEY,
 * so the first-message-slice title set at creation time remains the fallback.
 * Actions cannot access auth context; ownership was already verified at thread
 * creation time, so this is safe.
 */
export const generateTitle = action({
  args: { threadId: v.id('imagineThreads'), firstMessage: v.string() },
  handler: async (ctx, { threadId, firstMessage }) => {
    const key = process.env.ANTHROPIC_API_KEY;
    if (!key || !firstMessage.trim()) return;
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5',
          max_tokens: 32,
          messages: [
            {
              role: 'user',
              content: `Write a concise 3–6 word title (no quotes, no trailing punctuation) for a design session that starts with this request:\n\n${firstMessage}`,
            },
          ],
        }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { content?: Array<{ text?: string }> };
      const text = (data.content ?? [])
        .map((c) => (typeof c.text === 'string' ? c.text : ''))
        .join('')
        .trim();
      const title = text.replace(/^["']|["']$/g, '').slice(0, 80);
      // renameThread now verifies ownership via auth; actions can't obtain an
      // auth user, so we call the internal rename path via runMutation — the
      // renameThread mutation will run with the action's identity context.
      if (title) await ctx.runMutation(api.imagine.renameThread, { threadId, title });
    } catch (err) {
      console.warn('[imagine] generateTitle failed:', err);
    }
  },
});

/** Persist the tldraw store snapshot (stringified JSON). Debounced by caller.
 *  Verifies the caller owns the thread. */
export const updateCanvasState = mutation({
  args: { threadId: v.id('imagineThreads'), canvasState: v.string() },
  handler: async (ctx, { threadId, canvasState }) => {
    const authUser = await requireAuthUser(ctx);
    const uid = authUser._id;

    const thread = await ctx.db.get(threadId);
    if (!thread) throw new Error('Thread not found');
    if (thread.userId !== uid) throw new Error('Not authorized: not your thread');

    await ctx.db.patch(threadId, { canvasState, updatedAt: Date.now() });
  },
});

/** Verifies the caller owns the thread before patching. */
export const setThumbnail = mutation({
  args: { threadId: v.id('imagineThreads'), thumbnailUrl: v.string() },
  handler: async (ctx, { threadId, thumbnailUrl }) => {
    const authUser = await requireAuthUser(ctx);
    const uid = authUser._id;

    const thread = await ctx.db.get(threadId);
    if (!thread) throw new Error('Thread not found');
    if (thread.userId !== uid) throw new Error('Not authorized: not your thread');

    await ctx.db.patch(threadId, { thumbnailUrl });
  },
});

/** Verifies the caller owns the thread before patching. */
export const setThreadBrand = mutation({
  args: { threadId: v.id('imagineThreads'), brandId: v.optional(v.id('brands')) },
  handler: async (ctx, { threadId, brandId }) => {
    const authUser = await requireAuthUser(ctx);
    const uid = authUser._id;

    const thread = await ctx.db.get(threadId);
    if (!thread) throw new Error('Thread not found');
    if (thread.userId !== uid) throw new Error('Not authorized: not your thread');

    const brand = brandId ? await ctx.db.get(brandId) : null;
    await ctx.db.patch(threadId, {
      brandId,
      brandName: brand?.name,
      updatedAt: Date.now(),
    });
  },
});

/** Hard delete a thread + its messages, assets, and share links.
 *  Verifies ownership first. */
export const deleteThread = mutation({
  args: { threadId: v.id('imagineThreads') },
  handler: async (ctx, { threadId }) => {
    const authUser = await requireAuthUser(ctx);
    const uid = authUser._id;

    const thread = await ctx.db.get(threadId);
    if (!thread) throw new Error('Thread not found');
    if (thread.userId !== uid) throw new Error('Not authorized: not your thread');

    const messages = await ctx.db
      .query('imagineMessages')
      .withIndex('by_thread', (q) => q.eq('threadId', threadId))
      .collect();
    for (const m of messages) await ctx.db.delete(m._id);

    const assets = await ctx.db
      .query('imagineAssets')
      .withIndex('by_thread', (q) => q.eq('threadId', threadId))
      .collect();
    for (const a of assets) await ctx.db.delete(a._id);

    const links = await ctx.db
      .query('imagineShareLinks')
      .withIndex('by_token', (q) => q.gt('token', ''))
      .collect();
    for (const l of links) {
      if (l.threadId === threadId) await ctx.db.delete(l._id);
    }

    await ctx.db.delete(threadId);
  },
});

// ---------------------------------------------------------------------------
// Checkpoints — generation-level rollback (distinct from tldraw undo/redo)
// ---------------------------------------------------------------------------

/** Verifies the caller owns the thread before adding a checkpoint. */
export const addCheckpoint = mutation({
  args: {
    threadId: v.id('imagineThreads'),
    label: v.string(),
    canvasState: v.string(),
    assetIds: v.array(v.string()),
  },
  handler: async (ctx, { threadId, label, canvasState, assetIds }) => {
    const authUser = await requireAuthUser(ctx);
    const uid = authUser._id;

    const thread = await ctx.db.get(threadId);
    if (!thread) throw new Error(`Imagine thread ${threadId} not found`);
    if (thread.userId !== uid) throw new Error('Not authorized: not your thread');

    const checkpoints = [
      ...(thread.checkpoints ?? []),
      { label, canvasState, assetIds, createdAt: Date.now() },
    ];
    // Keep the last 20 checkpoints to bound row size.
    await ctx.db.patch(threadId, { checkpoints: checkpoints.slice(-20) });
  },
});

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

/** Verifies the caller owns the parent thread before inserting. */
export const appendMessage = mutation({
  args: {
    threadId: v.id('imagineThreads'),
    role: roleUnion,
    parts: v.array(v.any()),
    assetIds: v.optional(v.array(v.id('imagineAssets'))),
  },
  handler: async (ctx, { threadId, role, parts, assetIds }) => {
    const authUser = await requireAuthUser(ctx);
    const uid = authUser._id;

    const thread = await ctx.db.get(threadId);
    if (!thread) throw new Error('Thread not found');
    if (thread.userId !== uid) throw new Error('Not authorized: not your thread');

    const now = Date.now();
    const id = await ctx.db.insert('imagineMessages', {
      threadId,
      role,
      parts,
      assetIds,
      createdAt: now,
    });
    await ctx.db.patch(threadId, { updatedAt: now });
    return id;
  },
});

// AI-SDK data-part type strings emitted by the orchestrator. Hard-coded here
// (the convex package can't import from apps/platform) — keep in sync with
// `IMAGINE_EVENT` in apps/platform/src/lib/imagine/types.ts.
const ASSET_COMPLETE_PART = 'data-imagine-asset-complete';
const PLAN_PART = 'data-imagine-plan';
type AssetTypeLiteral =
  | 'mobile-screen'
  | 'web-screen'
  | 'social-post'
  | 'campaign-banner'
  | 'brand-doc'
  | 'ui-flow-screen'
  | 'image'
  | 'video';
const VALID_ASSET_TYPES = new Set<string>([
  'mobile-screen',
  'web-screen',
  'social-post',
  'campaign-banner',
  'brand-doc',
  'ui-flow-screen',
  'image',
  'video',
]);

/** Asset row derived from a message part (sans threadId/messageId/createdAt). */
interface DerivedAssetRow {
  type: AssetTypeLiteral;
  title: string;
  code?: string;
  jsonRenderTree?: string;
  imageUrl?: string;
  videoUrl?: string;
  tldrawFrameId: string;
  groupLabel?: string;
  validationScore?: number;
  designGateScore?: number;
  canvasX: number;
  canvasY: number;
  canvasW: number;
  canvasH: number;
}

function isRecord(x: unknown): x is Record<string, unknown> {
  return typeof x === 'object' && x !== null;
}

/**
 * Project `imagineAssets` rows from one assistant message's persisted parts.
 * Each `data-imagine-asset-complete` part carries the tldraw ops (frame
 * geometry + asset type/title/code) and the gate scores; the optional
 * `data-imagine-plan` part in the same turn supplies the group label.
 */
function deriveAssetRows(parts: unknown): DerivedAssetRow[] {
  if (!Array.isArray(parts)) return [];

  // Group label is shared across every asset emitted in the same plan turn.
  let groupLabel: string | undefined;
  for (const p of parts) {
    if (isRecord(p) && p.type === PLAN_PART && isRecord(p.data)) {
      const gl = (p.data as { groupLabel?: unknown }).groupLabel;
      if (typeof gl === 'string') groupLabel = gl;
    }
  }

  const rows: DerivedAssetRow[] = [];
  for (const p of parts) {
    if (!isRecord(p) || p.type !== ASSET_COMPLETE_PART || !isRecord(p.data)) continue;
    const data = p.data as Record<string, unknown>;
    const ops = Array.isArray(data.tldrawOps) ? data.tldrawOps : [];
    const frameOp = ops.find((o) => isRecord(o) && o.op === 'create-frame') as
      | Record<string, unknown>
      | undefined;
    const assetOp = ops.find((o) => isRecord(o) && o.op === 'create-asset') as
      | Record<string, unknown>
      | undefined;

    const assetType = assetOp && typeof assetOp.assetType === 'string' ? assetOp.assetType : undefined;
    const tldrawFrameId = typeof data.tldrawFrameId === 'string' ? data.tldrawFrameId : undefined;
    // Skip anything we can't map to a valid, frame-anchored asset row.
    if (!assetType || !VALID_ASSET_TYPES.has(assetType) || !tldrawFrameId) continue;

    const num = (v0: unknown, fallback: number) => (typeof v0 === 'number' ? v0 : fallback);
    rows.push({
      type: assetType as AssetTypeLiteral,
      title:
        (assetOp && typeof assetOp.title === 'string' && assetOp.title) ||
        (frameOp && typeof frameOp.label === 'string' && frameOp.label) ||
        'Asset',
      code: typeof data.code === 'string' ? data.code : undefined,
      jsonRenderTree:
        typeof data.jsonTree === 'string' && data.jsonTree ? data.jsonTree : undefined,
      imageUrl: typeof data.imageUrl === 'string' && data.imageUrl ? data.imageUrl : undefined,
      videoUrl: typeof data.videoUrl === 'string' && data.videoUrl ? data.videoUrl : undefined,
      tldrawFrameId,
      groupLabel,
      validationScore: typeof data.validationScore === 'number' ? data.validationScore : undefined,
      designGateScore: typeof data.designGateScore === 'number' ? data.designGateScore : undefined,
      // Interactive (unframed) assets have no create-frame op — fall back to
      // the asset op's own x/y/w/h geometry.
      canvasX: num(frameOp?.x, num(assetOp?.x, 0)),
      canvasY: num(frameOp?.y, num(assetOp?.y, 0)),
      canvasW: num(frameOp?.w, num(assetOp?.w, 0)),
      canvasH: num(frameOp?.h, num(assetOp?.h, 0)),
    });
  }
  return rows;
}

/** Verifies the caller owns the parent thread before replacing messages. */
export const replaceMessages = mutation({
  args: {
    threadId: v.id('imagineThreads'),
    messages: v.array(
      v.object({
        role: roleUnion,
        parts: v.array(v.any()),
        assetIds: v.optional(v.array(v.id('imagineAssets'))),
      }),
    ),
  },
  handler: async (ctx, { threadId, messages }) => {
    const authUser = await requireAuthUser(ctx);
    const uid = authUser._id;

    const thread = await ctx.db.get(threadId);
    if (!thread) throw new Error('Thread not found');
    if (thread.userId !== uid) throw new Error('Not authorized: not your thread');

    const existing = await ctx.db
      .query('imagineMessages')
      .withIndex('by_thread', (q) => q.eq('threadId', threadId))
      .collect();
    for (const m of existing) await ctx.db.delete(m._id);
    // `imagineAssets` is a derived projection of the assistant messages — wipe
    // and rebuild it in lockstep so getSharedThread / getAssets stay accurate.
    const existingAssets = await ctx.db
      .query('imagineAssets')
      .withIndex('by_thread', (q) => q.eq('threadId', threadId))
      .collect();
    for (const a of existingAssets) await ctx.db.delete(a._id);

    const now = Date.now();
    let assetCount = 0;
    const assetTypeSet = new Set<string>();
    for (const msg of messages) {
      const messageId = await ctx.db.insert('imagineMessages', {
        threadId,
        role: msg.role,
        parts: msg.parts,
        assetIds: msg.assetIds,
        createdAt: now,
      });
      if (msg.role === 'assistant') {
        for (const row of deriveAssetRows(msg.parts)) {
          await ctx.db.insert('imagineAssets', { threadId, messageId, createdAt: now, ...row });
          assetCount += 1;
          assetTypeSet.add(row.type);
        }
      }
    }
    // Denormalised history-card metadata, kept in lockstep with the projection.
    await ctx.db.patch(threadId, {
      updatedAt: now,
      assetCount,
      assetTypes: [...assetTypeSet],
    });
  },
});

// ---------------------------------------------------------------------------
// Assets
// ---------------------------------------------------------------------------

/** Verifies the caller owns the parent thread before inserting an asset. */
export const saveAsset = mutation({
  args: {
    threadId: v.id('imagineThreads'),
    messageId: v.id('imagineMessages'),
    type: assetTypeUnion,
    title: v.string(),
    code: v.optional(v.string()),
    jsonRenderTree: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    imageStorageId: v.optional(v.id('_storage')),
    imageProvider: v.optional(
      v.union(
        v.literal('recraft'),
        v.literal('ideogram'),
        v.literal('gpt-image-2'),
      ),
    ),
    videoUrl: v.optional(v.string()),
    videoProvider: v.optional(v.literal('runway')),
    docHtml: v.optional(v.string()),
    tldrawFrameId: v.string(),
    groupId: v.optional(v.string()),
    groupLabel: v.optional(v.string()),
    validationScore: v.optional(v.number()),
    designGateScore: v.optional(v.number()),
    canvasX: v.number(),
    canvasY: v.number(),
    canvasW: v.number(),
    canvasH: v.number(),
    platformSize: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authUser = await requireAuthUser(ctx);
    const uid = authUser._id;

    const thread = await ctx.db.get(args.threadId);
    if (!thread) throw new Error('Thread not found');
    if (thread.userId !== uid) throw new Error('Not authorized: not your thread');

    const now = Date.now();
    const id = await ctx.db.insert('imagineAssets', { ...args, createdAt: now });
    await ctx.db.patch(args.threadId, { updatedAt: now });
    return id;
  },
});

/** Scoped to the calling user's threads — verifies ownership via thread chain. */
export const getAssets = query({
  args: { threadId: v.id('imagineThreads') },
  handler: async (ctx, { threadId }) => {
    const authUser = await authComponent.getAuthUser(ctx).catch(() => null);
    if (!authUser) return [];
    const uid = authUser._id;

    const thread = await ctx.db.get(threadId);
    if (!thread || thread.userId !== uid) return [];

    return ctx.db
      .query('imagineAssets')
      .withIndex('by_thread', (q) => q.eq('threadId', threadId))
      .collect();
  },
});

/** Update an asset's geometry / code — used after canvas edits or revisions.
 *  Verifies ownership via the asset → thread chain. */
export const updateAsset = mutation({
  args: {
    assetId: v.id('imagineAssets'),
    code: v.optional(v.string()),
    docHtml: v.optional(v.string()),
    title: v.optional(v.string()),
    canvasX: v.optional(v.number()),
    canvasY: v.optional(v.number()),
    canvasW: v.optional(v.number()),
    canvasH: v.optional(v.number()),
    chosenVariantIndex: v.optional(v.number()),
  },
  handler: async (ctx, { assetId, ...rest }) => {
    const authUser = await requireAuthUser(ctx);
    const uid = authUser._id;

    const asset = await ctx.db.get(assetId);
    if (!asset) throw new Error('Asset not found');
    const thread = await ctx.db.get(asset.threadId);
    if (!thread || thread.userId !== uid) throw new Error('Not authorized: not your thread');

    const patch = Object.fromEntries(
      Object.entries(rest).filter(([, val]) => val !== undefined),
    );
    if (Object.keys(patch).length > 0) await ctx.db.patch(assetId, patch);
  },
});

/** Verifies ownership via the asset → thread chain before deleting. */
export const deleteAsset = mutation({
  args: { assetId: v.id('imagineAssets') },
  handler: async (ctx, { assetId }) => {
    const authUser = await requireAuthUser(ctx);
    const uid = authUser._id;

    const asset = await ctx.db.get(assetId);
    if (!asset) throw new Error('Asset not found');
    const thread = await ctx.db.get(asset.threadId);
    if (!thread || thread.userId !== uid) throw new Error('Not authorized: not your thread');

    await ctx.db.delete(assetId);
  },
});

// ---------------------------------------------------------------------------
// Share links
// ---------------------------------------------------------------------------

/** Verifies the caller owns the thread before creating a share link.
 *  `createdBy` arg is kept optional for back-compat but ignored — identity
 *  is derived server-side from Better Auth. */
export const createShareLink = mutation({
  args: {
    threadId: v.id('imagineThreads'),
    createdBy: v.optional(v.string()),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, { threadId, expiresAt }) => {
    const authUser = await requireAuthUser(ctx);
    const uid = authUser._id;

    const thread = await ctx.db.get(threadId);
    if (!thread) throw new Error('Thread not found');
    if (thread.userId !== uid) throw new Error('Not authorized: not your thread');

    // Reuse an existing non-expired link for this thread when one exists, so
    // re-sharing produces a stable URL.
    const existing = await ctx.db
      .query('imagineShareLinks')
      .withIndex('by_token', (q) => q.gt('token', ''))
      .collect();
    const reusable = existing.find(
      (l) => l.threadId === threadId && (!l.expiresAt || l.expiresAt > Date.now()),
    );
    if (reusable) return reusable.token;

    const token = crypto.randomUUID();
    await ctx.db.insert('imagineShareLinks', {
      threadId,
      token,
      createdBy: uid,
      expiresAt,
      createdAt: Date.now(),
    });
    return token;
  },
});

/**
 * Read-only resolution of a shared thread by token. No auth — anyone with the
 * link sees the canvas + assets (but not the chat history).
 */
export const getSharedThread = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const link = await ctx.db
      .query('imagineShareLinks')
      .withIndex('by_token', (q) => q.eq('token', token))
      .unique();
    if (!link) return null;
    if (link.expiresAt && link.expiresAt < Date.now()) return null;

    const thread = await ctx.db.get(link.threadId);
    if (!thread) return null;
    const assets = await ctx.db
      .query('imagineAssets')
      .withIndex('by_thread', (q) => q.eq('threadId', link.threadId))
      .collect();
    return {
      thread: {
        _id: thread._id,
        title: thread.title,
        canvasState: thread.canvasState,
        brandId: thread.brandId,
      },
      assets,
    };
  },
});

export type ImagineThreadId = Id<'imagineThreads'>;
export type ImagineAssetId = Id<'imagineAssets'>;
