/**
 * @oneui/init (published as @jds4/oneui-init)
 *
 * One-command setup CLI for OneUI consumers. Auto-detects the host
 * framework, installs the appropriate plugin, scaffolds `oneui.brands.json`,
 * and prints the small config-file patches the consumer needs to apply.
 *
 * Why doesn't it auto-edit `vite.config.ts` / `next.config.js`?
 *   Bundler config files vary too much in shape (CJS vs ESM, factory
 *   functions, plugin chains, comments the user cares about). Surgical
 *   regex edits are fragile, AST edits are heavy. Printing the diff
 *   means the user sees exactly what to add and where — and it's a
 *   one-time copy-paste. shadcn / Tailwind / Mantine all do this for
 *   the same reason.
 *
 * Usage:
 *
 *   $ npx @jds4/oneui-init
 *   ? Detected: Next.js. Continue? (Y/n)
 *   ? CDN base URL: https://myjiostatic.cdn.jio.com/JDS
 *   ? Brands to fetch (comma-separated slugs): jio
 *
 *   ✓ Installed @jds4/oneui-react @jds4/oneui-icons-jio @jds4/oneui-next-plugin
 *   ✓ Wrote oneui.brands.json
 *
 *   Next, add this to your next.config.js:
 *     const { withOneui } = require('@jds4/oneui-next-plugin');
 *     module.exports = withOneui({ ... })(yourConfig);
 *
 *   And import the brand stylesheet in your app entry:
 *     import '@jds4/oneui-react/styles';
 *
 * The library exports (this file) are also callable from scripts —
 * useful if a parent setup CLI wants to drive OneUI init programmatically.
 */
type Framework = 'next' | 'vite' | 'webpack' | 'esbuild' | 'unknown';
interface DetectionResult {
    framework: Framework;
    /** Evidence used to make the call — surfaced for transparency. */
    reasons: string[];
}
/**
 * Look at the consumer's `package.json` + presence of config files to
 * decide which plugin they need.
 */
declare function detectFramework(projectRoot: string): DetectionResult;
/**
 * What `oneui-init` should install for a given framework. Always includes
 * `@jds4/oneui-react` and `@jds4/oneui-icons-jio` — the icons-jio default
 * is non-negotiable because Checkbox/Stepper/FAB render badly without it.
 */
declare function installSpec(framework: Framework): {
    runtime: string[];
    dev: string[];
};
interface BrandsConfig {
    cdnUrl: string;
    brands: Record<string, string>;
}
/** Write `oneui.brands.json` in the project root. Refuses to clobber. */
declare function writeBrandsConfig(projectRoot: string, config: BrandsConfig, force?: boolean): {
    written: boolean;
    path: string;
    reason?: string;
};
/** Detect which package manager the project uses (default: npm). */
declare function detectPackageManager(projectRoot: string): 'pnpm' | 'yarn' | 'npm';
/**
 * Run the install command. Returns success + the command that ran so callers
 * can surface it (and rerun manually on failure).
 */
declare function runInstall(projectRoot: string, runtime: string[], dev: string[], pm: 'pnpm' | 'yarn' | 'npm'): {
    ok: boolean;
    commands: string[];
};
/**
 * Snippets to print after install — never auto-applied. The user copies
 * them into the right file.
 */
declare function patchSnippets(framework: Framework): {
    configFile: string;
    snippet: string;
};

export { type BrandsConfig, type DetectionResult, type Framework, detectFramework, detectPackageManager, installSpec, patchSnippets, runInstall, writeBrandsConfig };
