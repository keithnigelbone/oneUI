/**
 * labConversationStore.ts — net-new D-06 conversation persistence (CHAT-04).
 *
 * The chat-first Lab keeps ONE linear conversation thread per session (D-05) and
 * must rehydrate it on reload (D-06d). This is the only genuinely new
 * persistence pattern in the phase and the only one with no in-repo analog, so
 * it is isolated here behind a small, Lab-owned facade.
 *
 * LOCKED DEFAULT (RESEARCH.md § Open Questions (RESOLVED) Q1, confirmed by a
 * Task-2 spike): build on the ZERO-DEPENDENCY path already shipped by the pinned
 * `@mastra/core@1.37.1` — `@mastra/core/storage`'s `InMemoryStore` exposes a
 * `memory` storage domain (`saveThread` / `getThreadById` / `saveMessages` /
 * `listMessages` / `listThreads`) WITHOUT any `MastraMemory` abstract
 * instantiation or Mastra `Agent` binding (validates assumption A2). NO new
 * package install is required; the spike round-tripped messages + isolated
 * threads cleanly, so the documented Convex `experienceChat` fallback (D-06) was
 * NOT taken.
 *
 * Durability boundary (RESEARCH.md / output spec): `InMemoryStore` is
 * process-local — durable only for the lifetime of a single Node process.
 * `@mastra/core/storage`'s `FilesystemStore` implements ONLY the 7 editor
 * domains (agents/promptBlocks/…), NOT the `memory` domain, so it cannot back
 * conversation messages — the plan's "FilesystemStore for durability" note does
 * not hold against this version. Cross-process / multi-instance durability is a
 * deferred upgrade (the Convex `experienceChat` fallback, or a real DB-backed
 * Mastra store such as `@mastra/libsql` gated behind the package-legitimacy
 * checkpoint). The store therefore accepts an injectable backing store so the
 * route owns a single long-lived instance and tests own an ephemeral one.
 *
 * Threat posture:
 *   - T-04.1-02: only structured `role + text` is persisted — never request
 *     headers, env, or the ANTHROPIC_API_KEY.
 *   - T-04.1-03: `query` is scoped by `threadId`; thread A cannot read thread B.
 *   - T-04.1-01: there is NO filesystem path here at all — the store cannot be
 *     pointed at a request-derived directory (path-traversal is structurally
 *     impossible for the in-memory path).
 *
 * Pitfall 2 (backend-free agents): this lives under `apps/platform`, NOT under
 * `packages/experience-builder-agents`, which must never host a storage import.
 */

import { InMemoryStore } from '@mastra/core/storage';
import type { MastraDBMessage } from '@mastra/core/memory';

/** A Lab conversation role. Mirrors the chat turn roles we persist. */
export type LabMessageRole = 'user' | 'assistant';

/** The minimal, markup-free message the Lab persists + restores. */
export interface LabMessage {
  role: LabMessageRole;
  text: string;
}

/** A persisted thread descriptor (for `listThreads` brand scoping). */
export interface LabThreadInfo {
  threadId: string;
  resourceId: string;
}

export interface CreateThreadArgs {
  threadId: string;
  /** The brand id — the Mastra `resourceId`, for future brand scoping. */
  resourceId: string;
  title?: string;
}

export interface SaveMessagesArgs {
  threadId: string;
  resourceId: string;
  messages: LabMessage[];
}

export interface QueryArgs {
  threadId: string;
}

export interface ListThreadsArgs {
  resourceId: string;
}

export interface LabConversationStore {
  createThread(args: CreateThreadArgs): Promise<void>;
  saveMessages(args: SaveMessagesArgs): Promise<void>;
  query(args: QueryArgs): Promise<LabMessage[]>;
  listThreads(args: ListThreadsArgs): Promise<LabThreadInfo[]>;
}

export interface CreateLabConversationStoreOptions {
  /**
   * The backing Mastra composite store. Defaults to a fresh `InMemoryStore`.
   * The Node route injects ONE long-lived instance so threads survive across
   * requests within the process; tests inject an ephemeral one for isolation.
   */
  backingStore?: InMemoryStore;
}

/** Extract plain text from a persisted `MastraDBMessage` content payload. */
function messageText(message: MastraDBMessage): string {
  const parts = message.content?.parts;
  if (Array.isArray(parts)) {
    return parts
      .map((part) => (part && part.type === 'text' ? part.text : ''))
      .join('');
  }
  // Fallback for any non-V2 content shape — never throw on restore.
  const raw = (message.content as { content?: unknown } | undefined)?.content;
  return typeof raw === 'string' ? raw : '';
}

/** Monotonic-ish unique id for a persisted message (no external dep). */
function newMessageId(): string {
  return `lab-msg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Create a Lab conversation store over the zero-dependency `@mastra/core`
 * `memory` storage domain. Keyed by `threadId` (the Lab sessionId) with
 * `resourceId = brandId` for future brand scoping.
 */
export function createLabConversationStore(
  options: CreateLabConversationStoreOptions = {},
): LabConversationStore {
  const backingStore = options.backingStore ?? new InMemoryStore({ id: 'lab-conversation' });

  /** Resolve the `memory` storage domain from the composite store. */
  async function memory() {
    const domain = await backingStore.getStore('memory');
    if (!domain) {
      throw new Error(
        'Lab conversation store: the backing store does not expose a `memory` domain.',
      );
    }
    return domain;
  }

  return {
    async createThread({ threadId, resourceId, title }) {
      const mem = await memory();
      const now = new Date();
      await mem.saveThread({
        thread: {
          id: threadId,
          resourceId,
          ...(title ? { title } : {}),
          createdAt: now,
          updatedAt: now,
        },
      });
    },

    async saveMessages({ threadId, resourceId, messages }) {
      if (messages.length === 0) return;
      const mem = await memory();
      // Stable, ordered createdAt so restore preserves authoring order even
      // within a single sub-millisecond batch.
      const base = Date.now();
      const dbMessages: MastraDBMessage[] = messages.map((m, index) => ({
        id: newMessageId(),
        role: m.role,
        threadId,
        resourceId,
        createdAt: new Date(base + index),
        content: { format: 2, parts: [{ type: 'text', text: m.text }] },
      }));
      await mem.saveMessages({ messages: dbMessages });
    },

    async query({ threadId }) {
      const mem = await memory();
      // Scope strictly by threadId — thread ownership boundary (T-04.1-03).
      const out = await mem.listMessages({ threadId, perPage: false });
      return out.messages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        text: messageText(m),
      }));
    },

    async listThreads({ resourceId }) {
      const mem = await memory();
      const out = await mem.listThreads({ filter: { resourceId }, perPage: false });
      return out.threads.map((t) => ({ threadId: t.id, resourceId: t.resourceId }));
    },
  };
}
