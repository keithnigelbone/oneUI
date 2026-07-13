"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  default: () => index_default,
  oneui: () => oneui
});
module.exports = __toCommonJS(index_exports);

// ../shared/src/cdn/paths.ts
var import_node_path = require("path");
function brandsRoot(cacheDir) {
  return (0, import_node_path.join)(cacheDir, "brands");
}
function brandDir(cacheDir, slug) {
  return (0, import_node_path.join)(brandsRoot(cacheDir), slug);
}
function cssPath(cacheDir, slug) {
  return (0, import_node_path.join)(brandDir(cacheDir, slug), "brand.css");
}
function brandingPath(cacheDir, slug) {
  return (0, import_node_path.join)(brandDir(cacheDir, slug), "branding.json");
}
function decorationsPath(cacheDir, slug) {
  return (0, import_node_path.join)(brandDir(cacheDir, slug), "decorations.json");
}
function themeConfigPath(cacheDir, slug) {
  return (0, import_node_path.join)(brandDir(cacheDir, slug), "themeConfig.json");
}
function materialsPath(cacheDir, slug) {
  return (0, import_node_path.join)(brandDir(cacheDir, slug), "materials.json");
}
function fontsPath(cacheDir, slug) {
  return (0, import_node_path.join)(brandDir(cacheDir, slug), "fonts.json");
}
function themeDir(cacheDir, parent, sub) {
  return (0, import_node_path.join)(brandDir(cacheDir, parent), "sub", sub);
}
function themeCssPath(cacheDir, parent, sub) {
  return (0, import_node_path.join)(themeDir(cacheDir, parent, sub), "brand.css");
}
function themeThemeConfigPath(cacheDir, parent, sub) {
  return (0, import_node_path.join)(themeDir(cacheDir, parent, sub), "themeConfig.json");
}
function manifestPath(cacheDir) {
  return (0, import_node_path.join)(cacheDir, "manifest.json");
}

// ../shared/src/cdn/options.ts
var import_node_fs = require("fs");
var import_node_path2 = require("path");
var PLUGIN_TAG = "[@oneui/cdn]";
function readJSON(file) {
  if (!(0, import_node_fs.existsSync)(file)) return null;
  try {
    return JSON.parse((0, import_node_fs.readFileSync)(file, "utf8"));
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
  const configFile = (0, import_node_path2.resolve)(projectRoot, opts.configFile ?? "oneui.brands.json");
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
    cacheDir: (0, import_node_path2.resolve)(projectRoot, opts.cacheDir ?? "node_modules/.oneui-cache"),
    offline: opts.offline ?? false
  };
}

// ../shared/src/cdn/sync.ts
var import_node_fs5 = require("fs");
var import_node_crypto = require("crypto");

