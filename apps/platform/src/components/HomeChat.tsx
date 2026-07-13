/**
 * HomeChat.tsx
 *
 * Home-landing orchestrator. Owns the Vercel AI SDK transport to
 * `/api/chat`, Convex persistence, brand + voice-prompt refs, and the
 * home-specific greeting + suggestion chips. All presentation now lives
 * in `<ChatSurface>` (packages/ui) so Build, Design, and Voice can reuse
 * the exact same UI.
 */

'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type UIMessage } from 'ai';
import { useMutation } from 'convex/react';
import { api } from '@oneui/convex';
import type { Id } from '@oneui/convex/_generated/dataModel';
import { ChatSurface } from '@oneui/ui/components/ChatSurface';
import { Icon } from '@oneui/ui/icons/Icon';
import { IconButton } from '@oneui/ui/components/IconButton';
import IcHellojio from '../Jio_Icons/icons/IcHellojio';
import {
  getGreeting,
  extractBrandFoundationSummary,
  extractText,
} from '@oneui/shared';
import type { BrandFoundationSummary } from '@oneui/shared/agent';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { useFoundationData } from '@/components/FoundationStyleProvider';
import { useCompiledVoicePrompt } from '@/hooks/useCompiledVoicePrompt';
import { useAgentChat } from '@/hooks/useAgentChat';
import { OwnerSetupBanner } from '@/components/OwnerSetupBanner';
import styles from './HomeChat.module.css';


/**
 * V1 user identity placeholder.
 *
 * !!! PRE-OAUTH — DO NOT DEPLOY WITHOUT REPLACING !!!
 * Every user on the deployment shares this id, so they share threads
 * via `agentChat.listThreads`. Swap with the real identity token
 * before shipping outside dev.
 */
export const LOCAL_USER_ID = 'local-user';

export interface HomeChatProps {
  /** Existing thread id when resuming from `/chat/[threadId]`. */
  initialThreadId?: Id<'agentThreads'>;
  /** Pre-hydrated messages from Convex when resuming. */
  initialMessages?: UIMessage[];
}

export function HomeChat({ initialThreadId, initialMessages }: HomeChatProps) {
  const { currentBrand, theme } = usePlatformContext();
  const foundationData = useFoundationData();

  const createThread = useMutation(api.agentChat.createThread);
  const appendMessage = useMutation(api.agentChat.appendMessage);

  const userName = (process.env.NEXT_PUBLIC_USER_NAME ?? '').trim() || null;
  const greeting = useMemo(() => getGreeting(new Date(), userName), [userName]);

  const brandSummary: BrandFoundationSummary = useMemo(
    () =>
      extractBrandFoundationSummary({
        brandName: currentBrand?.name ?? 'Default Brand',
        theme,
        foundationData,
      }),
    [currentBrand?.name, theme, foundationData],
  );

  const brandIdForVoice = currentBrand?.id as Id<'brands'> | undefined;
  const compiledVoicePrompt = useCompiledVoicePrompt(brandIdForVoice);

  // Refs keep the transport body callback (invoked at request time, not
  // render time) in sync with the latest brand + voice prompt.
  const brandRef = useRef(brandSummary);
  brandRef.current = brandSummary;
  const voicePromptRef = useRef(compiledVoicePrompt);
  voicePromptRef.current = compiledVoicePrompt;

  const { messages, sendMessage, status, error, stop, regenerate } = useAgentChat({
    mode: 'home',
    body: () => ({
      brand: brandRef.current,
      voicePrompt: voicePromptRef.current,
    }),
    initialMessages,
  });

  const [composerValue, setComposerValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(
    (text: string) => {
      sendMessage({ text });
    },
    [sendMessage],
  );

  const isStreaming = status === 'streaming' || status === 'submitted';

  const leading = (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        aria-hidden="true"
      />
      <IconButton
        icon={<Icon name="add" />}
        appearance="neutral"
        attention="low"
        size="s"
        aria-label="Attach file"
        onPress={() => fileInputRef.current?.click()}
      />
    </>
  );

  const trailing = (
    <>
      <IconButton
        icon={<Icon name="microphone" />}
        appearance="neutral"
        attention="low"
        size="s"
        aria-label="Dictate message"
      />
      {isStreaming ? (
        <IconButton
          icon={<Icon name="close" />}
          appearance="neutral"
          attention="high"
          size="s"
          aria-label="Stop generating"
          onPress={() => stop()}
        />
      ) : (
        <IconButton
          icon={<Icon name="arrowUp" />}
          appearance="primary"
          attention="high"
          size="s"
          aria-label="Send message"
          disabled={composerValue.trim().length === 0}
          onPress={() => handleSubmit(composerValue)}
        />
      )}
    </>
  );

  // Persist after each settled exchange (not mid-stream — that would fire
  // one write per streamed token). `threadIdRef` is a ref, not state, so a
  // racing second effect run synchronously sees the id and doesn't double
  // create.
  const threadIdRef = useRef<Id<'agentThreads'> | null>(initialThreadId ?? null);
  const lastPersistedCountRef = useRef(initialMessages?.length ?? 0);

  const currentBrandId = currentBrand?.id as Id<'brands'> | undefined;

  useEffect(() => {
    if (status !== 'ready') return;
    if (messages.length === 0) return;
    if (messages.length === lastPersistedCountRef.current) return;

    (async () => {
      try {
        let tid = threadIdRef.current;
        if (tid === null) {
          const firstUser = messages.find((m) => m.role === 'user');
          const title = firstUser
            ? extractText(firstUser).slice(0, 80) || 'New conversation'
            : 'New conversation';
          tid = await createThread({
            userId: LOCAL_USER_ID,
            title,
            mode: 'home',
            brandId: currentBrandId,
          });
          threadIdRef.current = tid;
        }
        const startIdx = lastPersistedCountRef.current;
        const newMessages = messages.slice(startIdx);
        for (const m of newMessages) {
          await appendMessage({
            threadId: tid,
            role: m.role as 'user' | 'assistant' | 'system',
            parts: (m.parts ?? []) as unknown[],
          });
        }
        lastPersistedCountRef.current = messages.length;
      } catch (err) {
        console.error('[home chat] persistence failed', err);
      }
    })();
  }, [status, messages, currentBrandId, createThread, appendMessage]);

  const greetingNode = (
    <>
      <OwnerSetupBanner />
      <div className={styles.greetingRow}>
        <IcHellojio className={styles.greetingIcon} aria-hidden="true" />
        <h1 className={styles.greeting}>{greeting.text}</h1>
      </div>
    </>
  );

  const handleRegenerate = useCallback(
    (messageId: string) => {
      void regenerate({ messageId });
    },
    [regenerate],
  );

  return (
    <ChatSurface
      messages={messages}
      status={status}
      onStop={isStreaming ? () => stop() : undefined}
      onRegenerate={handleRegenerate}
      error={error ?? null}
      onSubmit={handleSubmit}
      value={composerValue}
      onValueChange={setComposerValue}
      greeting={greetingNode}
      agentIcon={<IcHellojio />}
      composerProps={{
        placeholder: 'How can I help you today?',
        modelLabel: 'Sonnet 4.6',
        leading,
        trailing,
      }}
    />
  );
}
