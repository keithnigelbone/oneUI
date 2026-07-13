/**
 * ChatMessage — Individual message bubble (user, assistant, or tool call)
 *
 * AI SDK v6: Tool parts have type `tool-${toolName}`, with state/input/output
 * directly on the part (no `.toolInvocation` wrapper).
 */

'use client';

import type { UIMessage, FileUIPart } from 'ai';
import styles from './ChatMessage.module.css';

interface ChatMessageProps {
  message: UIMessage;
}

/** Sparkle icon for AI avatar */
function AiIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" />
    </svg>
  );
}

/** Friendly tool names for display */
const TOOL_LABELS: Record<string, string> = {
  set_campaign_metadata: 'Setting up campaign',
  generate_asset_html: 'Generating asset',
  request_image_generation: 'Creating image',
  modify_asset: 'Modifying asset',
};

/** Part shape for tool invocations (v6: type is `tool-${name}`) */
interface ToolPartLike {
  type: string;
  toolCallId: string;
  state: string;
}

/** Check if a part is a tool invocation (type starts with "tool-") */
function isToolPart(part: { type: string }): part is ToolPartLike {
  return part.type.startsWith('tool-') && 'toolCallId' in part;
}

/** Extract tool name from part type (e.g., "tool-set_campaign_metadata" → "set_campaign_metadata") */
function getToolName(part: { type: string }): string {
  return part.type.replace(/^tool-/, '');
}

export function ChatMessage({ message }: ChatMessageProps) {
  if (message.role === 'user') {
    const text = message.parts
      ?.filter((p): p is { type: 'text'; text: string } => p.type === 'text')
      .map(p => p.text)
      .join('') ?? '';

    // AI SDK v6: image files are in parts with type 'file'
    const fileParts = message.parts?.filter(
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
          <div className={`${styles.bubble} ${styles.userBubble}`}>
            {text}
          </div>
        </div>
      </div>
    );
  }

  if (message.role === 'assistant') {
    const parts = message.parts ?? [];
    const textParts = parts.filter(
      (p): p is { type: 'text'; text: string } => p.type === 'text' && !!(p as { text?: string }).text?.trim()
    );
    // Cast to access tool-specific properties (v6 tool parts have type `tool-${name}`)
    const toolParts = parts.filter(isToolPart) as unknown as ToolPartLike[];

    return (
      <>
        {toolParts.map((part) => {
          const toolName = getToolName(part);
          const label = TOOL_LABELS[toolName] ?? toolName;
          return (
            <div key={part.toolCallId} className={styles.toolCall}>
              <svg className={styles.toolIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              {label}
              {(part.state === 'input-streaming' || part.state === 'input-available') && '...'}
            </div>
          );
        })}
        {textParts.length > 0 && (
          <div className={`${styles.message} ${styles.assistantMessage}`}>
            <div className={`${styles.avatar} ${styles.assistantAvatar}`}>
              <AiIcon />
            </div>
            <div className={`${styles.bubble} ${styles.assistantBubble}`}>
              {textParts.map(p => p.text).join('')}
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}

/** Loading indicator shown while Claude is thinking */
export function ChatLoadingIndicator() {
  return (
    <div className={`${styles.message} ${styles.assistantMessage}`}>
      <div className={`${styles.avatar} ${styles.assistantAvatar}`}>
        <AiIcon />
      </div>
      <div className={styles.loadingDots}>
        <div className={styles.dot} />
        <div className={styles.dot} />
        <div className={styles.dot} />
      </div>
    </div>
  );
}
