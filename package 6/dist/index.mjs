// src/index.ts
import { basename, relative } from "path";

// ../shared/src/cdn/paths.ts
import { join } from "path";
function brandsRoot(cacheDir) {
  return join(cacheDir, "brands");
}
function brandDir(cacheDir, slug) {
  return join(brandsRoot(cacheDir), slug);
}
function cssPath(cacheDir, slug) {
  return join(brandDir(cacheDir, slug), "brand.css");
}
function brandingPath(cacheDir, slug) {
  return join(brandDir(cacheDir, slug), "branding.json");
}
function decorationsPath(cacheDir, slug) {
  return join(brandDir(cacheDir, slug), "decorations.json");
}
function themeConfigPath(cacheDir, slug) {
  return join(brandDir(cacheDir, slug), "themeConfig.json");
}
function materialsPath(cacheDir, slug) {
  return join(brandDir(cacheDir, slug), "materials.json");
}
function fontsPath(cacheDir, slug) {
  return join(brandDir(cacheDir, slug), "fonts.json");
}
function themeDir(cacheDir, parent, sub) {
  return join(brandDir(cacheDir, parent), "sub", sub);
}
function themeCssPath(cacheDir, parent, sub) {
  return join(themeDir(cacheDir, parent, sub), "brand.css");
}
function themeThemeConfigPath(cacheDir, parent, sub) {
  return join(themeDir(cacheDir, parent, sub), "themeConfig.json");
}
function manifestPath(cacheDir) {
  return join(cacheDir, "manifest.json");
}

// ../shared/src/cdn/options.ts
import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
var PLUGIN_TAG = "[@oneui/cdn]";
function readJSON(file) {
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
}
function normalizeBrandEntry(raw) {
  if (typeof raw === "string") return { version: raw, themes: [] };
  return {
    version: raw.version,
    themes: Array.isArray(raw.themes) ? [...raw.themes] : []
  };
}
function resolveOptions(opts, projectRoot, pluginTag = PLUGIN_TAG) {
  const configFile = resolve(projectRoot, opts.configFile ?? "oneui.brands.json");
  const fileCfg = readJSON(
    configFile
  );
  const cdnUrl = opts.cdnUrl ?? process.env.ONEUI_CDN_URL ?? fileCfg?.cdnUrl ?? "";
  if (!cdnUrl) {
    throw new Error(
      `${pluginTag} cdnUrl not set. Pass it inline, set ONEUI_CDN_URL env, or add it to ${configFile}.`
    );
  }
  const rawBrands = opts.brands ?? fileCfg?.brands ?? {};
  if (Object.keys(rawBrands).length === 0) {
    throw new Error(
      `${pluginTag} no brands configured. Pass { brands: { ... } } or list them in ${configFile}.`
    );
  }
  const brands = {};
  for (const [slug, entry] of Object.entries(rawBrands)) {
    brands[slug] = normalizeBrandEntry(entry);
  }
  return {
    cdnUrl: cdnUrl.replace(/\/$/, ""),
    brands,
    cacheDir: resolve(projectRoot, opts.cacheDir ?? "node_modules/.oneui-cache"),
    offline: opts.offline ?? false
  };
}

// ../shared/src/cdn/sync.ts
import { existsSync as existsSync5, mkdirSync as mkdirSync3, rmSync as rmSync3 } from "fs";
import { createHash } from "crypto";

