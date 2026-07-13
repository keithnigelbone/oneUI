/**
 * ChatSurface.shared.ts
 *
 * Shared types for the reusable chat surface. ChatSurface renders a
 * transcript + composer pair with an empty-state greeting, and is the
 * single presentation primitive behind Home, Build, Design, and Voice.
 *
 * Kept headless of transport: the caller owns `messages`, `status`, and
 * `onSubmit`. Persistence and API wiring live one layer up in
 * `useAgentChat(mode)`.
 */

import type { ReactNode } from 'react';
import type { ChatComposerProps } from '../ChatComposer/ChatComposer.shared';

/**
 * Minimal structural type for a Vercel AI SDK `UIMessage`. Declared
 * locally so `@oneui/ui` doesn't pull the `ai` SDK into its dependency
 * graph — callers that hold a real `UIMessage` pass it structurally.
 */
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system' | (string & {});
  parts?: ReadonlyArray<{ type: string } & Record<string, unknown>>;
}

/** Alias so call sites reading AI SDK types can use the familiar name. */
export type UIMessage = ChatMessage;

/**
 * A lazy subset of the Vercel AI SDK `useChat` status values. Kept as a
 * string union so callers don't need to import the SDK's type directly.
 */
export type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error' | (string & {});

/**
 * Slot that receives every message part and decides how to render it.
 * Return `null` to defer to the built-in renderer (text + tool-call label).
 * Used by Design (AST preview card), Voice (tone-guard card), and Build
 * (asset thumbnail) to slot in custom UI for their data-* parts.
 */
export type RenderMessagePart = (
  part: { type: string } & Record<string, unknown>,
  context: { message: ChatMessage; index: number },
) => ReactNode | null | undefined;

/**
 * Subset of ChatComposer props that ChatSurface forwards. We hide the
 * controlled-value pieces (value/onChange/onSubmit) because ChatSurface
 * owns them internally — callers only configure adornments and behaviour.
 */
export type ChatSurfaceComposerProps = Omit<
  ChatComposerProps,
  'value' | 'onChange' | 'onSubmit' | 'disabled' | 'autoFocus' | 'suggestions'
>;

export interface ChatSurfaceProps {
  /** The live message list. ChatSurface never mutates it. */
  messages: ChatMessage[];
  /** Current transport status. Drives composer disabled + loading indicator. */
  status: ChatStatus;
  /** Latest transport error, if any. Rendered as an inline alert bubble. */
  error?: Error | null;
  /** Fired when the user submits a non-empty message. */
  onSubmit: (text: string) => void;
  /**
   * Optional controlled composer value. When omitted, ChatSurface owns the
   * input state internally. Pass both `value` and `onValueChange` when the
   * caller needs to prefill (e.g. suggestion-chip click) or observe typing.
   */
  value?: string;
  /** Companion setter for controlled `value`. */
  onValueChange?: (next: string) => void;
  /** Optional: render a greeting over the empty state. Falls back to nothing. */
  greeting?: ReactNode;
  /** Optional: suggestion chips for the empty-state composer. */
  suggestions?: ChatComposerProps['suggestions'];
  /** Composer adornments — leading/trailing/modelLabel/placeholder etc. */
  composerProps?: ChatSurfaceComposerProps;
  /**
   * Optional slot rendered immediately above the composer in both empty
   * and conversation layouts. Useful for attachment thumbnails, status
   * banners, or any "stage" UI that belongs above the input but is owned
   * by the caller (not a message part).
   */
  aboveComposer?: ReactNode;
  /**
   * Optional slot rendered immediately below the composer in both empty and
   * conversation layouts. Use for low-frequency settings that should not live
   * inside the text box.
   */
  belowComposer?: ReactNode;
  /**
   * Fired when the user presses the "Stop generating" affordance. When
   * provided and the transport is streaming, ChatSurface renders a pill
   * just above the composer. Typically wired to `useChat().stop`.
   */
  onStop?: () => void;
  /**
   * Fired when the user retries a specific assistant response. When
   * provided, each assistant bubble gets a regenerate action on hover.
   * Typically wired to `useChat().regenerate({messageId})`.
   */
  onRegenerate?: (messageId: string, context: { message: ChatMessage }) => void;
  /**
   * Override the default error bubble. Useful for surfaces that want to
   * render mode-specific guidance (e.g. "set ANTHROPIC_API_KEY") without
   * losing structure. When omitted, a plain inline alert is rendered.
   */
  renderError?: (error: Error) => ReactNode;
  /**
   * Custom renderer for non-text message parts. Return `null` or `undefined`
   * to fall back to the default (tool-call labels + text bubbles).
   */
  renderMessagePart?: RenderMessagePart;
  /**
   * Optional brand/agent icon rendered in the "thinking" indicator while
   * the assistant is generating. Typically a `<IcHellojio />` element.
   * When omitted, the indicator falls back to a text-only "Thinking…"
   * label so the indicator remains consistent across surfaces.
   */
  agentIcon?: ReactNode;
  /**
   * Optional rotating status messages shown next to the thinking
   * spinner while a long-running generation is in flight. ChatSurface
   * forwards them to AgentThinking, which cycles through one phrase at
   * a time with a smooth fade/slide animation.
   */
  thinkingMessages?: ReadonlyArray<string>;
  /** Additional className for the outer wrapper. */
  className?: string;
  /** Test id for the outer wrapper. */
  'data-testid'?: string;
}

