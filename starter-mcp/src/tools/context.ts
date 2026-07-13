/**
 * get_project_context — the "load first" tool for the `oneui` skill.
 *
 * Resolves, from the consumer's project on disk: the active brand + named themes
 * (oneui.brands.json), the installed OneUI package versions, the target platform
 * (web vs native — OneUI's "which primitive library"), the detected framework,
 * and the installed released components. One call replaces the skill's manual
 * fallback (read package.json + oneui.brands.json + run check_oneui_versions).
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { installedVersion } from '../lib/npm.js';
import { getInstalledReleasedComponents } from '../lib/installedReleased.js';
import { PLATFORMS, type PlatformId } from '../lib/platforms.js';
import { detectFramework, CONFIG_FILENAME, type BrandsConfig, type BrandEntry } from '../lib/framework.js';
import { text, defaultProjectRoot } from './util.js';

interface BrandView {
  slug: string;
  version: string;
  themes: string[];
}

function readBrandsConfig(projectRoot: string): BrandsConfig | null {
  const p = resolve(projectRoot, CONFIG_FILENAME);
  if (!existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, 'utf8')) as BrandsConfig;
  } catch {
    return null;
  }
}

function viewBrand(slug: string, entry: BrandEntry): BrandView {
  if (typeof entry === 'string') return { slug, version: entry, themes: [] };
  return { slug, version: entry.version, themes: Array.isArray(entry.themes) ? entry.themes : [] };
}

export function registerContextTools(server: McpServer): void {
  server.registerTool(
    'get_project_context',
    {
      title: 'Get OneUI project context',
      description:
        'Resolve the consuming project context before generating code: active brand + named themes ' +
        '(from oneui.brands.json), installed @jds4/oneui-react / @oneui/ui-native versions, the target ' +
        'platform ("react" web vs "reactnative" — which changes imports, tokens, and rules), the detected ' +
        'framework, and the installed released components. Call this first; pass the resolved `platform` to ' +
        'list_components / get_component_info / validate_oneui_code. Read-only — does not modify the project.',
      inputSchema: {
        projectRoot: z
          .string()
          .optional()
          .describe('Project root to inspect (where package.json / oneui.brands.json live). Defaults to cwd.'),
      },
    },
    async ({ projectRoot }) => {
      const root = defaultProjectRoot(projectRoot);

      // Platform = which OneUI runtime package is installed. Both may be present.
      const webVersion = installedVersion(root, PLATFORMS.react.runtimePackage);
      const nativeVersion = installedVersion(root, PLATFORMS.reactnative.runtimePackage);
      const installed: PlatformId[] = [];
      if (webVersion) installed.push('react');
      if (nativeVersion) installed.push('reactnative');
      const platform: PlatformId | null = installed[0] ?? null;

      // Brand config.
      const config = readBrandsConfig(root);
      const brands = config?.brands
        ? Object.entries(config.brands).map(([slug, entry]) => viewBrand(slug, entry))
        : [];
      const activeBrand = brands[0] ?? null; // first configured brand is the BrandProvider default

      // Installed released components for the resolved platform (best-effort).
      let componentCount: number | null = null;
      if (platform) {
        const set = await getInstalledReleasedComponents(root, PLATFORMS[platform].pkgSubdir);
        componentCount = set ? set.size : null;
      }

      const { framework } = detectFramework(root);

      const lines: string[] = ['# OneUI project context', ''];

      if (!platform) {
        lines.push(
          '⚠️ **No OneUI runtime package installed.** Neither `@jds4/oneui-react` (web) nor ' +
            '`@oneui/ui-native` (native) was found in this project.',
          '',
          'Run `setup_oneui_project` to scaffold install + provider config.',
          '',
        );
      } else {
        lines.push(
          `- **Platform:** \`${platform}\`${installed.length > 1 ? ' (both web + native installed — pass the one you are building for)' : ''}`,
          `- **Package:** ${PLATFORMS[platform].runtimePackage} \`${platform === 'react' ? webVersion : nativeVersion}\``,
          `- **Framework:** ${framework}`,
          `- **Installed released components:** ${componentCount ?? 'unknown (could not read the package barrel — use list_components)'}`,
          '',
        );
      }

      if (webVersion && nativeVersion) {
        lines.push(`- Also installed: ${PLATFORMS.reactnative.runtimePackage} \`${nativeVersion}\``, '');
      }

      if (!config) {
        lines.push(
          `## Brands`,
          `No \`${CONFIG_FILENAME}\` found. Brand CSS will not inject until one exists — run \`setup_oneui_project\`.`,
          '',
        );
      } else {
        lines.push(`## Brands (\`${CONFIG_FILENAME}\`)`);
        if (activeBrand) {
          lines.push(
            `- **Active brand:** \`${activeBrand.slug}\` (version \`${activeBrand.version}\`)` +
              (activeBrand.themes.length ? ` — themes: ${activeBrand.themes.map((t) => `\`${t}\``).join(', ')}` : ''),
          );
        }
        const others = brands.slice(1);
        if (others.length) {
          lines.push(
            `- **Other configured brands:** ${others
              .map((b) => `\`${b.slug}\`${b.themes.length ? ` (${b.themes.length} themes)` : ''}`)
              .join(', ')}`,
          );
        }
        if (config.cdnUrl) lines.push(`- **CDN:** ${config.cdnUrl}`);
        lines.push('');
      }

      lines.push(
        '---',
        `Next: pass \`platform: "${platform ?? 'react'}"\` to \`list_components\`, \`get_component_info\`, and ` +
          `\`validate_oneui_code\`. Use \`get_brand_tokens("${activeBrand?.slug ?? 'jio'}")\` for the active brand's tokens.`,
      );

      return text(lines.join('\n'));
    },
  );
}
