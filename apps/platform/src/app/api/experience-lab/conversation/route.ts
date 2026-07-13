/**
 * /api/experience-lab/conversation — the Node route that OWNS the Lab
 * conversation store (D-06 / CHAT-04).
 *
 * The store is built on the zero-dependency `@mastra/core/storage` `memory`
 * domain (see `labConversationStore.ts`). It is instantiated HERE, at the route
 * layer, so `packages/experience-builder-agents` never imports a storage adapter
 * and stays backend-free (Pitfall 2). One module-level store instance is
 * long-lived for the process, so threads survive across requests within a single
 * Node instance (the documented single-instance durability boundary; cross-
 * instance durability is the deferred Convex `experienceChat` upgrade).
 *
 * Runtime: Node — the Mastra storage import requires it; NEVER Edge.
 *
 * Endpoints (single POST, action-dispatched):
 *   - `{ action: 'append', sessionId, brandId?, messages }` — ensure the thread
 *     then append the messages; returns the full rehydrated thread.
 *   - `{ action: 'load',   sessionId }`                     — rehydrate a thread
 *     on reload (D-06d); returns its messages (empty if unknown).
 *
 * Body parsing is `.strict()` (unknown keys rejected) and uses PLAIN
 * `z.string()` / `z.enum()` only — no integer bounds on numbers (Anthropic-safe
 * rule, Pitfall 6); this body carries no numbers, so the rule is trivially met.
 *
 * Threat posture: only `role + text` is persisted (T-04.1-02 — never headers,
 * env, or the API key). `sessionId` is an opaque, non-auth thread key
 * (T-04.1-03 / ASVS V3 partial). There is no filesystem path anywhere, so the
 * path-traversal threat (T-04.1-01) is structurally impossible on this path.
 */

import { z } from 'zod';
import {
  createLabConversationStore,
  type LabConversationStore,
  type LabMessage,
} from '@/app/(platform)/(experience-lab)/_chat/labConversationStore';
import { api } from '@oneui/convex';
import { createRequiredAuthedConvexClient } from '@/lib/convexServer';

// The Mastra storage import requires the Node runtime — declare it explicitly.
export const runtime = 'nodejs';

/** The unsaved prompt-card placeholder brand id — used as the default resource. */
const PLACEHOLDER_BRAND_ID = 'jio';

/**
 * One long-lived store for the process so threads survive across requests within
 * this Node instance (single-instance durability — D-06). A fresh import in a
 * new serverless instance starts empty; cross-instance durability is the
 * deferred Convex `experienceChat` upgrade.
 */
let sharedStore: LabConversationStore | null = null;
function getStore(): LabConversationStore {
  if (!sharedStore) sharedStore = createLabConversationStore();
  return sharedStore;
}

/** A single conversation message on the wire — markup-free, role + text only. */
const MessageInput = z
  .object({
    role: z.enum(['user', 'assistant']),
    text: z.string(),
  })
  .strict();

/** Append messages to (and ensure) a session thread. */
const AppendBody = z
  .object({
    action: z.literal('append'),
    sessionId: z.string(),
    brandId: z.string().optional(),
    messages: z.array(MessageInput),
  })
  .strict();

/** Load (rehydrate) a session thread on reload. */
const LoadBody = z
  .object({
    action: z.literal('load'),
    sessionId: z.string(),
  })
  .strict();

const ConversationBody = z.discriminatedUnion('action', [AppendBody, LoadBody]);

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

async function getScopedThreadId(sessionId: string): Promise<string | Response> {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return json({ error: 'Convex not configured; conversation state is unavailable.' }, 503);
  }

  const convex = await createRequiredAuthedConvexClient(convexUrl);
  if (!convex) return json({ error: 'Authentication required' }, 401);

  const user = await convex.query(api.users.getCurrentUserRecord, {});
  if (!user) return json({ error: 'Authentication required' }, 401);

  return `${user._id}:${sessionId}`;
}

export async function POST(request: Request): Promise<Response> {
  let parsed: unknown;
  try {
    parsed = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const result = ConversationBody.safeParse(parsed);
  if (!result.success) {
    // Return an opaque 400 — never echo Zod issue detail (path/code/shape) to
    // the caller (avoids unnecessary schema disclosure on this internal route).
    return json({ error: 'Invalid conversation request' }, 400);
  }

  const store = getStore();
  const body = result.data;
  const scopedThreadId = await getScopedThreadId(body.sessionId);
  if (scopedThreadId instanceof Response) return scopedThreadId;

  // Wrap ALL store operations so a store-domain throw becomes a controlled 500
  // instead of an unhandled rejection (which would leak a stack trace in dev).
  try {
    if (body.action === 'load') {
      const messages = await store.query({ threadId: scopedThreadId });
      return json({ sessionId: body.sessionId, messages });
    }

    // action === 'append'
    const resourceId = body.brandId ?? PLACEHOLDER_BRAND_ID;
    const messages: LabMessage[] = body.messages.map((m) => ({ role: m.role, text: m.text }));

    // Ensure the thread exists (idempotent re-create is harmless — saveThread
    // upserts), then append. One linear thread per session (D-05).
    await store.createThread({ threadId: scopedThreadId, resourceId });
    await store.saveMessages({ threadId: scopedThreadId, resourceId, messages });

    const restored = await store.query({ threadId: scopedThreadId });
    return json({ sessionId: body.sessionId, messages: restored });
  } catch {
    return json({ error: 'Conversation store error' }, 500);
  }
}
