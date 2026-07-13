#!/usr/bin/env node
/**
 * SessionStart hook — idempotently installs the OneUI workflow rule at
 * ~/.claude/rules/oneui-workflow.md so it auto-attaches (via its `paths:`
 * frontmatter) whenever the agent touches .tsx/.ts/.jsx/.js files.
 *
 * Non-blocking: any failure (missing dist build, permissions, etc.) is
 * swallowed and the hook exits 0 without emitting anything.
 */
import { installWorkflowRules } from '../../dist/lib/installRules.js';

try {
  installWorkflowRules();
} catch {
  // Best-effort — don't block session start on this.
}

process.exit(0);
