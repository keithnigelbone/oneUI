/**
 * ChatSurface.tsx
 *
 * Reusable chat presentation primitive — the canonical UI that Home,
 * Build, Design, and Voice all render. Headless of transport: the caller
 * passes `messages`, `status`, and an `onSubmit` callback; ChatSurface
 * owns the composer's controlled value, the empty-vs-conversation
 * layout, the default message rendering, and the `renderMessagePart`
 * slot used by mode-specific data parts (AST previews, tone-guard
 * cards, asset thumbnails).
 *
 * Extracted from HomeChat.tsx — intended to be pixel-identical.
 */

'use client';

import React, { memo, useCallback, useState } from 'react';
import { extractText, isToolPart, getToolName, type ToolPartLike } from '@oneui/shared';
import { ChatComposer } from '../ChatComposer/ChatComposer';
import { AgentThinking } from './parts/AgentThinking';
import { StreamingText } from './parts/StreamingText';
import styles from './ChatSurface.module.css';
import type {
  ChatMessage,
  ChatSurfaceProps,
  RenderMessagePart,
} from './ChatSurface.shared';

/**
 * Default labels for known home-agent tool invocations. Surfaces that
 * ship their own tools pass a `renderMessagePart` slot that returns a
 * custom label; anything not handled falls back to the raw tool name.
 */
const DEFAULT_TOOL_LABELS: Record<string, string> = {
  search_design_system: 'Searched design system',
  navigate_to: 'Suggested a destination',
  get_brand_foundation: 'Looked up brand foundation',
};

interface MessageRowProps {
  message: ChatMessage;
  index: number;
  renderMessagePart?: RenderMessagePart;
  onRegenerate?: (messageId: string, context: { message: ChatMessage }) => void;
  /** The most recent assistant message id — only that row shows the retry action. */
  latestAssistantId: string | null;
  /** True while a response is streaming; suppresses the retry action. */
  isStreaming: boolean;
  /** Brand/agent icon used for the "thinking" pulse on empty assistant bubbles. */
  agentIcon?: React.ReactNode;
  /** Rotating status phrases shown next to the spinner. */
  thinkingMessages?: ReadonlyArray<string>;
}

/**
 * Matches Vercel AI SDK's `FileUIPart` structurally — avoids importing
 * the `ai` package into `@oneui/ui`.
 */
interface FilePartLike {
  type: 'file';
  url: string;
  mediaType: string;
  filename?: string;
}

function isImageFilePart(part: { type: string }): part is FilePartLike {
  return (
    part.type === 'file' &&
    typeof (part as FilePartLike).url === 'string' &&
    typeof (part as FilePartLike).mediaType === 'string' &&
    (part as FilePartLike).mediaType.startsWith('image/')
  );
}