// ../shared/src/cdn/fetcher.ts
var import_node_fs2 = require("fs");
var import_node_path3 = require("path");
var TAG = "[@oneui/cdn]";
function ensureDir(dir) {
  if (!(0, import_node_fs2.existsSync)(dir)) (0, import_node_fs2.mkdirSync)(dir, { recursive: true });
}
async function fetchOrFallback(spec, opts, logger) {
  if (opts.offline) {
    if ((0, import_node_fs2.existsSync)(spec.cacheFile)) {
      try {
        return spec.parse((0, import_node_fs2.readFileSync)(spec.cacheFile, "utf8"));
      } catch {
      }
    }
    return spec.defaultValue;
  }
  try {
    const res = spec.legacyUrl ? await fetchThemeAssetWithLegacyFallback(spec.url, spec.legacyUrl) : await fetch(spec.url);
    if (res.status === 404) {
      try {
        (0, import_node_fs2.rmSync)(spec.cacheFile, { force: true });
      } catch {
      }
      return spec.defaultValue;
    }
    if (!res.ok) {
      logger?.warn(
        `${TAG} ${spec.url} \u2192 HTTP ${res.status}; falling back to ${(0, import_node_fs2.existsSync)(spec.cacheFile) ? "cache" : "default"} for ${spec.label}.`
      );
    } else {
      const body = await res.text();
      try {
        const parsed = spec.parse(body);
        ensureDir((0, import_node_path3.dirname)(spec.cacheFile));
        (0, import_node_fs2.writeFileSync)(spec.cacheFile, body);
        return parsed;
      } catch (e) {
        logger?.warn(
          `${TAG} ${spec.label} parse error: ${e.message}; falling back to ${(0, import_node_fs2.existsSync)(spec.cacheFile) ? "cache" : "default"}.`
        );
      }
    }
  } catch (e) {
    logger?.warn(
      `${TAG} ${spec.label} fetch failed for ${spec.url}: ${e.message}; falling back to ${(0, import_node_fs2.existsSync)(spec.cacheFile) ? "cache" : "default"}.`
    );
  }
  if ((0, import_node_fs2.existsSync)(spec.cacheFile)) {
    try {
      return spec.parse((0, import_node_fs2.readFileSync)(spec.cacheFile, "utf8"));
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
  (0, import_node_fs2.writeFileSync)(brandingPath(cacheDir, slug), `${JSON.stringify(safeBranding, null, 2)}
`);
  (0, import_node_fs2.writeFileSync)(decorationsPath(cacheDir, slug), `${JSON.stringify(data.decorations, null, 2)}
`);
  (0, import_node_fs2.writeFileSync)(themeConfigPath(cacheDir, slug), `${JSON.stringify(data.themeConfig, null, 2)}
`);
  (0, import_node_fs2.writeFileSync)(materialsPath(cacheDir, slug), `${JSON.stringify(data.materials, null, 2)}
`);
  if (data.fonts === null) {
    try {
      (0, import_node_fs2.rmSync)(fontsPath(cacheDir, slug), { force: true });
    } catch {
    }
  } else {
    (0, import_node_fs2.writeFileSync)(fontsPath(cacheDir, slug), `${JSON.stringify(data.fonts, null, 2)}
`);
  }
}
function writeThemeSidecars(cacheDir, parent, sub, data) {
  (0, import_node_fs2.writeFileSync)(
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
    if (!(0, import_node_fs2.existsSync)(file)) return fallback;
    try {
      return parse((0, import_node_fs2.readFileSync)(file, "utf8"));
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
      (0, import_node_fs2.rmSync)(file, { force: true });
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
        (0, import_node_fs2.rmSync)(themeThemeConfigPath(opts.cacheDir, parentSlug, themeSlug), { force: true });
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
  if ((0, import_node_fs2.existsSync)(tcFile)) {
    try {
      themeConfig = JSON.parse((0, import_node_fs2.readFileSync)(tcFile, "utf8"));
    } catch {
      themeConfig = null;
    }
  }
  return { schemaVersion: 2, version: "", themeConfig };
}

// ../shared/src/cdn/manifest.ts
var import_node_fs3 = require("fs");
function readJSON2(file) {
  if (!(0, import_node_fs3.existsSync)(file)) return null;
  try {
    return JSON.parse((0, import_node_fs3.readFileSync)(file, "utf8"));
  } catch {
    return null;
  }
}
function ensureDir2(dir) {
  if (!(0, import_node_fs3.existsSync)(dir)) (0, import_node_fs3.mkdirSync)(dir, { recursive: true });
}
function readCachedManifest(cacheDir) {
  const cached = readJSON2(manifestPath(cacheDir));
  return cached && cached.version === 2 ? cached : { version: 2, brands: {} };
}
function writeCachedManifest(cacheDir, manifest) {
  ensureDir2(cacheDir);
  (0, import_node_fs3.writeFileSync)(manifestPath(cacheDir), JSON.stringify(manifest, null, 2));
}

// ../shared/src/cdn/prune.ts
var import_node_fs4 = require("fs");
var import_node_path4 = require("path");
var TAG2 = "[@oneui/cdn]";
function dropLegacyFlatFiles(cacheDir, logger) {
  const root = brandsRoot(cacheDir);
  if (!(0, import_node_fs4.existsSync)(root)) return;
  for (const entry of (0, import_node_fs4.readdirSync)(root, { withFileTypes: true })) {
    if (entry.isDirectory()) continue;
    if (/\.(css|json)$/.test(entry.name)) {
      try {
        (0, import_node_fs4.rmSync)((0, import_node_path4.join)(root, entry.name));
        logger?.info(`${TAG2}   \u21A7 migrated legacy ${entry.name} (removed)`);
      } catch {
      }
    }
  }
}
function pruneOrphanBrands(cacheDir, configured, manifest, logger) {
  const root = brandsRoot(cacheDir);
  if (!(0, import_node_fs4.existsSync)(root)) return;
  const wanted = new Set(Object.keys(configured));
  for (const entry of (0, import_node_fs4.readdirSync)(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    if (!wanted.has(entry.name)) {
      const path = (0, import_node_path4.join)(root, entry.name);
      try {
        (0, import_node_fs4.rmSync)(path, { recursive: true, force: true });
        delete manifest.brands[entry.name];
        logger?.info(`${TAG2}   \u2717 pruned ${entry.name} (no longer in oneui.brands.json)`);
      } catch {
      }
      continue;
    }
    const subRoot = (0, import_node_path4.join)(root, entry.name, "sub");
    if (!(0, import_node_fs4.existsSync)(subRoot)) continue;
    const wantedSubs = new Set(configured[entry.name].themes);
    for (const subEntry of (0, import_node_fs4.readdirSync)(subRoot, { withFileTypes: true })) {
      if (!subEntry.isDirectory()) continue;
      if (wantedSubs.has(subEntry.name)) continue;
      const path = (0, import_node_path4.join)(subRoot, subEntry.name);
      try {
        (0, import_node_fs4.rmSync)(path, { recursive: true, force: true });
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
  if (!(0, import_node_fs5.existsSync)(dir)) (0, import_node_fs5.mkdirSync)(dir, { recursive: true });
}
function shortHash(s) {
  return `sha256-${(0, import_node_crypto.createHash)("sha256").update(s).digest("hex").slice(0, 16)}`;
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
        (0, import_node_fs5.rmSync)(cssPath(opts.cacheDir, slug), { force: true });
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
var import_node_fs6 = require("fs");
var VIRT_INDEX = "virtual:oneui-brands";
var VIRT_BRAND_PREFIX = "virtual:oneui-brand/";
var VIRT_SUB_BRAND_PREFIX = "virtual:oneui-sub-brand/";
function escapeForTemplateLiteral(s) {
  return s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${");
}
function readCachedAsset(file, parse, fallback) {
  if (!(0, import_node_fs6.existsSync)(file)) return fallback;
  try {
    return parse((0, import_node_fs6.readFileSync)(file, "utf8"));
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
  const css = (0, import_node_fs6.existsSync)(cssFile) ? (0, import_node_fs6.readFileSync)(cssFile, "utf8") : "";
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
  const css = (0, import_node_fs6.existsSync)(cssFile) ? (0, import_node_fs6.readFileSync)(cssFile, "utf8") : "";
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
var TAG4 = "[@oneui/esbuild-plugin]";
var NAMESPACE = "oneui-virtual";
var syncLogger = {
  info: (m) => console.log(m),
  warn: (m) => console.warn(m)
};
var inflightSyncByCacheDir = /* @__PURE__ */ new Map();
function syncCacheOnce(opts) {
  const existing = inflightSyncByCacheDir.get(opts.cacheDir);
  if (existing) return existing;
  const fresh = syncBrandCache(opts, syncLogger);
  inflightSyncByCacheDir.set(opts.cacheDir, fresh);
  fresh.catch(() => inflightSyncByCacheDir.delete(opts.cacheDir));
  return fresh;
}
function buildVirtualModuleSource(resolved, manifest, path) {
  if (path === VIRT_INDEX) {
    return generateIndexModuleSource(
      resolved,
      manifest,
      (slug) => `${VIRT_BRAND_PREFIX}${slug}`,
      (parent, sub) => `${VIRT_SUB_BRAND_PREFIX}${parent}::${sub}`
    );
  }
  if (path.startsWith(VIRT_BRAND_PREFIX)) {
    const slug = path.slice(VIRT_BRAND_PREFIX.length);
    return generateBrandModuleSource(slug, resolved.cacheDir);
  }
  if (path.startsWith(VIRT_SUB_BRAND_PREFIX)) {
    const key = path.slice(VIRT_SUB_BRAND_PREFIX.length);
    const idx = key.indexOf("::");
    if (idx === -1) return null;
    return generateThemeModuleSource(key.slice(0, idx), key.slice(idx + 2), resolved.cacheDir);
  }
  return null;
}
function oneui(opts = {}) {
  return {
    name: "@oneui/esbuild-plugin",
    setup(build) {
      let resolved = null;
      let manifest = null;
      build.onStart(async () => {
        const root = opts.projectRoot ?? build.initialOptions.absWorkingDir ?? process.cwd();
        resolved = resolveOptions(opts, root, TAG4);
        console.log(`${TAG4} syncing brand cache (force-fetch, cache fallback):`);
        manifest = await syncCacheOnce(resolved);
        const totalBytes = Object.values(manifest.brands).reduce((s, b) => s + b.bytes, 0);
        console.log(
          `${TAG4} cache ready: ${Object.keys(manifest.brands).length} brand(s), ${(totalBytes / 1024).toFixed(1)} KB total`
        );
      });
      build.onResolve(
        { filter: /^virtual:oneui-(brands|brand\/[^\s]+|sub-brand\/[^\s]+)$/ },
        (args) => ({ path: args.path, namespace: NAMESPACE })
      );
      build.onResolve(
        { filter: /^@(?:oneui\/ui|jds4\/oneui-react)\/brand-loader$/ },
        () => ({ path: VIRT_INDEX, namespace: NAMESPACE })
      );
      build.onLoad({ filter: /.*/, namespace: NAMESPACE }, (args) => {
        if (resolved === null || manifest === null) {
          return {
            errors: [
              { text: `${TAG4} onLoad called before onStart completed; this should not happen.` }
            ]
          };
        }
        const source = buildVirtualModuleSource(resolved, manifest, args.path);
        if (source === null) {
          const slug = args.path.startsWith(VIRT_BRAND_PREFIX) ? args.path.slice(VIRT_BRAND_PREFIX.length) : args.path;
          return {
            errors: [
              {
                text: `${TAG4} brand "${slug}" not in cache. Ensure it's listed in oneui.brands.json.`
              }
            ]
          };
        }
        return { contents: source, loader: "js" };
      });
    }
  };
}
var index_default = oneui;
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  oneui
});
//# sourceMappingURL=index.cjs.map