/**
 * figma_to_code — fetch the design data behind a Figma frame and (optionally)
 * generate the @oneui/ui-native screen.
 *
 * Returns ONE nested hierarchy merging what a developer reads from Dev mode →
 * Inspect:
 *   1. Component Information — each component's prop values (`componentProperties`).
 *   2. Modes — the node's resolved variable-collection modes (`appearance`,
 *      `surface`, brand, colour mode). In OneUI files these are NOT props and NOT
 *      local variables — only readable via the Plugin API's resolvedVariableModes.
 *
 * The refined tree also carries visible text (`text`), token-based placement
 * (`layout`: direction + gap/padding as spacing-token KEYS resolved from the bound
 * dimension-scale variables, plus cornerRadius/absoluteBox), and geometry (`box`).
 *
 * Images are downloaded inline (into `assetsDir`, default `assets/images/<screen>/`)
 * and backfilled onto each Image/Avatar node's `props.src`. Codegen is ON by
 * default: a complete `.native.tsx` is generated and written to `outDir`. Pass
 * `codegen=false` to instead get the enriched tree + build instructions for the
 * agent to author the screen.
 *
 * For React Native, `brand`+`subBrand` are required and ensured in
 * `oneui.brands.json` (subBrand is the `<OneUIBrandProvider theme=…>` value).
 *
 * REQUIRES the Figma Desktop Bridge plugin connected, and FIGMA_ACCESS_TOKEN set
 * for image download. The user must run ONLY oneui-mcp (no standalone
 * figma-console) or the bridge attaches to the wrong server (port contention).
 */
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { callFigmaConsole, resultToText, FigmaConsoleError } from '../lib/figmaConsole.js';
import { ensureBridge, executeSnippet, ownBridgeEnabled, bridgeModeLabel, type BridgeResult } from '../lib/figmaBridge.js';
import { buildModesSnippet } from '../lib/figmaModesSnippet.js';
import { refineExtraction, applyImageSources, type RawNode } from '../lib/figmaRefine.js';
import { downloadImages, slugify as assetSlugify } from '../lib/figmaAssets.js';
import { generateNativeScreen, generateRouteFiles } from '../lib/figmaCodegen.js';
import { ensureBrandSubBrand } from '../lib/brandsConfig.js';
import { resolvePlatform } from '../lib/platforms.js';
import { text, errorText, json, defaultProjectRoot } from './util.js';

interface ParsedFigmaUrl {
  fileKey: string | null;
  nodeId: string | null;
}

/**
 * Pull the file key and (URL-encoded) node id out of a Figma URL.
 * Figma encodes the node id's `:` as `-` in the query string
 * (e.g. node `695:313` → `node-id=695-313`), so we convert it back.
 */
export function parseFigmaUrl(url: string): ParsedFigmaUrl {
  const fileKey = url.match(/\/(?:file|design|board|proto)\/([A-Za-z0-9]+)/)?.[1] ?? null;
  let nodeId: string | null = null;
  const m = url.match(/[?&]node-id=([^&]+)/);
  if (m) nodeId = decodeURIComponent(m[1]).replace(/-/g, ':');
  return { fileKey, nodeId };
}

/** Run the modes+props snippet once and return the merged hierarchy (or an error). */
async function extractHierarchy(
  nodeId: string,
  maxNodes: number,
  maxDepth: number,
): Promise<{ hierarchy: unknown; error: string | null }> {
  try {
    const code = buildModesSnippet(nodeId, { maxNodes, maxDepth });
    const out = await executeSnippet(code, 30000);
    if (out.ok) return { hierarchy: out.value, error: null };
    return { hierarchy: null, error: typeof out.value === 'string' ? out.value : json(out.value) };
  } catch (err) {
    const msg =
      err instanceof FigmaConsoleError ? err.message : err instanceof Error ? err.message : String(err);
    return { hierarchy: null, error: msg };
  }
}

