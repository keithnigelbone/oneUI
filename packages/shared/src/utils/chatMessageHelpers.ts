/**
 * chatMessageHelpers.ts
 *
 * Shared helpers for walking Vercel AI SDK `UIMessage.parts`. Kept
 * framework-free so they can be used from any client surface.
 *
 * The `UIMessage` type is re-exported from `ai` but not used as a
 * direct import here — we type the input loosely as `{ parts? }` so
 * this module stays dependency-free and can be consumed by the shared
 * package without pulling the `ai` SDK into its test runner.
 */

export interface MessageLike {
  parts?: ReadonlyArray<{ type: string } & Record<string, unknown>>;
}

export interface ToolPartLike {
  type: string;
  toolCallId: string;
  state: string;
}

/** Concatenate every text-typed part into a single string. */
export function extractText(message: MessageLike): string {
  return (
    message.parts
      ?.filter((p): p is { type: 'text'; text: string } & Record<string, unknown> =>
        p.type === 'text',
      )
      .map((p) => p.text)
      .join('') ?? ''
  );
}

/** Tool-invocation parts have type `tool-${name}` and carry a toolCallId. */
export function isToolPart(part: { type: string }): part is ToolPartLike {
  return part.type.startsWith('tool-') && 'toolCallId' in part;
}

/** Strip the `tool-` prefix — "tool-search_design_system" → "search_design_system". */
export function getToolName(part: { type: string }): string {
  return part.type.replace(/^tool-/, '');
}
