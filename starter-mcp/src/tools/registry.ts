/**
 * JDS private-feed registry tools.
 * check_oneui_registry — detect feed connection status + emit persona-aware setup steps.
 *
 * The @jds4/* packages live on a private Azure DevOps Artifacts feed; this tool is the
 * MANDATORY first step before setup_oneui_project / any install. It never writes or
 * logs a real PAT — the auth token is always user-supplied in ~/.npmrc.
 */
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  detectRegistryStatus,
  writeProjectNpmrc,
  projectNpmrc,
  userNpmrcAuthBlock,
  REGISTRY_URL,
  FEED_NAME,
  FEED_CONNECT_URL,
  PAT_CREATE_URL,
  PAT_BASE64_NODE_CMD,
} from '../lib/registry.js';
import { getRegistrySetup } from '../lib/snapshot.js';
import { text, defaultProjectRoot } from './util.js';

export function registerRegistryTools(server: McpServer): void {
  server.registerTool(
    'check_oneui_registry',
    {
      title: 'Check JDS feed connection (run FIRST)',
      description:
        'MANDATORY first step before setup_oneui_project or any install. The @jds4/* packages ' +
        'are on a PRIVATE Azure DevOps feed (JIO-DS-ONE-UI), not public npm. This tool inspects ' +
        "the project ./.npmrc and the user ~/.npmrc and reports whether the machine is connected " +
        "to the feed (connected / registry-no-auth / not-configured), then returns the exact " +
        'setup steps for that situation. Set writeProjectNpmrc=true to scaffold the project ' +
        '.npmrc (registry only — never a token). NEVER writes or logs a Personal Access Token. ' +
        'Also remind the user to confirm they can open the feed connect page — without feed ' +
        'access, no setup will work.',
      inputSchema: {
        projectRoot: z.string().optional().describe('Project root. Defaults to cwd.'),
        writeProjectNpmrc: z
          .boolean()
          .optional()
          .describe('Write the project ./.npmrc (registry + flags, no secret) if missing. Default false.'),
        force: z.boolean().optional().describe('Overwrite an existing ./.npmrc. Default false.'),
      },
    },
    async ({ projectRoot, writeProjectNpmrc: doWrite, force }) => {
      const root = defaultProjectRoot(projectRoot);
      const report = detectRegistryStatus(root);

      const header = [
        '# JDS feed connection check',
        '',
        `**Project:** ${root}`,
        `**Status:** \`${report.status}\``,
        `- project ./.npmrc: ${report.projectNpmrcExists ? 'present' : 'missing'}`,
        `- user ~/.npmrc: ${report.userNpmrcExists ? 'present' : 'missing'}`,
        `- feed registry configured: ${report.registryConfigured ? 'yes' : 'no'}`,
        `- auth token present: ${report.authPresent ? 'yes' : 'no (or placeholder)'}`,
        '',
        `> Access gate — ask the user: can they open ${FEED_CONNECT_URL} ? ` +
          'If NOT, they have no JDS access; stop and route them to the DS/platform team. ' +
          'Setup cannot succeed without feed access.',
        '',
      ].join('\n');

      if (report.status === 'connected') {
        return text(
          header +
            '\n✅ **Connected to the JDS feed.** A registry and a real auth token are configured. ' +
            'Proceed to `setup_oneui_project` (or install `@jds4/oneui-react` directly).',
        );
      }

      // Optionally scaffold the project .npmrc (no secret).
      let writeNote = '';
      if (doWrite) {
        const wrote = writeProjectNpmrc(root, force ?? false);
        writeNote = wrote.written
          ? `\n✍️ Wrote project \`.npmrc\` at ${wrote.path}:\n\`\`\`\n${projectNpmrc()}\`\`\`\n`
          : `\n(project \`.npmrc\` not written — ${wrote.reason})\n`;
      }

      const steps =
        report.status === 'registry-no-auth'
          ? [
              '## Next: add your auth token',
              'The registry is pointed at the feed, but no token is present (or it is still a placeholder).',
              `1. Create a PAT (Packaging → Read & write): ${PAT_CREATE_URL}`,
              '2. Base64-encode it (macOS/Linux):',
              '```',
              PAT_BASE64_NODE_CMD,
              '```',
              '   (Windows: run `vsts-npm-auth -config .npmrc` instead of hand-editing.)',
              '3. Add this block to your **user** `~/.npmrc`, replacing BOTH placeholders with the Base64 value:',
              '```',
              userNpmrcAuthBlock(),
              '```',
              '4. Re-run `check_oneui_registry`, then install.',
            ]
          : [
              '## Next: connect this project to the JDS feed',
              `1. Write the project \`./.npmrc\` (registry + flags — no secret)${doWrite ? ' — done above.' : ' (or re-run this tool with writeProjectNpmrc=true):'}`,
              ...(doWrite ? [] : ['```', projectNpmrc().trimEnd(), '```']),
              `2. Create a PAT (Packaging → Read & write): ${PAT_CREATE_URL}`,
              '3. Base64-encode it (macOS/Linux):',
              '```',
              PAT_BASE64_NODE_CMD,
              '```',
              '   (Windows: run `vsts-npm-auth -config .npmrc` instead of hand-editing.)',
              '4. Add this block to your **user** `~/.npmrc`, replacing BOTH placeholders with the Base64 value:',
              '```',
              userNpmrcAuthBlock(),
              '```',
              '5. Re-run `check_oneui_registry`, then `setup_oneui_project`.',
            ];

      return text(
        header +
          writeNote +
          '\n' +
          steps.join('\n') +
          `\n\n_Registry: ${REGISTRY_URL} · Feed: ${FEED_NAME}. Never commit a PAT — it lives only in ~/.npmrc._` +
          '\n\nFull reference: read the `oneui://registry-setup` resource or call `get_registry_setup`.',
      );
    },
  );

  server.registerTool(
    'get_registry_setup',
    {
      title: 'Get the full JDS feed setup guide',
      description:
        'Return the complete JDS / OneUI private-feed onboarding guide: feed identity, the access ' +
        'gate, the three connection situations, the project + user .npmrc templates, and full ' +
        'PAT creation steps (macOS/Linux + Windows). Read this when guiding a user through ' +
        'first-time feed setup.',
      inputSchema: {},
    },
    async () => {
      const doc = getRegistrySetup();
      return text(doc ?? 'Registry setup guide is not present in this snapshot.');
    },
  );
}
