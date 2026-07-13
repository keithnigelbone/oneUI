/**
 * chat/[threadId]/page.tsx
 *
 * Resumes a persisted agent conversation. Hydrates messages from Convex
 * and passes them into the shared `<HomeChat>` surface along with the
 * thread id so subsequent exchanges persist to the same thread.
 *
 * Uses Convex's reactive subscription (`useQuery`) so open tabs stay in
 * sync if the thread is updated from somewhere else (e.g. a future
 * "continue on mobile" flow).
 */

'use client';

import React, { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { useParams } from 'next/navigation';
import type { UIMessage } from 'ai';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { HomeChat } from '@/components/HomeChat';
import { PageLoader } from '@/components/PageLoader';

/**
 * Hydrate a Convex-persisted message into the `UIMessage` shape the
 * Vercel AI SDK expects. The stored `parts` array round-trips verbatim
 * since we serialized the raw UIMessage.parts on the way in.
 */
function hydrate(
  row: { _id: string; role: 'user' | 'assistant' | 'system'; parts: unknown[] },
): UIMessage {
  return {
    id: row._id,
    role: row.role,
    parts: row.parts as UIMessage['parts'],
  } as UIMessage;
}

export default function ChatThreadPage() {
  const params = useParams<{ threadId: string }>();
  const threadId = params.threadId as Id<'agentThreads'>;

  const data = useQuery(api.agentChat.getThread, { threadId });

  const initialMessages = useMemo<UIMessage[] | undefined>(() => {
    if (!data) return undefined;
    return data.messages.map((m) =>
      hydrate({
        _id: m._id,
        role: m.role,
        parts: m.parts ?? [],
      }),
    );
  }, [data]);

  if (data === undefined) {
    // Convex is still loading the thread — show the shared PageLoader
    // so the user sees the same spinner that the rest of the platform
    // uses during navigation.
    return <PageLoader />;
  }

  if (data === null) {
    return (
      <div
        style={{
          padding: 'var(--Spacing-9)',
          textAlign: 'center',
          fontFamily: 'var(--Body-FontFamily, var(--Typography-Font-Text))',
          color: 'var(--Primary-Medium-Text)',
        }}
      >
        <h1
          style={{
            fontSize: 'var(--Headline-L-FontSize)',
            lineHeight: 'var(--Headline-L-LineHeight)',
            fontWeight: 'var(--Headline-L-FontWeight)',
            color: 'var(--Primary-High)',
            margin: '0 0 var(--Spacing-3-5)',
          }}
        >
          Thread not found
        </h1>
        <p>This conversation may have been deleted. Head back to Home to start a new one.</p>
      </div>
    );
  }

  return <HomeChat initialThreadId={threadId} initialMessages={initialMessages} />;
}
