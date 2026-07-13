/**
 * Installs the OneUI workflow rule as a Claude Code modular rule
 * (`~/.claude/rules/oneui-workflow.md` by default). Idempotent — skips the
 * write if the target already has identical content, so a SessionStart hook
 * can call this on every session without churn.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { buildClaudeModularRule } from './workflowRule.js';

export interface InstallRulesResult {
  path: string;
  changed: boolean;
}

/** Write `<baseDir>/.claude/rules/oneui-workflow.md`. Defaults to the user's home dir. */
export function installWorkflowRules(baseDir: string = homedir()): InstallRulesResult {
  const path = join(baseDir, '.claude', 'rules', 'oneui-workflow.md');
  const content = buildClaudeModularRule();

  const existing = existsSync(path) ? readFileSync(path, 'utf8') : null;
  if (existing === content) {
    return { path, changed: false };
  }

  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, 'utf8');
  return { path, changed: true };
}