const BRIDGE_TROUBLESHOOT =
  '**Troubleshooting:** ensure the Figma Desktop Bridge plugin is running and connected to THIS server ' +
  '(this server auto-reclaims the pinned bridge port `FIGMA_WS_PORT`, default 9223, from stray ' +
  'figma-console instances), and that the node id exists in the open file. Run `ensure_figma_bridge` ' +
  'to verify the connection before extracting.';

/** Render a bridge-ensure result as Markdown lines (shared by the preflight tool + fail-fast). */
function renderBridgeResult(r: BridgeResult): string[] {
  const lines: string[] = [];
  if (r.connected) {
    lines.push(`✅ **Figma Desktop Bridge connected**${r.file ? ` — file: \`${r.file}\`` : ''}.`);
    if (r.competitors.length) {
      lines.push(
        '',
        `Found **${r.competitors.length}** competing figma-console instance(s) on the bridge ports ` +
          `(reclaimed the pinned port): ` +
          r.competitors.map((c) => `\`pid ${c.pid}@${c.port}\``).join(', ') + '.',
      );
    }
    return lines;
  }
  lines.push(`❌ **Figma Desktop Bridge not connected.**`, '', r.message);
  if (r.competitors.length) {
    lines.push(
      '',
      `**Competing figma-console instances found:** ` +
        r.competitors.map((c) => `\`pid ${c.pid}@${c.port}\``).join(', ') + '.',
    );
  }
  if (r.recovery.length) {
    lines.push('', '**To recover:**', ...r.recovery.map((s, i) => `${i + 1}. ${s}`));
  }
  return lines;
}

