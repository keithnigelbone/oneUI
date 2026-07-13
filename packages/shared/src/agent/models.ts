/**
 * Centralised Claude model identifiers used by every server-side AI route.
 *
 * Bump in one place when migrating. Routes import these constants instead of
 * hardcoding strings so a model change is a one-line diff, not a grep-and-edit.
 */

/** Default model for composition, chat, canvas generation, and eval judges. */
export const CLAUDE_MODEL = 'claude-sonnet-4-6' as const;

/** Vision-capable model. Same family — Sonnet 4.6 supports image input natively. */
export const CLAUDE_VISION_MODEL = CLAUDE_MODEL;

export type ClaudeModelId = typeof CLAUDE_MODEL;