const MessageRow = memo(function MessageRow({
  message,
  index,
  renderMessagePart,
  onRegenerate,
  latestAssistantId,
  isStreaming,
  agentIcon,
  thinkingMessages,
}: MessageRowProps) {
  const parts = (message.parts ?? []) as ReadonlyArray<
    { type: string } & Record<string, unknown>
  >;

  if (message.role === 'user') {
    const customNodes: React.ReactNode[] = [];
    const imageParts: FilePartLike[] = [];
    let customCount = 0;

    for (let i = 0; i < parts.length; i++) {
      const p = parts[i];
      if (renderMessagePart) {
        const custom = renderMessagePart(p, { message, index });
        if (custom !== null && custom !== undefined) {
          customNodes.push(
            <React.Fragment key={`${message.id}-upart-${customCount++}`}>
              {custom}
            </React.Fragment>,
          );
          continue;
        }
      }
      if (isImageFilePart(p)) imageParts.push(p);
    }

    const text = extractText(message);

    return (
      <div className={`${styles.row} ${styles.rowUser}`}>
        <div className={styles.userStack}>
          {imageParts.map((f, i) => (
            <img
              key={`${message.id}-img-${i}`}
              src={f.url}
              alt={f.filename ?? 'Uploaded image'}
              className={styles.userImage}
              loading="lazy"
              decoding="async"
            />
          ))}
          {customNodes}
          {text && <div className={styles.bubbleUser}>{text}</div>}
        </div>
      </div>
    );
  }

  if (message.role !== 'assistant') return null;

  const toolParts: ToolPartLike[] = [];
  const customNodes: React.ReactNode[] = [];

  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    if (renderMessagePart) {
      const custom = renderMessagePart(p, { message, index });
      if (custom !== null && custom !== undefined) {
        customNodes.push(
          <React.Fragment key={`${message.id}-part-${i}`}>{custom}</React.Fragment>,
        );
        continue;
      }
    }
    if (isToolPart(p)) toolParts.push(p);
  }

  const text = extractText(message);
  const isLatest = message.id === latestAssistantId;
  const showRegenerate = !!onRegenerate && isLatest && !isStreaming && (text.length > 0 || customNodes.length > 0);
  const isThisStreaming = isStreaming && isLatest;
  const showThinking =
    isThisStreaming &&
    text.length === 0 &&
    toolParts.length === 0;

  return (
    <div className={`${styles.row} ${styles.rowAssistant}`}>
      <div className={styles.bubbleAssistant}>
        {toolParts.map((tp) => (
          <div key={tp.toolCallId} className={styles.toolCall}>
            {DEFAULT_TOOL_LABELS[getToolName(tp)] ?? getToolName(tp)}
          </div>
        ))}
        {customNodes}
        {text ? <StreamingText text={text} isStreaming={isThisStreaming} /> : null}
        {showThinking ? (
          <AgentThinking icon={agentIcon} messages={thinkingMessages} />
        ) : null}
        {showRegenerate && (
          <div className={styles.assistantActions}>
            <button
              type="button"
              className={styles.regenerateButton}
              onClick={() => onRegenerate!(message.id, { message })}
              aria-label="Regenerate response"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              <span>Regenerate</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

function DefaultErrorBubble({ error }: { error: Error }) {
  return (
    <div className={styles.errorBubble} role="alert">
      <span className={styles.errorTitle}>Something went wrong</span>
      <span className={styles.errorMessage}>{error.message}</span>
    </div>
  );
}

export const ChatSurface = memo(function ChatSurface({
  messages,
  status,
  error,
  onSubmit,
  value: valueProp,
  onValueChange,
  greeting,
  suggestions,
  composerProps,
  aboveComposer,
  belowComposer,
  onStop,
  onRegenerate,
  renderError,
  renderMessagePart,
  agentIcon,
  thinkingMessages,
  className,
  'data-testid': dataTestId,
}: ChatSurfaceProps) {
  // Controlled if both `value` and `onValueChange` are provided; otherwise
  // we own the input state. Single hook avoids the conditional-hook pitfall.
  const [internalValue, setInternalValue] = useState('');
  const isControlled = valueProp !== undefined && onValueChange !== undefined;
  const value = isControlled ? valueProp : internalValue;
  const setValue = useCallback(
    (next: string) => {
      if (isControlled) {
        onValueChange!(next);
      } else {
        setInternalValue(next);
      }
    },
    [isControlled, onValueChange],
  );

  const isStreaming = status === 'streaming' || status === 'submitted';

  const handleSubmit = useCallback(
    (text: string) => {
      onSubmit(text);
      setValue('');
    },
    [onSubmit, setValue],
  );

  // Find the latest assistant message id once per render — only that
  // row gets the regenerate action so the transcript doesn't become a
  // field of retry buttons.
  let latestAssistantId: string | null = null;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'assistant') {
      latestAssistantId = messages[i].id;
      break;
    }
  }

  // Show a standalone thinking row whenever we're streaming/submitted but
  // the transcript's last message is still the user's — i.e. the server
  // hasn't sent the assistant message yet. Without this the indicator is
  // invisible during the request-in-flight phase.
  const lastMessage = messages[messages.length - 1];
  const showPendingThinking =
    isStreaming && (!lastMessage || lastMessage.role !== 'assistant');

  const stopPill = onStop && isStreaming ? (
    <button type="button" className={styles.stopPill} onClick={onStop}>
      <span className={styles.stopDot} aria-hidden="true" />
      <span>Stop generating</span>
    </button>
  ) : null;

  const preComposer = stopPill || aboveComposer ? (
    <div className={styles.aboveComposer}>
      {stopPill}
      {aboveComposer}
    </div>
  ) : null;

  const hasMessages = messages.length > 0;
  const rootClassName = className ? `${styles.root} ${className}` : styles.root;

  return (
    <div className={rootClassName} data-testid={dataTestId}>
      {!hasMessages ? (
        <div className={styles.empty}>
          {greeting && <div className={styles.greetingSlot}>{greeting}</div>}
          <div className={styles.emptyComposer}>
            {preComposer}
            <ChatComposer
              {...composerProps}
              value={value}
              onChange={setValue}
              onSubmit={handleSubmit}
              suggestions={suggestions}
              disabled={isStreaming}
              autoFocus
            />
            {belowComposer}
          </div>
        </div>
      ) : (
        <div className={styles.conversation}>
          <div className={styles.messages} aria-live="polite">
            {messages.map((m, i) => (
              <MessageRow
                key={m.id}
                message={m}
                index={i}
                renderMessagePart={renderMessagePart}
                onRegenerate={onRegenerate}
                latestAssistantId={latestAssistantId}
                isStreaming={isStreaming}
                agentIcon={agentIcon}
                thinkingMessages={thinkingMessages}
              />
            ))}
            {showPendingThinking && (
              <div className={`${styles.row} ${styles.rowAssistant}`}>
                <div className={styles.bubbleAssistant}>
                  <AgentThinking icon={agentIcon} messages={thinkingMessages} />
                </div>
              </div>
            )}
            {error &&
              (renderError ? renderError(error) : <DefaultErrorBubble error={error} />)}
          </div>
          <div className={styles.composerPinned}>
            {preComposer}
            <ChatComposer
              {...composerProps}
              value={value}
              onChange={setValue}
              onSubmit={handleSubmit}
              placeholder={composerProps?.placeholder ?? 'Reply...'}
              disabled={isStreaming}
            />
            {belowComposer}
          </div>
        </div>
      )}
    </div>
  );
});
