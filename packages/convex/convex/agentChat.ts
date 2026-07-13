/**
 * agentChat.ts
 *
 * Convex module for the global agent's conversation persistence. Owns:
 *   - agentThreads  (one row per conversation)
 *   - agentMessages (one row per UIMessage, ordered by _creationTime)
 *
 * Identity is derived SERVER-SIDE from Better Auth. The `userId` arg is
 * kept optional for back-compat (client still passes it) but its value is
 * ignored — `authUser._id` is always the real key.
 *
 * Thread mode is an open string so future agents (voice, design, etc.)
 * can add their own conversations without migration.
 */

import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';
import { requireAuthUser } from './lib/auth';
import { authComponent } from './auth';

const roleUnion = v.union(
  v.literal('user'),
  v.literal('assistant'),
  v.literal('system'),
);

const modeUnion = v.union(
  v.literal('home'),
  v.literal('build'),
  v.literal('system'),
  v.literal('agents'),
);

// ---------------------------------------------------------------------------
// Threads
// ---------------------------------------------------------------------------

/**
 * Create a new thread. Returns the thread id so the client can navigate
 * straight to `/chat/[threadId]`. `brandId` is optional so future surfaces
 * (like a brand-agnostic global help chat) don't need to fabricate one.
 *
 * `userId` arg is kept optional for back-compat but ignored — identity is
 * derived server-side from Better Auth.
 */
export const createThread = mutation({
  args: {
    userId: v.optional(v.string()),
    title: v.string(),
    mode: modeUnion,
    brandId: v.optional(v.id('brands')),
  },
  handler: async (ctx, { title, mode, brandId }) => {
    const authUser = await requireAuthUser(ctx);
    const uid = authUser._id;
    const now = Date.now();
    const id = await ctx.db.insert('agentThreads', {
      userId: uid,
      title,
      mode,
      brandId,
      createdAt: now,
      updatedAt: now,
    });
    return id;
  },
});

/**
 * Fetch a single thread + its messages in chronological order. Returns
 * null when the thread doesn't exist so the client can handle deleted /
 * invalid links gracefully. Also returns null when the caller is not the
 * thread owner.
 */
export const getThread = query({
  args: { threadId: v.id('agentThreads') },
  handler: async (ctx, { threadId }) => {
    const authUser = await authComponent.getAuthUser(ctx).catch(() => null);
    if (!authUser) return null;
    const uid = authUser._id;

    const thread: Doc<'agentThreads'> | null = await ctx.db.get(threadId);
    if (!thread) return null;
    if (thread.userId !== uid) return null;

    const messages = await ctx.db
      .query('agentMessages')
      .withIndex('by_thread', (q) => q.eq('threadId', threadId))
      .collect();
    return {
      thread,
      messages,
    };
  },
});

/**
 * List a user's threads, most-recently-updated first. Uses the
 * `by_user_updated` compound index so pagination stays O(limit).
 *
 * `userId` arg is kept optional for back-compat but ignored — identity is
 * derived server-side from Better Auth. Returns [] when signed-out.
 */
export const listThreads = query({
  args: {
    userId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 20 }) => {
    const authUser = await authComponent.getAuthUser(ctx).catch(() => null);
    if (!authUser) return [];
    const uid = authUser._id;

    const rows = await ctx.db
      .query('agentThreads')
      .withIndex('by_user_updated', (q) => q.eq('userId', uid))
      .order('desc')
      .take(limit);
    return rows;
  },
});

/** Rename a thread — used when the first assistant reply lands and the
 *  client wants to replace the seeded title with something specific.
 *  Verifies the caller owns the thread before patching. */
export const renameThread = mutation({
  args: {
    threadId: v.id('agentThreads'),
    title: v.string(),
  },
  handler: async (ctx, { threadId, title }) => {
    const authUser = await requireAuthUser(ctx);
    const uid = authUser._id;

    const thread = await ctx.db.get(threadId);
    if (!thread) throw new Error('Thread not found');
    if (thread.userId !== uid) throw new Error('Not authorized: not your thread');

    await ctx.db.patch(threadId, { title, updatedAt: Date.now() });
  },
});

/** Hard delete a thread + all of its messages. Verifies ownership first. */
export const deleteThread = mutation({
  args: { threadId: v.id('agentThreads') },
  handler: async (ctx, { threadId }) => {
    const authUser = await requireAuthUser(ctx);
    const uid = authUser._id;

    const thread = await ctx.db.get(threadId);
    if (!thread) throw new Error('Thread not found');
    if (thread.userId !== uid) throw new Error('Not authorized: not your thread');

    const messages = await ctx.db
      .query('agentMessages')
      .withIndex('by_thread', (q) => q.eq('threadId', threadId))
      .collect();
    for (const m of messages) {
      await ctx.db.delete(m._id);
    }
    await ctx.db.delete(threadId);
  },
});