export function registerFigmaTools(server: McpServer): void {
  server.registerTool(
    'ensure_figma_bridge',
    {
      title: 'Figma → OneUI: verify (and recover) the Figma bridge connection',
      description:
        'Preflight check for the Figma bridge. Probes whether the bridge plugin is connected to THIS server. ' +
        'With the default figma-console backend, it reclaims the pinned WS port (default 9223) from any stray ' +
        'figma-console instances, respawns the child, and polls ~15s for the plugin to auto-reconnect. With the ' +
        'OneUI-owned bridge (`ONEUI_FIGMA_BRIDGE_OWN=1`) it starts our WS server and waits for the OneUI Figma ' +
        'Bridge plugin to connect. Reports whether the bridge is connected, which file it is attached to, any ' +
        'competing instances reclaimed, or the exact recovery steps. Run this BEFORE `figma_to_code`.',
      inputSchema: {
        reclaim: z
          .boolean()
          .optional()
          .default(true)
          .describe('(figma-console backend) Reclaim the pinned bridge port from stray instances if not connected. Default true.'),
        timeoutMs: z
          .number()
          .int()
          .min(1000)
          .max(60000)
          .optional()
          .default(15000)
          .describe('How long (ms) to poll for the plugin to connect. Default 15000.'),
      },
    },
    async ({ reclaim = true, timeoutMs = 15000 }) => {
      let result: BridgeResult;
      try {
        result = await ensureBridge({ reclaim, timeoutMs });
      } catch (err) {
        return errorText(
          `# ensure_figma_bridge failed\n\nCould not probe the bridge: ${err instanceof Error ? err.message : String(err)}\n\n${BRIDGE_TROUBLESHOOT}`,
        );
      }
      const body = [
        `# Figma bridge status (${bridgeModeLabel()})`,
        '',
        ...renderBridgeResult(result),
      ].join('\n');
      return result.connected ? text(body) : errorText(body);
    },
  );

  server.registerTool(
    'figma_download_images',
    {
      title: 'Figma → OneUI: download image assets from a Figma frame',
      description:
        'Standalone tool to download all image assets (Image, Avatar with content=image, IMAGE fills, Logo ' +
        'wordmarks) from a Figma frame into a local directory. Returns the node-id → saved-path map so you can ' +
        'reference the files in generated code. Icons are NEVER downloaded — they come from the OneUI icon ' +
        'library. Requires the Figma Desktop Bridge plugin connected and FIGMA_ACCESS_TOKEN set. ' +
        'Use this when you want to fetch assets independently of (or before) running `figma_to_code`, or to ' +
        're-download assets at a different scale/format without re-extracting the whole frame.',
      inputSchema: {
        figmaUrl: z
          .string()
          .url()
          .describe('Figma frame/component URL with node-id, e.g. https://www.figma.com/design/<key>/<name>?node-id=273-23740'),
        outDir: z
          .string()
          .optional()
          .default('assets/figma')
          .describe('Directory (relative to projectRoot) to write downloaded images. Default "assets/figma".'),
        projectRoot: z
          .string()
          .optional()
          .describe('Project root for resolving outDir. Defaults to cwd.'),
        platform: z
          .enum(['reactnative', 'react'])
          .optional()
          .default('reactnative')
          .describe('Target platform — affects which component mappings are recognised during extraction. Default "reactnative".'),
        scale: z
          .number()
          .min(1)
          .max(4)
          .optional()
          .default(2)
          .describe('Render scale for downloaded images (1–4). Default 2.'),
        format: z
          .enum(['png', 'jpg', 'svg'])
          .optional()
          .default('png')
          .describe('Image format. Default "png".'),
        maxNodes: z.number().int().min(1).max(2000).optional().default(600).describe('Cap on nodes walked (default 600).'),
        maxDepth: z.number().int().min(1).max(24).optional().default(16).describe('Max tree depth (default 16).'),
      },
    },
    async ({ figmaUrl, outDir = 'assets/figma', projectRoot, platform = 'reactnative', scale = 2, format = 'png', maxNodes = 600, maxDepth = 16 }) => {
      const { fileKey, nodeId } = parseFigmaUrl(figmaUrl);

      if (!fileKey) {
        return errorText(
          `Could not parse a Figma file key from the URL: ${figmaUrl}\n` +
            'Expected a URL like https://www.figma.com/design/<fileKey>/<name>?node-id=273-23740',
        );
      }
      if (!nodeId) {
        return errorText(
          `No node id found. The URL must include a frame/component selection (a "node-id=..." query param). URL: ${figmaUrl}`,
        );
      }

      const token = process.env.FIGMA_ACCESS_TOKEN;
      if (!token) {
        return errorText(
          `FIGMA_ACCESS_TOKEN is not set on this server — image download is not possible without it. ` +
            `Set FIGMA_ACCESS_TOKEN in the MCP server environment and retry.`,
        );
      }

      // Preflight: fail fast if bridge isn't connected.
      const bridge = await ensureBridge();
      if (!bridge.connected) {
        return errorText(
          [
            '# figma_download_images — bridge not ready',
            '',
            `- **File key:** \`${fileKey}\``,
            `- **Node id:** \`${nodeId}\``,
            '',
            ...renderBridgeResult(bridge),
            '',
            BRIDGE_TROUBLESHOOT,
          ].join('\n'),
        );
      }

      // Extract hierarchy to identify image-bearing nodes.
      const { hierarchy, error: hierarchyError } = await extractHierarchy(nodeId, maxNodes, maxDepth);
      if (!hierarchy && hierarchyError) {
        return errorText(
          [
            `# figma_download_images — extraction failed`,
            ``,
            `- **File key:** \`${fileKey}\``,
            `- **Node id:** \`${nodeId}\``,
            ``,
            `Could not extract the component hierarchy:`,
            '```',
            hierarchyError,
            '```',
            ``,
            BRIDGE_TROUBLESHOOT,
          ].join('\n'),
        );
      }

      const resolved = resolvePlatform(platform, { allowPlanned: true });
      const platformId = resolved.ok ? resolved.pack.id : 'reactnative';
      const refined = refineExtraction(hierarchy as { base?: Record<string, string>; tree?: RawNode | null }, platformId);

      if (refined.images.length === 0) {
        return text(
          [
            '# figma_download_images',
            '',
            `- **File key:** \`${fileKey}\``,
            `- **Node id:** \`${nodeId}\``,
            '',
            'No image assets found in this frame (Image, Avatar with content=image, IMAGE fills, or Logo wordmarks). ' +
              'Icons are intentionally excluded — they come from the OneUI icon library.',
          ].join('\n'),
        );
      }

      const root = defaultProjectRoot(projectRoot);
      const dl = await downloadImages({ fileKey, token, images: refined.images, assetsDir: outDir, projectRoot: root, scale, format });

      const idToPath: Record<string, string> = {};
      for (const [id, relPath] of dl.byId) idToPath[id] = relPath;
      const missing = refined.images.filter((i) => !dl.byId.has(i.id));

      const lines = [
        '# figma_download_images',
        '',
        `- **File key:** \`${fileKey}\``,
        `- **Node id:** \`${nodeId}\``,
        `- **Images found:** ${refined.images.length}`,
        `- **Downloaded:** ${dl.downloaded.length}${dl.reused.length ? ` (+ ${dl.reused.length} reused from \`${outDir}/\`)` : ''}${missing.length ? ` — **${missing.length} MISSING**` : ''}`,
        `- **Output dir:** \`${outDir}/\``,
        '',
      ];

      if (dl.downloaded.length) {
        lines.push('## Downloaded assets', '', ...dl.downloaded.map((d) => `- \`${d.relPath}\`  ← node \`${d.id}\``), '');
      }
      if (dl.reused.length) {
        lines.push('## Reused existing assets (not re-downloaded)', '', ...dl.reused.map((d) => `- \`${d.relPath}\`  ← node \`${d.id}\``), '');
      }
      if (dl.errors.length) {
        lines.push('## Errors', '', ...dl.errors.map((e) => `- ${e}`), '');
      }
      if (missing.length) {
        lines.push(
          '## Missing assets',
          '',
          ...missing.map((i) => `- node \`${i.id}\` (\`${i.component}\`) — no download and no matching file in \`${outDir}/\``),
          '',
          'These nodes have NO local asset — the generated/authored code will render them blank. ' +
            'Fix the download errors above (token/file access) and re-run, or place a matching ' +
            '`<name>-*.png` file in the output dir.',
          '',
        );
      }

      lines.push(
        '## Node-id → path map',
        '',
        '```json',
        JSON.stringify(idToPath, null, 2),
        '```',
      );

      return text(lines.join('\n'));
    },
  );

  server.registerTool(
    'figma_to_code',
    {
      title: 'Figma → OneUI: extract design + (optionally) generate @oneui/ui-native screen',
      description:
        'Given a Figma frame/component URL, extract the design data needed to build OneUI code as one nested ' +
        'hierarchy: every component node carries its prop values (componentProperties), resolved appearance + ' +
        'surface (Dev-mode "Modes"), visible text (`text`), token-based placement (`layout`: direction + ' +
        'gap/padding as spacing-token KEYS resolved from the bound dimension-scale variables, plus ' +
        'cornerRadius/absoluteBox) and geometry (`box`). Images are downloaded inline into `assetsDir` ' +
        '(default `assets/images/<screen-slug>/`) and each Image/Avatar `props.src` is backfilled. Codegen is ' +
        'ON by default — a complete `.native.tsx` is written to `outDir` (token-only: <Container>/<Surface> ' +
        'layout props, no literals); pass `codegen=false` to instead return the enriched tree for manual authoring. REQUIRES ' +
        'figmaUrl, platform, brand, subBrand. For "reactnative" it ensures brand+subBrand in oneui.brands.json ' +
        '(subBrand = the `theme` prop for <OneUIBrandProvider>). REQUIRES the Figma Desktop Bridge plugin ' +
        'connected and FIGMA_ACCESS_TOKEN set; no standalone figma-console MCP running (port contention).',
      inputSchema: {
        figmaUrl: z
          .string()
          .url()
          .describe('Figma frame/component URL, e.g. https://www.figma.com/design/<key>/<name>?node-id=273-23740'),
        platform: z
          .enum(['reactnative', 'react'])
          .describe('REQUIRED. Target platform: "reactnative" (@oneui/ui-native) or "react" (web).'),
        brand: z
          .string()
          .describe('REQUIRED. Brand slug, e.g. "jio". For reactnative, ensured present in oneui.brands.json.'),
        subBrand: z
          .string()
          .describe(
            'REQUIRED. Sub-brand slug, e.g. "jiomart". For reactnative it is ensured under the brand\'s ' +
              '`subBrands` in oneui.brands.json, and is the value to pass as the `theme` prop of ' +
              '<OneUIBrandProvider> in the generated TSX.',
          ),
        codegen: z
          .boolean()
          .optional()
          .default(true)
          .describe(
            'Generate a @oneui/ui-native screen .native.tsx from the refined tree and write it to outDir. ' +
              'ON by default. Pass false to instead return the enriched tree + instructions for the agent to author the screen.',
          ),
        outDir: z
          .string()
          .optional()
          .default('src/screens')
          .describe('Directory (relative to projectRoot) to write the generated .native.tsx. Only used when codegen=true.'),
        screenName: z
          .string()
          .optional()
          .describe('Name for the generated screen component (PascalCase). Defaults to the Figma node name. codegen only.'),
        route: z
          .boolean()
          .optional()
          .default(true)
          .describe('When codegen=true, also write an expo-router route (src/app/<kebab>.tsx) that renders the screen.'),
        setIndex: z
          .boolean()
          .optional()
          .default(false)
          .describe('When route is written, also point src/app/index.tsx at it (Redirect) so the app boots into the screen.'),
        assetsDir: z
          .string()
          .optional()
          .describe(
            'Directory (relative to projectRoot) to write downloaded images. Defaults to ' +
              '`assets/images/<screen-slug>/` (slug derived from screenName / the Figma frame name).',
          ),
        scale: z
          .number()
          .min(1)
          .max(4)
          .optional()
          .default(2)
          .describe('Render scale for downloaded images (1–4). Default 2.'),
        nodeId: z
          .string()
          .optional()
          .describe("Override the node id (colon form, e.g. '273:23740'). Defaults to the node-id parsed from figmaUrl."),
        maxNodes: z.number().int().min(1).max(2000).optional().default(600).describe('Cap on nodes walked (default 600).'),
        maxDepth: z.number().int().min(1).max(24).optional().default(16).describe('Max tree depth (default 16).'),
        refine: z
          .boolean()
          .optional()
          .default(true)
          .describe('Return the TSX-ready refined tree (registered components in full, surfaces as <Surface mode>). Default true.'),
        projectRoot: z
          .string()
          .optional()
          .describe('Project root for resolving oneui.brands.json, assetsDir and outDir. Defaults to cwd.'),
        includeRaw: z
          .boolean()
          .optional()
          .default(false)
          .describe('Also include the raw (pre-refine) extraction hierarchy. Off by default.'),
        includeRawTree: z
          .boolean()
          .optional()
          .default(false)
          .describe('Also include the raw deep node tree (visual props, geometry, boundVariable IDs). Large — off by default.'),
      },
    },
    async ({
      figmaUrl,
      platform,
      brand,
      subBrand,
      codegen = true,
      outDir = 'src/screens',
      screenName,
      route = true,
      setIndex = false,
      assetsDir,
      scale = 2,
      nodeId: nodeIdOverride,
      maxNodes = 600,
      maxDepth = 16,
      refine = true,
      projectRoot,
      includeRaw = false,
      includeRawTree = false,
    }) => {
      const { fileKey, nodeId: parsedNodeId } = parseFigmaUrl(figmaUrl);
      const nodeId = nodeIdOverride ?? parsedNodeId;

      if (!fileKey) {
        return errorText(
          `Could not parse a Figma file key from the URL: ${figmaUrl}\n` +
            'Expected a URL like https://www.figma.com/design/<fileKey>/<name>?node-id=273-23740',
        );
      }
      if (!nodeId) {
        return errorText(
          `No node id found. The URL must include a frame/component selection (a "node-id=..." query ` +
            `param), or pass the nodeId parameter explicitly (colon form, e.g. "273:23740"). URL: ${figmaUrl}`,
        );
      }

      // STEP 0: for React Native, ensure brand + subBrand are registered in
      // oneui.brands.json (subBrand = the <OneUIBrandProvider> theme prop).
      const brandLines: string[] = [];
      if (platform === 'reactnative') {
        const r = ensureBrandSubBrand(defaultProjectRoot(projectRoot), brand, subBrand);
        brandLines.push(r.ok ? (r.changed ? `✅ ${r.message}` : r.message) : `⚠️ ${r.message}`);
      }

      // PREFLIGHT: fail fast if the bridge isn't connected, instead of hanging on
      // the snippet execution until the call timeout. For the figma-console
      // backend this auto-reclaims the pinned port from stray instances; for the
      // OneUI-owned bridge it starts our WS server and waits for the plugin.
      const bridge = await ensureBridge();
      if (!bridge.connected) {
        return errorText(
          [
            '# figma_to_code — bridge not ready',
            '',
            `- **File key:** \`${fileKey}\``,
            `- **Node id:** \`${nodeId}\``,
            '',
            ...renderBridgeResult(bridge),
            '',
            BRIDGE_TROUBLESHOOT,
          ].join('\n'),
        );
      }

      // PRIMARY: component props + appearance/surface modes, merged hierarchy.
      const { hierarchy, error: hierarchyError } = await extractHierarchy(nodeId, maxNodes, maxDepth);

      // OPTIONAL: raw deep tree (visual props / geometry / boundVariable IDs).
      // This uses a figma-console-specific tool; the OneUI-owned bridge has no
      // equivalent (it only runs the modes snippet), so skip it there.
      let rawTree: string | null = null;
      if (includeRawTree) {
        if (ownBridgeEnabled()) {
          rawTree = '⚠️ raw tree (figma_get_component_for_development_deep) is only available with the figma-console backend, not the OneUI-owned bridge.';
        } else {
          try {
            const res = await callFigmaConsole('figma_get_component_for_development_deep', { nodeId, depth: maxDepth });
            rawTree = resultToText(res);
          } catch (err) {
            rawTree = `⚠️ raw tree failed: ${err instanceof Error ? err.message : String(err)}`;
          }
        }
      }

      if (!hierarchy && hierarchyError) {
        return errorText(
          [
            `# figma_to_code failed`,
            ``,
            `- **File key:** \`${fileKey}\``,
            `- **Node id:** \`${nodeId}\``,
            ``,
            `Could not extract the component hierarchy / modes:`,
            '```',
            hierarchyError,
            '```',
            ``,
            BRIDGE_TROUBLESHOOT,
          ].join('\n'),
        );
      }

      // STEP 2: refine into a TSX-ready tree.
      const resolved = resolvePlatform(platform, { allowPlanned: true });
      const platformId = resolved.ok ? resolved.pack.id : 'reactnative';
      const refined = refine
        ? refineExtraction(hierarchy as { base?: Record<string, string>; tree?: RawNode | null }, platformId)
        : null;

      // Derive the screen name early so BOTH the assets folder and codegen use it.
      // Slug matches the route convention (lowercase, alphanumerics only).
      const derivedName = screenName ?? (refined?.base?.name as string | undefined) ?? 'Screen';
      const screenSlug = derivedName.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'screen';
      // Default the assets folder to assets/images/<screen>/ when the caller didn't
      // pass one, so each screen's downloaded images live under a predictable path
      // that the generated code references.
      const effectiveAssetsDir = assetsDir ?? `assets/images/${screenSlug}`;

      // STEP 3: ALWAYS download image assets (NOT icons) and backfill `src`.
      const imageLines: string[] = [];
      let imagesDownloaded = 0;
      let imagesReused = 0;
      let imagesMissing = 0;
      if (refined && refined.images.length > 0) {
        const token = process.env.FIGMA_ACCESS_TOKEN;
        if (!token) {
          imagesMissing = refined.images.length;
          imageLines.push(
            `❌ ${refined.images.length} image(s) found but FIGMA_ACCESS_TOKEN is not set on this server — ` +
              `images could NOT be downloaded. Set FIGMA_ACCESS_TOKEN and re-run before generating the .tsx.`,
          );
        } else {
          const root = defaultProjectRoot(projectRoot);
          const dl = await downloadImages({ fileKey, token, images: refined.images, assetsDir: effectiveAssetsDir, projectRoot: root, scale });
          applyImageSources(refined.tree, dl.byId);
          imagesDownloaded = dl.downloaded.length;
          imagesReused = dl.reused.length;
          const missing = refined.images.filter((i) => !dl.byId.has(i.id));
          imagesMissing = missing.length;
          if (dl.downloaded.length) {
            imageLines.push(
              `Downloaded **${dl.downloaded.length}/${refined.images.length}** image(s) → \`${effectiveAssetsDir}/\`:`,
              ...dl.downloaded.map((d) => `- \`${d.relPath}\`  ← node \`${d.id}\``),
            );
          }
          if (dl.reused.length) {
            imageLines.push(
              '',
              `Reused **${dl.reused.length}** pre-existing file(s) from \`${effectiveAssetsDir}/\`:`,
              ...dl.reused.map((d) => `- \`${d.relPath}\`  ← node \`${d.id}\``),
            );
          }
          if (dl.errors.length) imageLines.push('', '⚠️ image errors:', ...dl.errors.map((e) => `- ${e}`));
          if (missing.length === 0) {
            // Only claim success when EVERY image node actually has a local asset.
            imageLines.push(
              '',
              '**MANDATORY:** reference image content ONLY via these downloaded assets (each Image/Avatar node ' +
                'already has `props.src` set). Do NOT use remote Figma URLs or placeholders. (Icons are exempt — ' +
                'they always come from the icon library.)',
            );
          } else {
            imageLines.push(
              '',
              `❌ **${missing.length}/${refined.images.length} image(s) have NO local asset** — their ` +
                'Image/Avatar nodes have no `props.src` and will render **blank**:',
              ...missing.map(
                (i) =>
                  `- node \`${i.id}\` (\`${i.component}\`${i.alt ? `, alt "${i.alt}"` : ''}) — place a ` +
                  `\`${assetSlugify(i.alt || i.component || 'image') || 'image'}-*.png\` file in \`${effectiveAssetsDir}/\` and re-run, or set \`src\` manually.`,
              ),
              '',
              'Fix the image errors above (typically FIGMA_ACCESS_TOKEN lacking access to this file) and ' +
                're-run `figma_to_code`, or drop matching files into the assets dir — the tool reuses them by name.',
            );
          }
        }
      }

      // STEP 4: codegen — generate @oneui/ui-native screen and write to disk.
      const codegenLines: string[] = [];
      if (codegen && refined && refined.tree) {
        const root = defaultProjectRoot(projectRoot);
        try {
          const gen = generateNativeScreen(refined, {
            screenName: derivedName,
            outDir,
            projectRoot: root,
            platformSubdir: platformId === 'reactnative' ? 'native' : platformId,
          });
          codegenLines.push(`## Generated files`, '', `Written **\`${gen.relPath}\`** (${gen.components.length} OneUI components).`);
          if (gen.components.length) codegenLines.push('', `**Components used:** ${gen.components.join(', ')}`);
          // Route generation — keeps the consuming app free of manual edits.
          if (route && platformId === 'reactnative') {
            try {
              const r = generateRouteFiles(gen.componentName, root, { setIndex });
              codegenLines.push(
                '',
                `Route: **\`${r.routePath}\`** → reachable at \`${r.href}\`${r.indexPath ? ` (index → ${r.href})` : ''}.`,
              );
            } catch (err) {
              codegenLines.push('', `⚠️ Route generation failed: ${err instanceof Error ? err.message : String(err)}`);
            }
          }
          if (gen.warnings.length) codegenLines.push('', '⚠️ Codegen warnings:', ...gen.warnings.map((w) => `- ${w}`));
          codegenLines.push(
            '',
            '**Next steps:**',
            `1. Wrap the app in \`<OneUIBrandProvider brand="${brand}" theme="${subBrand}">\`.`,
            '2. Call `validate_oneui_code` with the file contents to catch any issues.',
            '3. For each OneUI component, confirm props with `get_component_info(name)`.',
            '',
            '```tsx',
            gen.code,
            '```',
          );
        } catch (err) {
          codegenLines.push(
            '## Codegen error',
            '',
            `❌ Code generation failed: ${err instanceof Error ? err.message : String(err)}`,
            '',
            'The refined tree is still returned below — you can generate manually from it.',
          );
        }
      }

      const lines: string[] = [
        '# figma_to_code — OneUI extraction',
        '',
        `- **File key:** \`${fileKey}\``,
        `- **Node id:** \`${nodeId}\``,
        `- **Platform:** \`${platformId}\``,
        `- **Brand / sub-brand:** \`${brand}\` / \`${subBrand}\`  (use \`<OneUIBrandProvider brand="${brand}" theme="${subBrand}">\`)`,
        refined
          ? `- **Images:** ${refined.images.length} found, ${imagesDownloaded} downloaded` +
            `${imagesReused ? `, ${imagesReused} reused` : ''}${imagesMissing ? `, **${imagesMissing} missing (will render blank)**` : ''}`
          : '',
        codegen ? `- **Codegen:** enabled → \`${outDir}/\`` : '- **Codegen:** off (agent authors the screen from the tree)',
        '',
      ];

      if (brandLines.length) lines.push('## Brand config (oneui.brands.json)', '', ...brandLines, '');
      if (imageLines.length) lines.push('## Image assets', '', ...imageLines, '');
      if (codegenLines.length) lines.push(...codegenLines, '');

      if (refined && !codegen) {
        lines.push(
          '> Refined hierarchy for TSX generation. `kind:"component"` = a registered OneUI component ' +
            '(carries `component`, `props`, `appearance`, `surface`, `text`, `box`, `layout`, `children`). ' +
            '`kind:"surface"` = a surface frame → `<Surface mode=…>`. `kind:"node"` = structural wrapper → ' +
            '`<Container>` with the token layout. `base` = the root\'s resolved modes.',
          '> **Spacing is token-based:** `layout.gap` / `layout.padding*` are spacing-token KEYS (resolve via ' +
            'theme.spacing) — emit them on `<Container>`/`<Surface>` props, never as literal px. `layout` also ' +
            'carries `cornerRadius` + `absoluteBox` (use absoluteBox only for pinned/absolute cases). ' +
            'direction→flexDirection, justify/align→justify/alignItems. `box` (w/h + sizeH/sizeV) sizes images ' +
            '(fixed→w/h, fill→flex/aspectRatio). Children are already in render order.',
          `> Wrap the screen in \`<OneUIBrandProvider brand="${brand}" theme="${subBrand}">\`, then ` +
            '`validate_oneui_code`. (Tip: re-run with `codegen=true` to auto-generate the .native.tsx.)',
          '',
          '## Refined component tree',
          '',
          '```json',
          json(refined),
          '```',
        );
      } else if (refined && codegen) {
        lines.push('## Refined component tree (source for codegen)', '', '```json', json(refined), '```');
      }

      if (includeRaw || !refined) {
        lines.push('', '## Raw extraction hierarchy (props + modes)', '', '```json', json(hierarchy), '```');
      }
      if (includeRawTree && rawTree) {
        lines.push('', '## Raw deep node tree', '', '```json', rawTree, '```');
      }

      return text(lines.join('\n'));
    },
  );
}

export { FigmaConsoleError };
