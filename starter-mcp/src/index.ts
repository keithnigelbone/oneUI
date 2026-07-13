#!/usr/bin/env node
/**
 * @jds4/oneui-mcp — entrypoint.
 * Connects the OneUI MCP server to stdio (the transport AI IDEs / coding
 * agents use to launch a local MCP via `npx -y @jds4/oneui-mcp`).
 */
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';
import { installWorkflowRules } from './lib/installRules.js';

async function main(): Promise<void> {
  if (process.argv.includes('--install-rules')) {
    const { path, changed } = installWorkflowRules();
    process.stdout.write(`[oneui-mcp] workflow rule ${changed ? 'installed at' : 'already up to date at'} ${path}\n`);
    return;
  }

  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Never write to stdout — it's the MCP channel. Logs go to stderr only.
  process.stderr.write('[oneui-mcp] ready on stdio\n');
}

main().catch((err) => {
  process.stderr.write(`[oneui-mcp] fatal: ${err instanceof Error ? err.stack : String(err)}\n`);
  process.exit(1);
});
