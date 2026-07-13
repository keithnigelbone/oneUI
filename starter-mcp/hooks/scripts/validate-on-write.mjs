#!/usr/bin/env node
/**
 * PostToolUse hook (Write|Edit|MultiEdit) — ADVISORY.
 *
 * When the agent writes/edits a .tsx/.jsx file that imports OneUI, remind it to
 * run the `validate_oneui_code` gate before declaring the task done. Non-blocking:
 * it never rejects the edit — it injects a one-line reminder (with the detected
 * platform) as additionalContext so the agent doesn't forget the gate.
 *
 * Reads the PostToolUse JSON on stdin; emits a hookSpecificOutput.additionalContext
 * string (or nothing). Exit 0 always.
 */
import { readFileSync } from 'node:fs';

function readStdin() {
  try {
    return readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function done(additionalContext) {
  if (additionalContext) {
    process.stdout.write(
      JSON.stringify({
        hookSpecificOutput: {
          hookEventName: 'PostToolUse',
          additionalContext,
        },
      }),
    );
  }
  process.exit(0);
}

let input;
try {
  input = JSON.parse(readStdin() || '{}');
} catch {
  process.exit(0);
}

const toolInput = input.tool_input ?? input.toolInput ?? {};
const filePath = toolInput.file_path ?? toolInput.path ?? '';
if (!/\.(tsx|jsx)$/.test(filePath)) done();

// Prefer the content the tool just wrote; fall back to reading the file on disk.
let content =
  toolInput.content ??
  toolInput.new_string ??
  (Array.isArray(toolInput.edits) ? toolInput.edits.map((e) => e.new_string ?? '').join('\n') : '');
if (!content && filePath) {
  try {
    content = readFileSync(filePath, 'utf8');
  } catch {
    /* ignore — may be a partial edit */
  }
}
if (!content) done();

const isNative = /@oneui\/ui-native/.test(content);
const isWeb = /@jds4\/oneui-react/.test(content);
if (!isNative && !isWeb) done();

const platform = isNative ? 'reactnative' : 'react';
done(
  `OneUI: \`${filePath}\` imports ${isNative ? '@oneui/ui-native' : '@jds4/oneui-react'}. ` +
    `Before declaring this done, run \`validate_oneui_code\` (platform: "${platform}") on the file ` +
    `and self-heal any issues until the gate returns "All clear." Lint/typecheck passing is NOT the gate.`,
);
