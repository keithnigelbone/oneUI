'use client';

import type { UIMessage, FileUIPart } from 'ai';
import styles from './ChatMessage.module.css';
import offlineStyles from './CreateChatMessage.module.css';
import { ClarificationCard, type ClarificationQuestion } from './ClarificationCard';
import { useCreateChatActions } from './CreateChatContext';

interface CreateChatMessageProps {
  message: UIMessage;
}

function AiIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
    </svg>
  );
}

/** Guided wizard responses (offline) — distinct from live AI. */
function OfflineGuidedIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M9 9h.01M15 9h.01M9 15h6" strokeLinecap="round" />
    </svg>
  );
}

function isOfflineAssistantMessage(message: UIMessage): boolean {
  if (message.role !== 'assistant') return false;
  const meta = (message as UIMessage & { metadata?: { offline?: boolean } }).metadata;
  return meta?.offline === true;
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

interface ToolPartLike {
  type: string;
  toolCallId: string;
  state: string;
  input?: Record<string, unknown>;
}

function isToolPart(part: { type: string }): part is ToolPartLike {
  return part.type.startsWith('tool-') && 'toolCallId' in part;
}

function getToolName(part: { type: string }): string {
  return part.type.replace(/^tool-/, '');
}

export function CreateChatMessage({ message }: CreateChatMessageProps) {
  const { onClarificationSubmit } = useCreateChatActions();

  if (message.role === 'user') {
    const text =
      message.parts
        ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
        .map((p) => p.text)
        .join('') ?? '';

    const fileParts =
      message.parts?.filter(
        (p): p is FileUIPart =>
          p.type === 'file' && (p as FileUIPart).mediaType.startsWith('image/')
      ) ?? [];

    return (
      <div className={`${styles.message} ${styles.userMessage}`}>
        <div className={`${styles.avatar} ${styles.userAvatar}`}>U</div>
        <div>
          {fileParts.map((file, i) => (
            <img key={i} src={file.url} alt="Uploaded image" className={styles.userImage} />
          ))}
          <div className={`${styles.bubble} ${styles.userBubble}`}>{text}</div>
        </div>
      </div>
    );
  }

  if (message.role === 'assistant') {
    const parts = message.parts ?? [];
    const textParts = parts.filter(
      (p): p is { type: 'text'; text: string } =>
        p.type === 'text' && !!(p as { text?: string }).text?.trim()
    );
    const toolParts = parts.filter(isToolPart) as ToolPartLike[];
    const isOfflineAssistant = isOfflineAssistantMessage(message);

    return (
      <>
        {toolParts.map((part) => {
          const toolName = getToolName(part);
          const label = TOOL_LABELS[toolName] ?? toolName;

          const questionsRaw = part.input?.questions;
          const questions = Array.isArray(questionsRaw)
            ? (questionsRaw as ClarificationQuestion[])
            : undefined;

          if (
            toolName === 'ask_clarification' &&
            part.state === 'output-available' &&
            questions &&
            questions.length > 0 &&
            onClarificationSubmit
          ) {
            return (
              <div
                key={part.toolCallId}
                className={`${styles.toolCall}${isOfflineAssistant ? ` ${offlineStyles.offlineToolCall}` : ''}`}
              >
                <svg
                  className={styles.toolIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
                </svg>
                {label}
                <ClarificationCard questions={questions} onSubmit={onClarificationSubmit} />
              </div>
            );
          }

          return (
            <div
              key={part.toolCallId}
              className={`${styles.toolCall}${isOfflineAssistant ? ` ${offlineStyles.offlineToolCall}` : ''}`}
            >
              <svg
                className={styles.toolIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              {label}
              {(part.state === 'input-streaming' || part.state === 'input-available') && '...'}
            </div>
          );
        })}
        {textParts.length > 0 && (
          <div
            className={`${styles.message} ${styles.assistantMessage}${
              isOfflineAssistant ? ` ${offlineStyles.offlineAssistantMessage}` : ''
            }`}
          >
            <div className={`${styles.avatar} ${styles.assistantAvatar}`}>
              {isOfflineAssistant ? <OfflineGuidedIcon /> : <AiIcon />}
            </div>
            <div className={`${styles.bubble} ${styles.assistantBubble}`}>
              {textParts.map((p) => p.text).join('')}
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}

export { ChatLoadingIndicator } from './ChatMessage';