// ../shared/src/cdn/fetcher.ts
import { existsSync as existsSync2, mkdirSync, readFileSync as readFileSync2, rmSync, writeFileSync } from "fs";
import { dirname } from "path";
var TAG = "[@oneui/cdn]";
function ensureDir(dir) {
  if (!existsSync2(dir)) mkdirSync(dir, { recursive: true });
}
async function fetchOrFallback(spec, opts, logger) {
  if (opts.offline) {
    if (existsSync2(spec.cacheFile)) {
      try {
        return spec.parse(readFileSync2(spec.cacheFile, "utf8"));
      } catch {
      }
    }
    return spec.defaultValue;
  }
  try {
    const res = spec.legacyUrl ? await fetchThemeAssetWithLegacyFallback(spec.url, spec.legacyUrl) : await fetch(spec.url);
    if (res.status === 404) {
      try {
        rmSync(spec.cacheFile, { force: true });
      } catch {
      }
      return spec.defaultValue;
    }
    if (!res.ok) {
      logger?.warn(
        `${TAG} ${spec.url} \u2192 HTTP ${res.status}; falling back to ${existsSync2(spec.cacheFile) ? "cache" : "default"} for ${spec.label}.`
      );
    } else {
      const body = await res.text();
      try {
        const parsed = spec.parse(body);
        ensureDir(dirname(spec.cacheFile));
        writeFileSync(spec.cacheFile, body);
        return parsed;
      } catch (e) {
        logger?.warn(
          `${TAG} ${spec.label} parse error: ${e.message}; falling back to ${existsSync2(spec.cacheFile) ? "cache" : "default"}.`
        );
      }
    }
  } catch (e) {
    logger?.warn(
      `${TAG} ${spec.label} fetch failed for ${spec.url}: ${e.message}; falling back to ${existsSync2(spec.cacheFile) ? "cache" : "default"}.`
    );
  }
  if (existsSync2(spec.cacheFile)) {
    try {
      return spec.parse(readFileSync2(spec.cacheFile, "utf8"));
    } catch {
    }
  }
  return spec.defaultValue;
}
function brandJsonUrl(opts, slug, version) {
  return version === "latest" ? `${opts.cdnUrl}/brands/${slug}/latest.json` : `${opts.cdnUrl}/brands/${slug}/${version}/brand.json`;
}
function brandCssUrl(opts, slug, version) {
  return version === "latest" ? `${opts.cdnUrl}/brands/${slug}/latest.css` : `${opts.cdnUrl}/brands/${slug}/${version}/brand.css`;
}
function themeJsonUrl(opts, parent, sub, version, layout = "themes") {
  const base = `${opts.cdnUrl}/brands/${parent}/${layout}/${sub}`;
  return version === "latest" ? `${base}/latest.json` : `${base}/${version}/brand.json`;
}
function themeCssUrl(opts, parent, sub, version, layout = "themes") {
  const base = `${opts.cdnUrl}/brands/${parent}/${layout}/${sub}`;
  return version === "latest" ? `${base}/latest.css` : `${base}/${version}/brand.css`;
}
async function fetchThemeAssetWithLegacyFallback(primaryUrl, legacyUrl) {
  const primary = await fetch(primaryUrl);
  if (primary.status !== 404 || primaryUrl === legacyUrl) return primary;
  return fetch(legacyUrl);
}
var identity = (s) => s;
function parseBrandJson(s) {
  const raw = JSON.parse(s);
  return {
    schemaVersion: 2,
    version: typeof raw.version === "string" ? raw.version : "",
    branding: parseBrandingObject(raw.branding),
    decorations: Array.isArray(raw.decorations) ? raw.decorations : [],
    themeConfig: raw.themeConfig ?? null,
    materials: raw.materials ?? null,
    fonts: raw.fonts ?? null
  };
}
function parseThemeJson(s) {
  const raw = JSON.parse(s);
  return {
    schemaVersion: 2,
    version: typeof raw.version === "string" ? raw.version : "",
    themeConfig: raw.themeConfig ?? null
  };
}
function parseBrandingObject(raw) {
  const r = raw ?? {};
  return {
    brandName: typeof r.brandName === "string" ? r.brandName : "",
    logoSvg: r.logoSvg ?? null
  };
}
function writeBrandSidecars(cacheDir, slug, data) {
  const safeBranding = data.branding.brandName.length > 0 ? data.branding : { ...data.branding, brandName: slug };
  writeFileSync(brandingPath(cacheDir, slug), `${JSON.stringify(safeBranding, null, 2)}
`);
  writeFileSync(decorationsPath(cacheDir, slug), `${JSON.stringify(data.decorations, null, 2)}
`);
  writeFileSync(themeConfigPath(cacheDir, slug), `${JSON.stringify(data.themeConfig, null, 2)}
`);
  writeFileSync(materialsPath(cacheDir, slug), `${JSON.stringify(data.materials, null, 2)}
`);
  if (data.fonts === null) {
    try {
      rmSync(fontsPath(cacheDir, slug), { force: true });
    } catch {
    }
  } else {
    writeFileSync(fontsPath(cacheDir, slug), `${JSON.stringify(data.fonts, null, 2)}
`);
  }
}
function writeThemeSidecars(cacheDir, parent, sub, data) {
  writeFileSync(
    themeThemeConfigPath(cacheDir, parent, sub),
    `${JSON.stringify(data.themeConfig, null, 2)}
`
  );
}
var DEFAULT_BRAND_JSON = {
  schemaVersion: 2,
  version: "",
  branding: { brandName: "", logoSvg: null },
  decorations: [],
  themeConfig: null,
  materials: null,
  fonts: null
};
var DEFAULT_SUB_BRAND_JSON = {
  schemaVersion: 2,
  version: "",
  themeConfig: null
};
async function fetchBrandAssets(slug, version, opts, logger) {
  logger?.info(`${TAG}   \u2193 ${slug}@${version}`);
  const [css, data] = await Promise.all([
    fetchOrFallback(
      {
        url: brandCssUrl(opts, slug, version),
        cacheFile: cssPath(opts.cacheDir, slug),
        parse: identity,
        defaultValue: "",
        label: `${slug} css`
      },
      opts,
      logger
    ),
    fetchBrandJsonOnly(slug, version, opts, logger)
  ]);
  writeBrandSidecars(opts.cacheDir, slug, data);
  return { css, data };
}
async function fetchBrandJsonOnly(slug, version, opts, logger) {
  if (opts.offline) {
    return readSidecarsFromDisk(opts.cacheDir, slug);
  }
  const url = brandJsonUrl(opts, slug, version);
  try {
    const res = await fetch(url);
    if (res.status === 404) {
      clearBrandSidecars(opts.cacheDir, slug);
      return { ...DEFAULT_BRAND_JSON, branding: { brandName: slug, logoSvg: null } };
    }
    if (!res.ok) {
      logger?.warn(`${TAG} ${url} \u2192 HTTP ${res.status}; falling back to cached sidecars.`);
      return readSidecarsFromDisk(opts.cacheDir, slug);
    }
    const body = await res.text();
    try {
      return parseBrandJson(body);
    } catch (e) {
      logger?.warn(
        `${TAG} ${slug} brand.json parse error: ${e.message}; falling back to cached sidecars.`
      );
      return readSidecarsFromDisk(opts.cacheDir, slug);
    }
  } catch (e) {
    logger?.warn(
      `${TAG} ${slug} brand.json fetch failed for ${url}: ${e.message}; falling back to cached sidecars.`
    );
    return readSidecarsFromDisk(opts.cacheDir, slug);
  }
}
function readSidecarsFromDisk(cacheDir, slug) {
  const readFile = (file, parse, fallback) => {
    if (!existsSync2(file)) return fallback;
    try {
      return parse(readFileSync2(file, "utf8"));
    } catch {
      return fallback;
    }
  };
  return {
    schemaVersion: 2,
    version: "",
    branding: readFile(
      brandingPath(cacheDir, slug),
      (s) => parseBrandingObject(JSON.parse(s)),
      { brandName: slug, logoSvg: null }
    ),
    decorations: readFile(
      decorationsPath(cacheDir, slug),
      (s) => {
        const v = JSON.parse(s);
        return Array.isArray(v) ? v : [];
      },
      []
    ),
    themeConfig: readFile(
      themeConfigPath(cacheDir, slug),
      (s) => JSON.parse(s),
      null
    ),
    materials: readFile(
      materialsPath(cacheDir, slug),
      (s) => JSON.parse(s),
      null
    ),
    fonts: readFile(
      fontsPath(cacheDir, slug),
      (s) => JSON.parse(s),
      null
    )
  };
}
function clearBrandSidecars(cacheDir, slug) {
  for (const file of [
    brandingPath(cacheDir, slug),
    decorationsPath(cacheDir, slug),
    themeConfigPath(cacheDir, slug),
    materialsPath(cacheDir, slug),
    fontsPath(cacheDir, slug)
  ]) {
    try {
      rmSync(file, { force: true });
    } catch {
    }
  }
}
async function fetchThemeAssets(parentSlug, themeSlug, version, opts, logger) {
  logger?.info(`${TAG}     \u2193 ${parentSlug}/${themeSlug}@${version}`);
  const [css, data] = await Promise.all([
    fetchOrFallback(
      {
        url: themeCssUrl(opts, parentSlug, themeSlug, version),
        legacyUrl: themeCssUrl(opts, parentSlug, themeSlug, version, "subBrands"),
        cacheFile: themeCssPath(opts.cacheDir, parentSlug, themeSlug),
        parse: identity,
        defaultValue: "",
        label: `${parentSlug}/${themeSlug} css`
      },
      opts,
      logger
    ),
    fetchThemeJsonOnly(parentSlug, themeSlug, version, opts, logger)
  ]);
  writeThemeSidecars(opts.cacheDir, parentSlug, themeSlug, data);
  return { css, data };
}
async function fetchThemeJsonOnly(parentSlug, themeSlug, version, opts, logger) {
  if (opts.offline) {
    return readSubSidecarsFromDisk(opts.cacheDir, parentSlug, themeSlug);
  }
  const url = themeJsonUrl(opts, parentSlug, themeSlug, version);
  const legacyUrl = themeJsonUrl(opts, parentSlug, themeSlug, version, "subBrands");
  try {
    const res = await fetchThemeAssetWithLegacyFallback(url, legacyUrl);
    if (res.status === 404) {
      try {
        rmSync(themeThemeConfigPath(opts.cacheDir, parentSlug, themeSlug), { force: true });
      } catch {
      }
      return DEFAULT_SUB_BRAND_JSON;
    }
    if (!res.ok) {
      logger?.warn(
        `${TAG} ${url} \u2192 HTTP ${res.status}; falling back to cached themeConfig.`
      );
      return readSubSidecarsFromDisk(opts.cacheDir, parentSlug, themeSlug);
    }
    const body = await res.text();
    try {
      return parseThemeJson(body);
    } catch (e) {
      logger?.warn(
        `${TAG} ${parentSlug}/${themeSlug} brand.json parse error: ${e.message}; falling back to cached themeConfig.`
      );
      return readSubSidecarsFromDisk(opts.cacheDir, parentSlug, themeSlug);
    }
  } catch (e) {
    logger?.warn(
      `${TAG} ${parentSlug}/${themeSlug} brand.json fetch failed for ${url}: ${e.message}; falling back to cached themeConfig.`
    );
    return readSubSidecarsFromDisk(opts.cacheDir, parentSlug, themeSlug);
  }
}
function readSubSidecarsFromDisk(cacheDir, parent, sub) {
  const tcFile = themeThemeConfigPath(cacheDir, parent, sub);
  let themeConfig = null;
  if (existsSync2(tcFile)) {
    try {
      themeConfig = JSON.parse(readFileSync2(tcFile, "utf8"));
    } catch {
      themeConfig = null;
    }
  }
  return { schemaVersion: 2, version: "", themeConfig };
}

