import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

/** Wrap a plain string as an MCP text tool-result. */
export function text(s: string): CallToolResult {
  return { content: [{ type: 'text', text: s }] };
}

/** Wrap an error string as an MCP error tool-result. */
export function errorText(s: string): CallToolResult {
  return { content: [{ type: 'text', text: s }], isError: true };
}

/** Pretty-print JSON for tool output. */
export function json(value: unknown): string {
  return JSON.stringify(value, null, 2);
}

/** Default project root: where the user's coding agent is working. */
export function defaultProjectRoot(provided?: string): string {
  return provided && provided.trim() ? provided : process.cwd();
}