// ---------------------------------------------------------------------------
// Messages
// ---------------------------------------------------------------------------

/**
 * Append a message to a thread. `parts` is the raw UIMessage.parts array
 * so tool calls round-trip losslessly. Caller bumps `thread.updatedAt`
 * here as a side effect so "recent threads" ordering stays accurate
 * without a second mutation. Verifies the caller owns the thread.
 */
export const appendMessage = mutation({
  args: {
    threadId: v.id('agentThreads'),
    role: roleUnion,
    parts: v.array(v.any()),
  },
  handler: async (ctx, { threadId, role, parts }) => {
    const authUser = await requireAuthUser(ctx);
    const uid = authUser._id;

    const thread = await ctx.db.get(threadId);
    if (!thread) throw new Error('Thread not found');
    if (thread.userId !== uid) throw new Error('Not authorized: not your thread');

    const now = Date.now();
    const id = await ctx.db.insert('agentMessages', {
      threadId,
      role,
      parts,
      createdAt: now,
    });
    await ctx.db.patch(threadId, { updatedAt: now });
    return id;
  },
});

/**
 * Replace the full message list for a thread — used by the home chat when
 * `useChat.messages` changes, so persistence stays in sync with the SDK's
 * in-memory state without requiring fine-grained diffing.
 *
 * Deletes existing messages then re-inserts. Cheap at our scale (threads
 * are small; tens of messages at most) and keeps the caller trivial.
 * Verifies the caller owns the thread.
 */
export const replaceMessages = mutation({
  args: {
    threadId: v.id('agentThreads'),
    messages: v.array(
      v.object({
        role: roleUnion,
        parts: v.array(v.any()),
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
      .query('agentMessages')
      .withIndex('by_thread', (q) => q.eq('threadId', threadId))
      .collect();
    for (const m of existing) {
      await ctx.db.delete(m._id);
    }
    const now = Date.now();
    for (const msg of messages) {
      await ctx.db.insert('agentMessages', {
        threadId,
        role: msg.role,
        parts: msg.parts,
        createdAt: now,
      });
    }
    await ctx.db.patch(threadId, { updatedAt: now });
  },
});

/**
 * Fork a thread at a specific message. Creates a new thread that copies
 * every message up to and including `fromMessageId`, then lets the user
 * continue from there — useful for "try a different angle" without
 * losing the original conversation.
 *
 * `newMode` is optional; when omitted, the fork inherits the source
 * thread's mode. Title defaults to "{original title} (fork)" and can
 * be renamed later via `renameThread`. Verifies the caller owns the source thread.
 */
export const forkThread = mutation({
  args: {
    threadId: v.id('agentThreads'),
    fromMessageId: v.id('agentMessages'),
    newMode: v.optional(modeUnion),
    title: v.optional(v.string()),
  },
  handler: async (ctx, { threadId, fromMessageId, newMode, title }) => {
    const authUser = await requireAuthUser(ctx);
    const uid = authUser._id;

    const sourceThread: Doc<'agentThreads'> | null = await ctx.db.get(threadId);
    if (!sourceThread) {
      throw new Error(`Source thread ${threadId} not found`);
    }
    if (sourceThread.userId !== uid) {
      throw new Error('Not authorized: not your thread');
    }

    const pivot: Doc<'agentMessages'> | null = await ctx.db.get(fromMessageId);
    if (!pivot || pivot.threadId !== threadId) {
      throw new Error(`Pivot message ${fromMessageId} not in thread ${threadId}`);
    }

    // Collect messages in chronological order (the `by_thread` index is
    // ordered by the implicit creation time). Copy up to and including
    // the pivot's creation time.
    const allMessages = await ctx.db
      .query('agentMessages')
      .withIndex('by_thread', (q) => q.eq('threadId', threadId))
      .collect();
    const pivotCreatedAt = pivot.createdAt;
    const toCopy = allMessages.filter((m) => m.createdAt <= pivotCreatedAt);

    const now = Date.now();
    const forkedTitle = title ?? `${sourceThread.title} (fork)`;
    const forkedMode = newMode ?? sourceThread.mode;

    const newThreadId = await ctx.db.insert('agentThreads', {
      userId: uid,
      title: forkedTitle,
      mode: forkedMode,
      brandId: sourceThread.brandId,
      createdAt: now,
      updatedAt: now,
    });

    // Preserve ordering by writing sequentially — `by_thread` will use
    // Convex's insertion order, which matches our iteration order here.
    for (const msg of toCopy) {
      await ctx.db.insert('agentMessages', {
        threadId: newThreadId,
        role: msg.role,
        parts: msg.parts,
        createdAt: now,
      });
    }

    return newThreadId;
  },
});

export type AgentThreadId = Id<'agentThreads'>;