// ../shared/src/cdn/manifest.ts
import { existsSync as existsSync3, mkdirSync as mkdirSync2, readFileSync as readFileSync3, writeFileSync as writeFileSync2 } from "fs";
function readJSON2(file) {
  if (!existsSync3(file)) return null;
  try {
    return JSON.parse(readFileSync3(file, "utf8"));
  } catch {
    return null;
  }
}
function ensureDir2(dir) {
  if (!existsSync3(dir)) mkdirSync2(dir, { recursive: true });
}
function readCachedManifest(cacheDir) {
  const cached = readJSON2(manifestPath(cacheDir));
  return cached && cached.version === 2 ? cached : { version: 2, brands: {} };
}
function writeCachedManifest(cacheDir, manifest) {
  ensureDir2(cacheDir);
  writeFileSync2(manifestPath(cacheDir), JSON.stringify(manifest, null, 2));
}

// ../shared/src/cdn/prune.ts
import { existsSync as existsSync4, readdirSync, rmSync as rmSync2 } from "fs";
import { join as join2 } from "path";
var TAG2 = "[@oneui/cdn]";
function dropLegacyFlatFiles(cacheDir, logger) {
  const root = brandsRoot(cacheDir);
  if (!existsSync4(root)) return;
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (entry.isDirectory()) continue;
    if (/\.(css|json)$/.test(entry.name)) {
      try {
        rmSync2(join2(root, entry.name));
        logger?.info(`${TAG2}   \u21A7 migrated legacy ${entry.name} (removed)`);
      } catch {
      }
    }
  }
}
function pruneOrphanBrands(cacheDir, configured, manifest, logger) {
  const root = brandsRoot(cacheDir);
  if (!existsSync4(root)) return;
  const wanted = new Set(Object.keys(configured));
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (!wanted.has(entry.name)) {
      const path = join2(root, entry.name);
      try {
        rmSync2(path, { recursive: true, force: true });
        delete manifest.brands[entry.name];
        logger?.info(`${TAG2}   \u2717 pruned ${entry.name} (no longer in oneui.brands.json)`);
      } catch {
      }
      continue;
    }
    const subRoot = join2(root, entry.name, "sub");
    if (!existsSync4(subRoot)) continue;
    const wantedSubs = new Set(configured[entry.name].themes);
    for (const subEntry of readdirSync(subRoot, { withFileTypes: true })) {
      if (!subEntry.isDirectory()) continue;
      if (wantedSubs.has(subEntry.name)) continue;
      const path = join2(subRoot, subEntry.name);
      try {
        rmSync2(path, { recursive: true, force: true });
        if (manifest.brands[entry.name]?.themes) {
          delete manifest.brands[entry.name].themes[subEntry.name];
        }
        logger?.info(
          `${TAG2}   \u2717 pruned ${entry.name}/${subEntry.name} (no longer in oneui.brands.json)`
        );
      } catch {
      }
    }
  }
}

