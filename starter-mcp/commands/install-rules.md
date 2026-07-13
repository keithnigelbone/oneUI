---
name: install-rules
description: Manually (re)install the OneUI build-workflow rule at ~/.claude/rules/oneui-workflow.md. This normally happens automatically on session start; use this command if the rule is missing or stale (e.g. after upgrading the plugin) and you don't want to restart the session.
disable-model-invocation: true
---

# /oneui:install-rules

Writes the OneUI build-workflow rule to `~/.claude/rules/oneui-workflow.md` so it
auto-attaches (via its `paths:` frontmatter) whenever the agent touches
`.tsx`/`.ts`/`.jsx`/`.js` files. The plugin's SessionStart hook does this automatically on
every session — this command is for a manual re-install without restarting.

## Flow
1. Run: `node ${CLAUDE_PLUGIN_ROOT}/dist/index.js --install-rules`
2. Report the path written and whether it changed (already up to date vs newly installed).

## Related
- `hooks/scripts/ensure-rules.mjs` — the SessionStart hook that runs this automatically.
- `src/lib/workflowRule.ts` — single source of truth for the rule body (also feeds the MCP
  server's `instructions` field).
