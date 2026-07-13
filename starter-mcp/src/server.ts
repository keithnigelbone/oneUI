import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerRegistryTools } from './tools/registry.js';
import { registerLifecycleTools } from './tools/lifecycle.js';
import { registerKnowledgeTools } from './tools/knowledge.js';
import { registerComponentTools } from './tools/components.js';
import { registerContextTools } from './tools/context.js';
import { registerBrandTools } from './tools/brands.js';
import { registerValidateTools } from './tools/validate.js';
import { registerFigmaTools } from './tools/figma.js';
import { registerResources } from './resources.js';
import { registerPrompts } from './prompts.js';
import { getManifest, snapshotAvailable } from './lib/snapshot.js';
import { buildMcpInstructions } from './lib/workflowRule.js';
import { PACKAGE_VERSION } from './lib/version.js';

export const SERVER_NAME = 'oneui';
/** Single-sourced from package.json — never hardcode the version in src/. */
export const SERVER_VERSION = PACKAGE_VERSION;

/** Build and configure the OneUI MCP server (no transport attached yet). */
export function createServer(): McpServer {
  const manifest = getManifest();
  const manifestLine = manifest
    ? `Snapshot ${manifest.snapshotVersion} (design system ${manifest.designSystem.version}), generated ${manifest.generatedAt}.`
    : 'WARNING: knowledge snapshot is missing — run `npm run build:snapshot`.';
  const instructions = buildMcpInstructions(manifestLine);

  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    { instructions },
  );

  registerRegistryTools(server);
  registerLifecycleTools(server);
  registerKnowledgeTools(server);
  registerComponentTools(server);
  registerContextTools(server);
  registerBrandTools(server);
  registerValidateTools(server);
  registerFigmaTools(server);
  registerPrompts(server);
  if (snapshotAvailable()) registerResources(server);

  return server;
}