// ../shared/src/cdn/sync.ts
var TAG3 = "[@oneui/cdn]";
function ensureDir3(dir) {
  if (!existsSync5(dir)) mkdirSync3(dir, { recursive: true });
}
function shortHash(s) {
  return `sha256-${createHash("sha256").update(s).digest("hex").slice(0, 16)}`;
}
async function syncBrandCache(opts, logger) {
  ensureDir3(brandsRoot(opts.cacheDir));
  dropLegacyFlatFiles(opts.cacheDir, logger);
  const manifest = readCachedManifest(opts.cacheDir);
  pruneOrphanBrands(opts.cacheDir, opts.brands, manifest, logger);
  for (const [slug, entry] of Object.entries(opts.brands)) {
    const { version, themes } = entry;
    const previousVersion = manifest.brands[slug]?.version;
    if (previousVersion !== void 0 && previousVersion !== version) {
      try {
        rmSync3(cssPath(opts.cacheDir, slug), { force: true });
        logger?.info(
          `${TAG3}   \u21BB ${slug} version changed ${previousVersion} \u2192 ${version}; wiped CSS cache`
        );
      } catch {
      }
    }
    ensureDir3(brandDir(opts.cacheDir, slug));
    const { css } = await fetchBrandAssets(slug, version, opts, logger);
    if (css.length === 0) {
      logger?.warn(
        `${TAG3} "${slug}"@${version}: no CSS available \u2014 brand stays unstyled until the CDN serves CSS (or the cache fills).`
      );
    }
    const themesManifest = {};
    for (const themeSlug of themes) {
      ensureDir3(themeDir(opts.cacheDir, slug, themeSlug));
      const { css: themeCss } = await fetchThemeAssets(slug, themeSlug, version, opts, logger);
      if (themeCss.length === 0) {
        logger?.warn(
          `${TAG3} "${slug}/${themeSlug}": no CSS available \u2014 sub-brand will degrade to parent accents at runtime.`
        );
      }
      themesManifest[themeSlug] = {
        hash: shortHash(themeCss),
        bytes: Buffer.byteLength(themeCss, "utf8"),
        fetchedAt: (/* @__PURE__ */ new Date()).toISOString()
      };
    }
    manifest.brands[slug] = {
      version,
      hash: shortHash(css),
      bytes: Buffer.byteLength(css, "utf8"),
      fetchedAt: (/* @__PURE__ */ new Date()).toISOString(),
      ...themes.length > 0 ? { themes: themesManifest } : {}
    };
  }
  writeCachedManifest(opts.cacheDir, manifest);
  return manifest;
}

