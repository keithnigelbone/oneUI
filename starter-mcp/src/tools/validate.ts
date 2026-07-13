/**
 * Phase 3 — code validator (one tool, platform-branched rule-sets).
 *
 * validate_oneui_code resolves the target PlatformPack, runs the shared checks
 * (unknown-prop against the platform catalog, non-released-component against the
 * platform barrel) plus the platform-specific rule-set, and formats the result.
 *
 *   shared.ts          — types, AST walk, unknown-prop, non-released, fonts, formatter
 *   rules.web.ts       — surface-paint(var), legacy-token, web fonts, web icon ban
 *   rules.native.ts    — literal-color, forbidden RN primitives, native fonts, native icon ban
 */
import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { RELEASED_EXPORTS } from '../lib/releasedExports.js';
import { RELEASED_EXPORTS_NATIVE } from '../lib/releasedExports.native.js';
import { getInstalledReleasedExports } from '../lib/installedReleased.js';
import { resolvePlatform } from '../lib/platforms.js';
import { text, defaultProjectRoot } from './util.js';
import {
  type RuleContext,
  stripComments,
  parseTsx,
  checkUnknownProps,
  checkNonReleasedComponents,
  formatIssues,
} from './validate/shared.js';
import { collectWebIssues } from './validate/rules.web.js';
import { collectNativeIssues } from './validate/rules.native.js';

export type { ValidationIssue } from './validate/shared.js';

export function registerValidateTools(server: McpServer): void {
  server.registerTool(
    'validate_oneui_code',
    {
      title: 'Validate OneUI/JDS TSX code',
      description:
        'Check TSX code for OneUI rule violations before returning it to the user. The rule-set is ' +
        'chosen by `platform`. Shared (both platforms): unknown-prop (prop not in the component API per ' +
        'the catalog) and non-released-component (importing a WIP component the published package does ' +
        'not export — the import will fail; use list_components for the released set). ' +
        'react (web, @jds4/oneui-react): forbidden-base-ui (importing @base-ui/react directly — use the ' +
        'OneUI wrapper component), undefined-component (a <Component> used but never imported/declared — ' +
        'a missing import or a hallucinated name like InputBox/PrimaryButton), unknown-import-path (a ' +
        'OneUI-looking import source that is not the published package), inline-surface-paint (background ' +
        'set with a surface var — wrap in <Surface>), legacy-token (--Typography-Size-*, --Surface-Bold, ' +
        '… → role-explicit tokens), hardcoded-font (literal typeface → var(--Typography-Font-*)), ' +
        'external-icon-import (use @jds4/oneui-icons-jio). ' +
        'reactnative (@oneui/ui-native): literal-color (hardcoded #/rgb/hsl/oklch in a style/colour prop ' +
        '— use Surface + appearance roles), forbidden-rn-primitive (only View/ScrollView may import from ' +
        'react-native — all UI must use @oneui/ui-native), hardcoded-font, external-icon-import (use ' +
        '@oneui/icons-jio-native). ' +
        'Returns a markdown table of issues with line/col/severity/message/suggestion. ' +
        'Fix all errors before returning code; warnings should be fixed where possible.',
      inputSchema: {
        tsx: z.string().describe('The TSX source code to validate. Pass the full file or the relevant component.'),
        projectRoot: z.string().optional().describe('Project root (to read the installed package release gates). Defaults to cwd.'),
        platform: z
          .string()
          .optional()
          .describe('Target platform pack: "react" (web — default) or "reactnative" (@oneui/ui-native).'),
      },
    },
    async ({ tsx, projectRoot, platform }) => {
      // Platform-pack seam. allowPlanned: the RN rule-set is wired even though the
      // pack is still `planned` overall (see lib/platforms.ts).
      const resolved = resolvePlatform(platform, { allowPlanned: true });
      if (!resolved.ok) {
        return text(`## Platform not supported\n\n${resolved.message}`);
      }
      const pack = resolved.pack;
      const isNative = pack.id === 'reactnative';

      const root = defaultProjectRoot(projectRoot);
      const lines = stripComments(tsx);
      const ast = parseTsx(tsx);

      // Released import surface: prefer the installed pack's gated barrel; else the
      // vendored fallback for that platform (RN ships no gates → native vendored set).
      const released =
        getInstalledReleasedExports(root, pack.pkgSubdir) ??
        (isNative ? RELEASED_EXPORTS_NATIVE : RELEASED_EXPORTS);

      const ctx: RuleContext = { lines, ast, assetSubdir: pack.assetSubdir, released, pkgName: pack.runtimePackage };

      const issues = [
        // shared, catalog/barrel-driven
        ...checkUnknownProps(ast, pack.assetSubdir),
        ...checkNonReleasedComponents(ast, released, pack.runtimePackage),
        // platform-specific
        ...(isNative ? collectNativeIssues(ctx) : collectWebIssues(ctx)),
      ];

      return text(formatIssues(issues));
    },
  );
}
