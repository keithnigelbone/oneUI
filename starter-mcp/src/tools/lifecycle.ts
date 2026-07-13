/**
 * Phase 1 — project lifecycle tools.
 * setup_oneui_project · check_oneui_versions · update_oneui_packages
 */
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  detectFramework,
  detectPackageManager,
  installSpec,
  writeBrandsConfig,
  buildBrandsMap,
  patchSnippets,
  providerSnippet,
  runInstall,
  buildInstallCommands,
  DEFAULT_CDN_URL,
  type BrandsConfig,
} from '../lib/framework.js';
import {
  ONEUI_PACKAGES,
  queryVersion,
  installedVersion,
  buildUpdateCommands,
  isValidPackageName,
  resolveInstallSpecs,
} from '../lib/npm.js';
import { detectRegistryStatus, FEED_CONNECT_URL } from '../lib/registry.js';
import {
  isValidProjectName,
  detectNativeRegistry,
  buildCreateCommand,
  buildCreateCommandSkipPat,
  buildNpmrcSetupScript,
  encodePat,
  writeProjectNpmrc,
  writeStagedNewProjectNpmrc,
  buildNewProjectNpmrc,
  REDACTED_PASSWORD,
  NATIVE_REGISTRY_FEED,
  NATIVE_REGISTRY_URL,
  NATIVE_FEED_CONNECT_URL,
  NATIVE_PAT_CREATE_URL,
  CLI_PACKAGE,
  type PackageManager,
  type PatFormat,
} from '../lib/nativeCli.js';
import { PLATFORMS } from '../lib/platforms.js';
import { spawnSync } from 'node:child_process';
import { text, errorText, defaultProjectRoot } from './util.js';