// ../shared/src/cdn/codegen.ts
import { existsSync as existsSync6, readFileSync as readFileSync4 } from "fs";
var VIRT_INDEX = "virtual:oneui-brands";
var VIRT_BRAND_PREFIX = "virtual:oneui-brand/";
var VIRT_SUB_BRAND_PREFIX = "virtual:oneui-sub-brand/";
var BRAND_LOADER_MODULE_IDS = [
  "@oneui/ui/brand-loader",
  "@jds4/oneui-react/brand-loader"
];
function isBrandLoaderModuleId(id) {
  return BRAND_LOADER_MODULE_IDS.includes(id);
}
function escapeForTemplateLiteral(s) {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}
function readCachedAsset(file, parse, fallback) {
  if (!existsSync6(file)) return fallback;
  try {
    return parse(readFileSync4(file, "utf8"));
  } catch {
    return fallback;
  }
}
var parseJsonArray = (s) => {
  const v = JSON.parse(s);
  return Array.isArray(v) ? v : [];
};
var parseJsonAny = (s) => JSON.parse(s);
var parseBranding = (s) => {
  const parsed = JSON.parse(s);
  return {
    brandName: typeof parsed.brandName === "string" ? parsed.brandName : "",
    logoSvg: parsed.logoSvg ?? null
  };
};
function generateIndexModuleSource(resolved, manifest, brandImportSpec, themeImportSpec) {
  const slugs = Object.keys(resolved.brands);
  const loaders = slugs.map(
    (slug) => `  ${JSON.stringify(slug)}: () => import(${JSON.stringify(brandImportSpec(slug))}),`
  ).join("\n");
  const subEntries = [];
  const subMeta = [];
  const themeSlugs = [];
  for (const slug of slugs) {
    for (const themeSlug of resolved.brands[slug].themes) {
      const key = `${slug}::${themeSlug}`;
      themeSlugs.push(key);
      subEntries.push(
        `  ${JSON.stringify(key)}: () => import(${JSON.stringify(themeImportSpec(slug, themeSlug))}),`
      );
      const m = manifest.brands[slug]?.themes?.[themeSlug];
      subMeta.push(
        `  ${JSON.stringify(key)}: ${JSON.stringify({
          parent: slug,
          sub: themeSlug,
          bytes: m?.bytes ?? 0,
          hash: m?.hash ?? ""
        })},`
      );
    }
  }
  const meta = slugs.map((slug) => {
    const m = manifest.brands[slug];
    return `  ${JSON.stringify(slug)}: ${JSON.stringify({
      version: m?.version ?? resolved.brands[slug].version,
      bytes: m?.bytes ?? 0,
      hash: m?.hash ?? "",
      themes: resolved.brands[slug].themes
    })},`;
  }).join("\n");
  return `// Generated by @oneui/cdn
export const brands = {
${loaders}
};
export const themes = {
${subEntries.join("\n")}
};
export const manifest = {
${meta}
};
export const themeManifest = {
${subMeta.join("\n")}
};
export const availableBrands = ${JSON.stringify(slugs)};
export const availableThemes = ${JSON.stringify(themeSlugs)};
`;
}
function generateBrandModuleSource(slug, cacheDir) {
  const cssFile = cssPath(cacheDir, slug);
  const css = existsSync6(cssFile) ? readFileSync4(cssFile, "utf8") : "";
  const decorations = readCachedAsset(decorationsPath(cacheDir, slug), parseJsonArray, []);
  const themeConfig = readCachedAsset(
    themeConfigPath(cacheDir, slug),
    parseJsonAny,
    null
  );
  const materialsFoundation = readCachedAsset(
    materialsPath(cacheDir, slug),
    parseJsonAny,
    null
  );
  const branding = readCachedAsset(brandingPath(cacheDir, slug), parseBranding, {
    brandName: slug,
    logoSvg: null
  });
  const safeBranding = branding.brandName.length > 0 ? branding : { ...branding, brandName: slug };
  const fontsFoundation = readCachedAsset(
    fontsPath(cacheDir, slug),
    parseJsonAny,
    null
  );
  return `// Generated by @oneui/cdn \u2014 brand: ${slug}
export default \`${escapeForTemplateLiteral(css)}\`;
export const decorations = ${JSON.stringify(decorations)};
export const themeConfig = ${JSON.stringify(themeConfig)};
export const materialsFoundation = ${JSON.stringify(materialsFoundation)};
export const branding = ${JSON.stringify(safeBranding)};
export const fontsFoundation = ${JSON.stringify(fontsFoundation)};
`;
}
function generateThemeModuleSource(parentSlug, themeSlug, cacheDir) {
  const cssFile = themeCssPath(cacheDir, parentSlug, themeSlug);
  const css = existsSync6(cssFile) ? readFileSync4(cssFile, "utf8") : "";
  const themeConfig = readCachedAsset(
    themeThemeConfigPath(cacheDir, parentSlug, themeSlug),
    parseJsonAny,
    null
  );
  return `// Generated by @oneui/cdn \u2014 sub-brand: ${parentSlug}/${themeSlug}
export default \`${escapeForTemplateLiteral(css)}\`;
export const themeConfig = ${JSON.stringify(themeConfig)};
`;
}

