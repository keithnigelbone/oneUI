/**
 * labConversation.test.ts — CHAT-04 conversation-store round-trip + reload + isolation.
 *
 * Proves the net-new D-06 persistence pattern: a reload-safe, thread-scoped
 * conversation store built on the LOCKED zero-dependency path —
 * `@mastra/core/storage` `InMemoryStore` → its `memory` domain — with NO new
 * package install and NO Mastra `Agent` binding (validates assumption A2).
 *
 * Tests:
 *   1. (CHAT-04 round-trip) createThread → saveMessages → query returns the two
 *      messages in order.
 *   2. (CHAT-04 reload, D-06d) a second store instance over the SAME backing
 *      store + threadId rehydrates the previously saved messages.
 *   3. (T-04.1-03 isolation) query for thread A never returns thread B's
 *      messages (thread-ownership boundary).
 *
 * No `ai`/`@ai-sdk` import (the Lab single-`ai` gate applies to tests too).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryStore } from '@mastra/core/storage';
import { createLabConversationStore } from '../_chat/labConversationStore';

const BRAND_A = 'brand-A';
const BRAND_B = 'brand-B';
const THREAD_A = 'sess-A';
const THREAD_B = 'sess-B';

describe('labConversationStore — CHAT-04 thread round-trip + reload + isolation (D-06)', () => {
  let backing: InMemoryStore;

  beforeEach(() => {
    backing = new InMemoryStore({ id: 'lab-conversation-test' });
  });

  it('round-trips: createThread → saveMessages → query returns the two messages in order', async () => {
    const store = createLabConversationStore({ backingStore: backing });

    await store.createThread({ threadId: THREAD_A, resourceId: BRAND_A });
    await store.saveMessages({
      threadId: THREAD_A,
      resourceId: BRAND_A,
      messages: [
        { role: 'user', text: 'Generate a hero section' },
        { role: 'assistant', text: 'Here is a Jio DS hero.' },
      ],
    });

    const restored = await store.query({ threadId: THREAD_A });
    expect(restored.map((m) => m.role)).toEqual(['user', 'assistant']);
    expect(restored.map((m) => m.text)).toEqual([
      'Generate a hero section',
      'Here is a Jio DS hero.',
    ]);
  });

  it('reload-safe (D-06d): a second store instance over the same backing store rehydrates the thread', async () => {
    const writer = createLabConversationStore({ backingStore: backing });
    await writer.createThread({ threadId: THREAD_A, resourceId: BRAND_A });
    await writer.saveMessages({
      threadId: THREAD_A,
      resourceId: BRAND_A,
      messages: [
        { role: 'user', text: 'first' },
        { role: 'assistant', text: 'second' },
      ],
    });

    // Simulate a reload: a brand-new store instance reading the same backing store.
    const reader = createLabConversationStore({ backingStore: backing });
    const restored = await reader.query({ threadId: THREAD_A });
    expect(restored.map((m) => m.text)).toEqual(['first', 'second']);
  });

  it('isolation (T-04.1-03): query for thread A never returns thread B messages', async () => {
    const store = createLabConversationStore({ backingStore: backing });

    await store.createThread({ threadId: THREAD_A, resourceId: BRAND_A });
    await store.createThread({ threadId: THREAD_B, resourceId: BRAND_B });
    await store.saveMessages({
      threadId: THREAD_A,
      resourceId: BRAND_A,
      messages: [{ role: 'user', text: 'A-secret' }],
    });
    await store.saveMessages({
      threadId: THREAD_B,
      resourceId: BRAND_B,
      messages: [{ role: 'user', text: 'B-secret' }],
    });

    const a = await store.query({ threadId: THREAD_A });
    const b = await store.query({ threadId: THREAD_B });
    expect(a.map((m) => m.text)).toEqual(['A-secret']);
    expect(b.map((m) => m.text)).toEqual(['B-secret']);
    expect(a.map((m) => m.text)).not.toContain('B-secret');
  });

  it('listThreads scopes by resourceId (brand) for future brand scoping', async () => {
    const store = createLabConversationStore({ backingStore: backing });
    await store.createThread({ threadId: THREAD_A, resourceId: BRAND_A });
    await store.createThread({ threadId: THREAD_B, resourceId: BRAND_B });

    const aThreads = await store.listThreads({ resourceId: BRAND_A });
    expect(aThreads.map((t) => t.threadId)).toContain(THREAD_A);
    expect(aThreads.map((t) => t.threadId)).not.toContain(THREAD_B);
  });
});