export function registerLifecycleTools(server: McpServer): void {
  server.registerTool(
    'setup_oneui_project',
    {
      title: 'Set up a OneUI project',
      description:
        'Bootstrap OneUI/JDS into a React (web) project: detect the framework + package manager, ' +
        'install @jds4/oneui-react + @jds4/oneui-icons-jio + the matching bundler plugin, write ' +
        'oneui.brands.json, and return the config + <BrandProvider> snippets to paste. ' +
        'Call this first when a project does not yet have OneUI installed.',
      inputSchema: {
        projectRoot: z
          .string()
          .optional()
          .describe('Absolute path to the project root. Defaults to the current working directory.'),
        brands: z
          .array(z.string())
          .optional()
          .describe('Brand slugs to enable in oneui.brands.json. Defaults to ["jio"].'),
        cdnUrl: z.string().optional().describe(`Brand CDN base URL. Defaults to ${DEFAULT_CDN_URL}.`),
        install: z
          .boolean()
          .optional()
          .describe('Actually run the package-manager install. Default true. Set false to only write config + print commands.'),
        force: z.boolean().optional().describe('Overwrite an existing oneui.brands.json. Default false.'),
      },
    },
    async ({ projectRoot, brands, cdnUrl, install, force }) => {
      const root = defaultProjectRoot(projectRoot);
      const brandList = brands && brands.length ? brands : ['jio'];
      const cdn = cdnUrl ?? DEFAULT_CDN_URL;
      const doInstall = install ?? true;

      const { framework, reasons } = detectFramework(root);
      const pm = detectPackageManager(root);
      const spec = installSpec(framework);

      // Preflight: @jds4/* live on a private feed. Don't attempt a doomed install.
      const registry = detectRegistryStatus(root);
      const registryBlocked = doInstall && registry.status !== 'connected';

      const pinnedLine = (resolved: Record<string, string | null>): string =>
        Object.entries(resolved)
          .map(([p, v]) => `  ${p} → ${v ?? '(registry unreachable — installed unpinned)'}`)
          .join('\n');

      let installReport: string;
      let installFailed = false;
      if (registryBlocked) {
        const bare = buildInstallCommands(spec.runtime, spec.dev, pm);
        installReport =
          `SKIPPED — not connected to the JDS feed (status: \`${registry.status}\`). ` +
          `The @jds4/* packages are on a private Azure DevOps feed, so this install would fail.\n` +
          `→ Run \`check_oneui_registry\` first (confirm you can open ${FEED_CONNECT_URL}, write the ` +
          `project .npmrc, create a PAT, add the auth token to ~/.npmrc). Then re-run setup_oneui_project.\n` +
          `Once connected, setup resolves and pins the NEWEST published version of each package:\n` +
          `${bare.map((c) => `  ${c}`).join('\n')}`;
      } else if (doInstall) {
        // Resolve each package independently to its highest published version
        // (incl. prereleases) and pin it — never a bare install / "latest" tag.
        const runtime = resolveInstallSpecs(root, spec.runtime);
        const dev = resolveInstallSpecs(root, spec.dev);
        const res = runInstall(root, runtime.specs, dev.specs, pm);
        installFailed = !res.ok;
        const resolvedAll = { ...runtime.resolved, ...dev.resolved };
        installReport = res.ok
          ? `Installed OK via ${pm}, pinned to newest published:\n${pinnedLine(resolvedAll)}\n\n${res.commands.map((c) => `  ${c}`).join('\n')}`
          : `Install FAILED. Run manually:\n${res.commands.map((c) => `  ${c}`).join('\n')}\n\n` +
            `(If this is a 401/404, you may not be connected to the JDS feed — run \`check_oneui_registry\`.)\n\nOutput:\n${res.output}`;
      } else {
        // install=false: resolve + show the pinned commands without running them.
        const runtime = resolveInstallSpecs(root, spec.runtime);
        const dev = resolveInstallSpecs(root, spec.dev);
        const cmds = buildInstallCommands(runtime.specs, dev.specs, pm);
        installReport = `Skipped install (install=false). Run manually (pinned to newest published):\n${cmds.map((c) => `  ${c}`).join('\n')}`;
      }

      const config: BrandsConfig = { cdnUrl: cdn, brands: buildBrandsMap(brandList) };
      const wrote = writeBrandsConfig(root, config, force ?? false);

      const { configFile, snippet } = patchSnippets(framework);

      const report = [
        `# OneUI setup`,
        ``,
        `**Project:** ${root}`,
        `**Framework:** ${framework} (${reasons.join('; ')})`,
        `**Package manager:** ${pm}`,
        `**Brands:** ${brandList.join(', ')}`,
        `**JDS feed:** \`${registry.status}\`${registry.status !== 'connected' ? ' — run `check_oneui_registry` first' : ''}`,
        ``,
        `## 1. Packages`,
        installReport,
        ``,
        `## 2. oneui.brands.json`,
        wrote.written
          ? `Wrote ${wrote.path}:\n\`\`\`json\n${JSON.stringify(config, null, 2)}\n\`\`\``
          : `NOT written — ${wrote.reason}. Existing file left untouched (pass force=true to overwrite).`,
        ``,
        `## 3. Config to paste into ${configFile}`,
        '```',
        snippet,
        '```',
        ``,
        `## 4. Wrap your app`,
        '```tsx',
        providerSnippet(brandList[0]),
        '```',
        ``,
        `## 5. Guardrails`,
        `- **Versions:** setup pins each package to its HIGHEST published version (resolved from the full`,
        `  \`npm view <pkg> versions --json\` list — incl. prereleases). Do NOT bare-install or use \`@latest\`/`,
        `  \`"latest"\`: the \`latest\` dist-tag can lag behind the newest alpha (it pointed at alpha.0 while`,
        `  alpha.5 was newest). \`"latest"\` is only the brand CDN version in oneui.brands.json.`,
        `- **Icons:** use ONLY \`@jds4/oneui-icons-jio\` via \`<Icon icon="..." />\`. Do NOT install`,
        `  hugeicons-react, @phosphor-icons/react, @tabler/icons-react, @remixicon/react, or lucide-react.`,
        ``,
        `> Verify by rendering <Icon name="home" /> inside <BrandProvider brand="${brandList[0]}">.`,
      ].join('\n');

      return installFailed ? errorText(report) : text(report);
    },
  );

  server.registerTool(
    'check_oneui_versions',
    {
      title: 'Check OneUI package versions',
      description:
        'Report installed vs newest available versions for the OneUI/JDS packages. ' +
        'The install target is the HIGHEST published version overall (from the full versions list, ' +
        'incl. prereleases) — not the `latest` dist-tag, which can lag. Does not modify anything.',
      inputSchema: {
        projectRoot: z.string().optional().describe('Project root. Defaults to cwd.'),
      },
    },
    async ({ projectRoot }) => {
      const root = defaultProjectRoot(projectRoot);
      const rows = ONEUI_PACKAGES.map((pkg) => queryVersion(root, pkg)).filter(
        (r) => r.installed !== null || r.resolved !== null,
      );
      if (rows.length === 0) {
        return text('No OneUI packages found installed, and the registry could not be reached.');
      }
      const lines = [
        '| Package | Installed | Newest (incl. prerelease) | Latest stable | `latest` tag | Would install |',
        '| --- | --- | --- | --- | --- | --- |',
        ...rows.map(
          (r) =>
            `| ${r.pkg} | ${r.installed ?? '—'} | ${r.latestAny ?? '—'} | ${r.latestStable ?? '—'} | ${r.latestTag ?? '—'} | ${r.resolved ?? '—'}${r.resolvedIsPrerelease ? ' (prerelease)' : ''} |`,
        ),
      ];
      const stale = rows.filter((r) => r.installed && r.resolved && r.installed !== r.resolved);
      const footer = stale.length
        ? `\n${stale.length} package(s) can be updated. Run update_oneui_packages.`
        : `\nAll installed OneUI packages are up to date.`;
      return text(lines.join('\n') + '\n' + footer);
    },
  );

  server.registerTool(
    'update_oneui_packages',
    {
      title: 'Update OneUI packages',
      description:
        'Update installed OneUI/JDS packages to the NEWEST published version (highest semver from the ' +
        'full versions list, incl. prereleases — today everything is 0.1.0-alpha.x). Each package is ' +
        'resolved independently. Updates only packages already present in the project unless `packages` is given.',
      inputSchema: {
        projectRoot: z.string().optional().describe('Project root. Defaults to cwd.'),
        packages: z
          .array(z.string())
          .optional()
          .describe('Specific OneUI packages to update. Defaults to all currently-installed ones.'),
        dryRun: z.boolean().optional().describe('Only show the commands; do not run them. Default false.'),
      },
    },
    async ({ projectRoot, packages, dryRun }) => {
      const root = defaultProjectRoot(projectRoot);
      const candidates = packages && packages.length ? packages : ONEUI_PACKAGES;
      // User-supplied names go into a spawn argv — reject anything malformed.
      const invalid = candidates.filter((c) => !isValidPackageName(c));
      if (invalid.length) {
        return errorText(
          `Invalid package name(s): ${invalid.map((n) => `"${n}"`).join(', ')}. ` +
            'Pass bare npm package names (e.g. "@jds4/oneui-react") — versions are resolved automatically.',
        );
      }
      const targets: { pkg: string; version: string; note: string }[] = [];

      for (const pkg of candidates) {
        const installed = installedVersion(root, pkg);
        if (!packages && installed === null) continue; // skip non-installed unless explicit
        const info = queryVersion(root, pkg);
        const target = info.resolved; // highest published version (incl. prereleases)
        if (!target) continue;
        if (installed === target) continue;
        targets.push({
          pkg,
          version: target,
          note: info.resolvedIsPrerelease ? 'prerelease' : 'stable',
        });
      }

      if (targets.length === 0) {
        return text('Nothing to update — all targeted OneUI packages are already current.');
      }

      const commands = buildUpdateCommands(root, targets.map((t) => `${t.pkg}@${t.version}`));
      const plan = [
        '## Update plan',
        ...targets.map((t) => `- ${t.pkg} → ${t.version} (${t.note})`),
        '',
        '## Commands',
        ...commands.map((c) => `  ${c.display}`),
      ].join('\n');

      if (dryRun) return text(plan + '\n\n(dry run — not executed)');

      let output = '';
      let ok = true;
      for (const cmd of commands) {
        // Argv array straight from buildUpdateCommands — no re-splitting of a
        // display string (word-splitting breaks on any arg containing spaces).
        const res = spawnSync(cmd.bin, cmd.args, { cwd: root, encoding: 'utf8' });
        output += `$ ${cmd.display}\n${res.stdout ?? ''}${res.stderr ?? ''}\n`;
        if (res.status !== 0) {
          ok = false;
          break;
        }
      }
      return ok
        ? text(plan + '\n\nDone.\n' + output)
        : errorText(plan + '\n\nUpdate failed:\n' + output);
    },
  );

  server.registerTool(
    'create_oneui_native_app',
    {
      title: 'Create a OneUI Native (Expo) app',
      description:
        'Generate a brand-new React Native app (Expo Router) pre-wired with OneUI Native ' +
        `(${PLATFORMS.reactnative.runtimePackage} + ${PLATFORMS.reactnative.iconsPackage} + @oneui/native-cdn, ` +
        'OneUIBrandProvider, JioType fonts, a surface-context demo screen) via the standalone ' +
        `\`${CLI_PACKAGE}\` CLI on the private ${NATIVE_REGISTRY_FEED} feed. The CLI + @oneui/* runtime ` +
        'live on that feed, so a `.npmrc` with feed auth (a PAT) is required FIRST. ' +
        'There are TWO ways to do this, and the user MUST choose: `mode:"terminal"` — the tool returns ' +
        'every command (PAT → .npmrc → generator → run) for the USER to run in their own terminal, ' +
        'consuming ZERO further tokens and keeping the PAT entirely on their machine; or `mode:"ai"` — ' +
        'the user supplies their PAT (raw or base64) and the AGENT does everything (writes .npmrc, runs ' +
        'the generator), which burns tokens. Call this tool WITHOUT `mode` first: it returns a choice ' +
        'prompt — present it to the user and re-invoke with the chosen `mode`. NEVER invent the PAT.',
      inputSchema: {
        projectName: z
          .string()
          .describe('Name of the new app and its directory (lowercase letters, numbers, ., -, _; ≤64 chars).'),
        mode: z
          .enum(['terminal', 'ai'])
          .optional()
          .describe(
            'Setup path. "terminal" = tool returns all commands for the USER to run (zero further ' +
              'tokens, PAT never leaves their machine). "ai" = agent writes .npmrc from the user-supplied ' +
              '`pat` and runs the generator (consumes tokens). OMIT to get a choice prompt to put to the user.',
          ),
        cwd: z
          .string()
          .optional()
          .describe('Directory the app will be created in (the .npmrc is written here). Defaults to cwd.'),
        packageManager: z
          .enum(['npm', 'pnpm', 'yarn', 'bun'])
          .optional()
          .describe('Package manager the CLI should use (adds --use-<pm>). Default npm.'),
        pat: z
          .string()
          .optional()
          .describe(
            'Required for `mode:"ai"`. The Azure DevOps Personal Access Token (Packaging: Read), ' +
              'collected from the user. Written into the .npmrc `_password`. Never invent or reuse one.',
          ),
        patFormat: z
          .enum(['raw', 'base64'])
          .optional()
          .describe(
            'Required for `mode:"ai"` — the user must STATE the type: `raw` (token exactly as Azure ' +
              'DevOps shows it — will be base64-encoded) or `base64` (already encoded). No default; if ' +
              'omitted the tool asks the user to specify it.',
          ),
      },
    },
    async ({ projectName, mode, cwd, packageManager, pat, patFormat }) => {
      if (!isValidProjectName(projectName)) {
        return errorText(
          `Invalid project name "${projectName}". Use lowercase letters, numbers, hyphens, dots, or underscores (≤64 chars).`,
        );
      }
      const root = defaultProjectRoot(cwd);
      const pm = (packageManager as PackageManager | undefined) ?? 'npm';
      const command = buildCreateCommand(projectName, pm);

      // No mode → make the agent ask the user which path to take before doing anything.
      if (!mode) {
        return text(
          [
            `# create_oneui_native_app — choose how to set up \`${projectName}\``,
            ``,
            `Creating this React Native app needs feed auth (a PAT) + the \`${CLI_PACKAGE}\` generator.`,
            `**Ask the user which path they want**, then re-invoke this tool with \`mode\`:`,
            ``,
            `- **\`mode:"terminal"\`** — **Zero extra tokens.** The tool returns every command and the`,
            `  USER runs them in their own terminal. The PAT never leaves their machine. Best default.`,
            `- **\`mode:"ai"\`** — **Consumes tokens.** The user provides their PAT (\`pat\` + \`patFormat\`)`,
            `  and the agent writes \`.npmrc\` and runs the generator for them.`,
            ``,
            `→ Put this choice to the user now, then re-invoke with the chosen \`mode\` (and \`pat\` for "ai").`,
          ].join('\n'),
        );
      }

      // ── Terminal approach ──────────────────────────────────────────────────────
      // Emit every command; the USER runs them. Nothing runs through the agent/MCP,
      // so the PAT never leaves their machine and no further tokens are spent.
      if (mode === 'terminal') {
        const reg = detectNativeRegistry(root);
        return text(
          [
            `# create_oneui_native_app — terminal approach (zero extra tokens)`,
            ``,
            `**App:** \`${projectName}\`  ·  **Package manager:** ${pm}`,
            `**Feed:** \`${NATIVE_REGISTRY_FEED}\` (${NATIVE_REGISTRY_URL})`,
            `**Existing feed auth detected in ${root}:** ${reg.connected ? 'yes ✓ — skip to step 3' : 'no'}`,
            ``,
            `Run all of this yourself in your terminal — nothing goes through the agent or MCP, so your`,
            `PAT never leaves your machine.`,
            ``,
            `## 1. Get a PAT (one-time)`,
            `1. Open the feed connect page: ${NATIVE_FEED_CONNECT_URL}`,
            `2. Create a Personal Access Token with **Packaging: Read** at: ${NATIVE_PAT_CREATE_URL}`,
            ``,
            `## 2. Write \`.npmrc\` (in the directory you'll create the app in)`,
            `Paste this whole block. It prompts for raw|base64, reads the token with input hidden, and`,
            `writes \`.npmrc\`:`,
            '```bash',
            buildNpmrcSetupScript(),
            '```',
            ``,
            `## 3. Generate the app`,
            '```bash',
            command,
            '```',
            ``,
            `## 4. After it finishes`,
            '```bash',
            `rm .npmrc   # remove the bootstrap PAT — ${projectName}/.npmrc carries feed auth`,
            `cd ${projectName}`,
            `npx oneui-native-cdn prefetch   # fetch brand data (also runs on dev start)`,
            pm === 'yarn' ? 'yarn ios' : `${pm} run ios`,
            '```',
            ``,
            `> Edit \`oneui.brands.json\` to add brands/sub-brands, then re-run \`${pm} run prefetch\`.`,
          ].join('\n'),
        );
      }

      // ── AI approach ────────────────────────────────────────────────────────────
      // Collect all three inputs from the user: app name (already required by schema),
      // the PAT, and the PAT type. Missing PAT or type → ask before writing anything.
      if (!pat || !pat.trim() || !patFormat) {
        const missing = [
          !pat || !pat.trim() ? '`pat` (the token itself)' : null,
          !patFormat ? '`patFormat` (whether the token is `raw` or `base64`)' : null,
        ].filter(Boolean);
        return text(
          [
            `# create_oneui_native_app — AI approach needs more input`,
            ``,
            `**App:** \`${projectName}\` ✓`,
            `**Missing:** ${missing.join(' and ')}`,
            ``,
            `To let the agent do everything, the user must provide their Azure DevOps PAT **and state its`,
            `type**. **Never invent or reuse a token.**`,
            ``,
            `## Get a PAT (one-time)`,
            `1. Open the feed connect page: ${NATIVE_FEED_CONNECT_URL}`,
            `2. Create a Personal Access Token with **Packaging: Read** at: ${NATIVE_PAT_CREATE_URL}`,
            ``,
            `## Ask the user, then re-call \`mode:"ai"\` with all inputs`,
            `- \`projectName\`: \`${projectName}\``,
            `- \`pat\`: the token they paste`,
            `- \`patFormat\`: **\`raw\`** if it's the token exactly as Azure DevOps shows it (we base64-encode`,
            `  it) — or **\`base64\`** if they already encoded it themselves`,
            ``,
            `> Prefer not to share the token with the agent? Use \`mode:"terminal"\` instead — zero tokens,`,
            `> and the PAT stays on your machine.`,
          ].join('\n'),
        );
      }

      // Have app name + PAT + explicit type → write the bootstrap .npmrc (authenticates
      // the npx fetch of the CLI itself), run the generator with --skip-pat --yes so it
      // scaffolds without an interactive PAT prompt, then write the real project .npmrc.
      //
      // We cannot pipe answers via heredoc: the CLI's password prompt uses
      // process.stdin.setRawMode(true), which requires a real TTY. Piped stdin causes
      // "setRawMode is not supported on this terminal". --skip-pat avoids the prompt
      // entirely and writes a stub .npmrc; we overwrite it with the real token after.
      const format: PatFormat = patFormat;
      const passwordBase64 = encodePat(pat, format);
      // Both files carry the real token but are written to DISK — the token is
      // never placed in this tool result (which lands in the agent transcript/logs).
      const wrote = writeProjectNpmrc(root, passwordBase64);
      const staged = writeStagedNewProjectNpmrc(root, passwordBase64);
      const aiCommand = buildCreateCommandSkipPat(projectName, pm);
      const projectDir = `${root}/${projectName}`;
      const projectNpmrcPath = `${projectDir}/.npmrc`;

      return text(
        [
          `# create_oneui_native_app — AI approach`,
          ``,
          `**App:** \`${projectName}\`  ·  **Package manager:** ${pm}`,
          `**Feed:** \`${NATIVE_REGISTRY_FEED}\` (${NATIVE_REGISTRY_URL})`,
          ``,
          `## 1. Wrote auth files to disk ✓ (token NOT shown here)`,
          `${wrote.overwrote ? 'Overwrote' : 'Wrote'} the bootstrap \`${wrote.path}\` (global ` +
            `\`registry=\` + auth block) so \`npx\` can fetch the \`${CLI_PACKAGE}\` CLI from the private feed.`,
          `Also staged the real scoped project \`.npmrc\` at \`${staged.path}\` (PAT ` +
            `${format === 'raw' ? 'base64-encoded from raw' : 'used as-is'}).`,
          ``,
          `> **Security:** the base64 PAT is on disk in the two files above and is deliberately ` +
            `**not printed** in this response. Do NOT paste the token into any file yourself — just ` +
            `move the staged file in step 3. Both files are removed/moved by step 3.`,
          ``,
          `## 2. Agent: run the generator now`,
          `Run this from \`${root}\`. \`--skip-pat\` skips the CLI's raw-mode TTY password prompt`,
          `(which cannot run in a non-TTY shell) and writes a stub \`.npmrc\` inside the new project.`,
          `\`--yes\` enables CI mode — no other interactive prompts.`,
          '```bash',
          aiCommand,
          '```',
          ``,
          `## 3. Agent: move the pre-written auth file into the app`,
          `After the generator exits successfully, MOVE the staged \`.npmrc\` over the stub the`,
          `generator wrote — a single command, no token handling:`,
          '```bash',
          `mv ${staged.path} ${projectNpmrcPath}`,
          '```',
          `For reference, the file's structure (token redacted — the on-disk copy has the real value):`,
          '```',
          buildNewProjectNpmrc(REDACTED_PASSWORD),
          '```',
          `Then remove the bootstrap file:`,
          '```bash',
          `rm ${root}/.npmrc`,
          '```',
          ``,
          `## 4. Finish up`,
          '```bash',
          `cd ${projectName} && npx oneui-native-cdn prefetch`,
          '```',
          `Tell the user to launch with \`${pm === 'yarn' ? 'yarn ios' : `${pm} run ios`}\`.`,
          `Editing \`oneui.brands.json\` + re-running \`${pm} run prefetch\` adds brands/sub-brands.`,
          ``,
          `> If the generator fails (network error fetching CLI from the private feed), fall back to`,
          `> \`mode:"terminal"\` so the user runs it in their own terminal.`,
          `> If you abort before step 3, delete the staged secret: \`rm ${staged.path}\`.`,
        ].join('\n'),
      );
    },
  );
}