// src/index.ts
var RESOLVED_PREFIX = "\0";
var TAG4 = "[@oneui/vite-plugin]";
function oneui(opts = {}) {
  let resolved;
  let manifest = { version: 2, brands: {} };
  let logger;
  return {
    name: "@oneui/vite-plugin",
    enforce: "pre",
    async configResolved(config) {
      logger = config.logger;
      resolved = resolveOptions(opts, config.root, TAG4);
      logger.info(`${TAG4} syncing brand cache (force-fetch, cache fallback):`);
      manifest = await syncBrandCache(resolved, logger);
      const total = Object.values(manifest.brands).reduce((s, b) => s + b.bytes, 0);
      logger.info(
        `${TAG4} cache ready: ${Object.keys(manifest.brands).length} brand(s), ${(total / 1024).toFixed(1)} KB total`
      );
    },
    resolveId(id) {
      if (id === VIRT_INDEX || isBrandLoaderModuleId(id)) return RESOLVED_PREFIX + VIRT_INDEX;
      if (id.startsWith(VIRT_BRAND_PREFIX)) return RESOLVED_PREFIX + id;
      if (id.startsWith(VIRT_SUB_BRAND_PREFIX)) return RESOLVED_PREFIX + id;
      return null;
    },
    load(id) {
      if (id === RESOLVED_PREFIX + VIRT_INDEX) {
        return generateIndexModuleSource(
          resolved,
          manifest,
          (slug) => `${VIRT_BRAND_PREFIX}${slug}`,
          (parent, sub) => `${VIRT_SUB_BRAND_PREFIX}${parent}::${sub}`
        );
      }
      if (id.startsWith(RESOLVED_PREFIX + VIRT_BRAND_PREFIX)) {
        const slug = id.slice((RESOLVED_PREFIX + VIRT_BRAND_PREFIX).length);
        return generateBrandModuleSource(slug, resolved.cacheDir);
      }
      if (id.startsWith(RESOLVED_PREFIX + VIRT_SUB_BRAND_PREFIX)) {
        const key = id.slice((RESOLVED_PREFIX + VIRT_SUB_BRAND_PREFIX).length);
        const idx = key.indexOf("::");
        if (idx === -1) return null;
        const parentSlug = key.slice(0, idx);
        const themeSlug = key.slice(idx + 2);
        return generateThemeModuleSource(parentSlug, themeSlug, resolved.cacheDir);
      }
      return null;
    },
    handleHotUpdate(ctx) {
      const root = brandsRoot(resolved.cacheDir);
      const mfPath = manifestPath(resolved.cacheDir);
      if (ctx.file.startsWith(root)) {
        const rel = relative(root, ctx.file);
        const parts = rel.split(/[\\/]/);
        const slug = parts[0];
        if (slug && Object.prototype.hasOwnProperty.call(resolved.brands, slug)) {
          const mods = [];
          if (parts[1] === "sub" && parts[2]) {
            const themeSlug = parts[2];
            const subMod = ctx.server.moduleGraph.getModuleById(
              RESOLVED_PREFIX + VIRT_SUB_BRAND_PREFIX + `${slug}::${themeSlug}`
            );
            if (subMod) mods.push(subMod);
          } else {
            const mod = ctx.server.moduleGraph.getModuleById(
              RESOLVED_PREFIX + VIRT_BRAND_PREFIX + slug
            );
            if (mod) mods.push(mod);
          }
          const indexMod = ctx.server.moduleGraph.getModuleById(RESOLVED_PREFIX + VIRT_INDEX);
          if (indexMod) mods.push(indexMod);
          return mods;
        }
      }
      if (ctx.file === mfPath || basename(ctx.file) === "manifest.json") {
        const mods = [];
        for (const slug of Object.keys(resolved.brands)) {
          const mod = ctx.server.moduleGraph.getModuleById(
            RESOLVED_PREFIX + VIRT_BRAND_PREFIX + slug
          );
          if (mod) mods.push(mod);
        }
        const indexMod = ctx.server.moduleGraph.getModuleById(RESOLVED_PREFIX + VIRT_INDEX);
        if (indexMod) mods.push(indexMod);
        return mods;
      }
      return void 0;
    }
  };
}
var index_default = oneui;
export {
  index_default as default,
  oneui
};
//# sourceMappingURL=index.mjs.map