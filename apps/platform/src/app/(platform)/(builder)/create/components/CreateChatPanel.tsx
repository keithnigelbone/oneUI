/**
 * CreateChatPanel.tsx
 *
 * Build (Experience Builder) chat surface. Thin adapter that composes
 * the shared `<ChatSurface>` with Build-specific concerns:
 *
 *   - Image attachments (dataUrl) rendered as thumbnails above the
 *     composer and forwarded to `onSendMessage(text, attachments)`
 *   - Tool-call rendering with Create-specific labels (set_project_metadata,
 *     ask_clarification, generate_*, etc.)
 *   - Inline `<ClarificationCard>` when the assistant emits an
 *     `ask_clarification` tool output
 *   - "Offline" banner for the guided-wizard fallback
 *
 * Callers (StartHereContent, ProjectWorkspace) still own the useChat
 * transport and project context; this component only renders.
 */

'use client';

import { useCallback, useRef, useState } from 'react';
import type { UIMessage, ChatStatus } from 'ai';
import { IconButton } from '@oneui/ui/components/IconButton';
import { Icon } from '@oneui/ui/icons/Icon';
import {
  ChatSurface,
  type RenderMessagePart,
} from '@oneui/ui/components/ChatSurface';
import { ClarificationCard, type ClarificationQuestion } from './ClarificationCard';
import { useCreateChatActions } from './CreateChatContext';
import IcHellojio from '@/Jio_Icons/icons/IcHellojio';
import styles from './ChatPanel.module.css';
import localStyles from './CreateChatPanel.module.css';

interface Attachment {
  name: string;
  type: string;
  dataUrl: string;
}

interface CreateChatPanelProps {
  messages: UIMessage[];
  status: ChatStatus;
  onSendMessage: (text: string, attachments?: Attachment[]) => void;
  placeholder?: string;
  compact?: boolean;
  /** Guided wizard when the AI chat API is unavailable */
  isOffline?: boolean;
}

const TOOL_LABELS: Record<string, string> = {
  set_project_metadata: 'Setting up project',
  ask_clarification: 'Guided questions',
  generate_content_block: 'Content Block',
  generate_ribbon: 'Ribbon',
  generate_asset_layout: 'Generating asset',
  modify_asset_layout: 'Updating layout',
  adapt_to_formats: 'Planning adaptations',
  adapt_design_layout: 'Adapting layout',
};

const SUPPORTED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);

interface ToolPartLike {
  type: string;
  toolCallId: string;
  state: string;
  input?: Record<string, unknown>;
}

function isToolPart(p: { type: string }): p is ToolPartLike {
  return p.type.startsWith('tool-') && 'toolCallId' in p;
}

export function CreateChatPanel({
  messages,
  status,
  onSendMessage,
  placeholder = 'Describe the marketing asset you want (platform, message, mood…)',
  compact = false,
  isOffline = false,
}: CreateChatPanelProps) {
  const { onClarificationSubmit } = useCreateChatActions();
  const [composerValue, setComposerValue] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resolvedPlaceholder = isOffline
    ? 'Answer the guided questions above, or type a message…'
    : placeholder;

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!SUPPORTED_IMAGE_TYPES.has(file.type)) return;
      const reader = new FileReader();
      reader.onload = () => {
        setAttachments((prev) => [
          ...prev,
          { name: file.name, type: file.type, dataUrl: reader.result as string },
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Composer submit — ChatSurface clears the text for us; attachments
  // must be cleared here since they're held outside the composer.
  const handleSubmit = useCallback(
    (text: string) => {
      onSendMessage(text, attachments.length > 0 ? attachments : undefined);
      setAttachments([]);
    },
    [attachments, onSendMessage],
  );

  // Render Create-specific tool parts inline, with the ClarificationCard
  // branch for `ask_clarification` outputs. Returning null for non-tool
  // parts lets ChatSurface fall through to its default text rendering.
  const renderMessagePart: RenderMessagePart = useCallback(
    (part) => {
      if (!isToolPart(part)) return null;
      const toolName = part.type.replace(/^tool-/, '');
      const label = TOOL_LABELS[toolName] ?? toolName;

      if (
        toolName === 'ask_clarification' &&
        part.state === 'output-available' &&
        onClarificationSubmit
      ) {
        const questionsRaw = part.input?.questions;
        const questions: ClarificationQuestion[] | undefined = Array.isArray(questionsRaw)
          ? (questionsRaw as ClarificationQuestion[])
          : undefined;
        if (questions && questions.length > 0) {
          return (
            <div className={styles.toolCall}>
              <Icon name="sparkles" size="sm" />
              {label}
              <ClarificationCard questions={questions} onSubmit={onClarificationSubmit} />
            </div>
          );
        }
      }

      const isStreaming =
        part.state === 'input-streaming' || part.state === 'input-available';
      return (
        <div className={styles.toolCall}>
          <Icon name="sparkles" size="sm" />
          {label}
          {isStreaming ? '…' : ''}
        </div>
      );
    },
    [onClarificationSubmit],
  );

  const leading = (
    <IconButton
      icon={<Icon name="add" />}
      appearance="neutral"
      attention="low"
      size="s"
      aria-label="Attach image"
      onPress={() => fileInputRef.current?.click()}
    />
  );

  const trailing = (
    <IconButton
      icon={<Icon name="arrowUp" />}
      appearance="primary"
      attention="high"
      size="s"
      aria-label="Send message"
      disabled={
        (composerValue.trim().length === 0 && attachments.length === 0) ||
        status === 'submitted' ||
        status === 'streaming'
      }
      onPress={() => handleSubmit(composerValue.trim())}
    />
  );

  const attachmentStrip = attachments.length > 0 ? (
    <div className={styles.attachments}>
      {attachments.map((att, i) => (
        <div key={`${att.name}-${i}`} className={styles.attachmentThumb}>
          <img src={att.dataUrl} alt={att.name} className={styles.attachmentImage} />
          <IconButton
            icon={<Icon name="close" />}
            attention="low"
            appearance="neutral"
            size="s"
            className={styles.attachmentRemove}
            aria-label={`Remove ${att.name}`}
            onPress={() => removeAttachment(i)}
          />
        </div>
      ))}
    </div>
  ) : null;

  // Render the hidden file input outside ChatSurface so leading/trailing
  // slots can reference `fileInputRef.current` via the onPress callback.
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
      {isOffline && !compact && (
        <div className={localStyles.offlineBanner} role="status">
          <svg
            className={localStyles.offlineBannerIcon}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
          >
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
          <span>Offline mode — guided wizard active.</span>
        </div>
      )}
      <ChatSurface
        messages={messages}
        status={status}
        onSubmit={handleSubmit}
        value={composerValue}
        onValueChange={setComposerValue}
        renderMessagePart={renderMessagePart}
        agentIcon={<IcHellojio />}
        aboveComposer={attachmentStrip}
        composerProps={{
          placeholder: resolvedPlaceholder,
          leading,
          trailing,
        }}
      />
    </>
  );
}
