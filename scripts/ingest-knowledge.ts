#!/usr/bin/env node
/*
 * ingest-knowledge.ts
 *
 * Ingests design-system documentation into the Convex `knowledgeDocs` table
 * so the Experience Builder chat can retrieve relevant chunks at runtime via
 * the `search_design_system` tool.
 *
 * Sources (relative to repo root):
 *   - docs/** /*.md
 *   - CLAUDE.md
 *   - .claude/skills/** /*.md (SKILL.md files and any supporting markdown)
 *   - Top-level *.md files that describe foundations (e.g. colour_surfaces.md)
 *   - packages/ui/src/components/** /*.meta.ts — rendered to markdown so the
 *     agent can search for "how do I use ChipGroup?" and get props, slots,
 *     surface-aware flag, etc.
 *   - packages/shared/src/data/*.ts — foundation lookup tables (typography
 *     roles, dimension scales, spacing aliases) wrapped in markdown code
 *     fences with the leading JSDoc extracted as the intro.
 *
 * Pipeline per file:
 *   1. Walk + read
 *   2. Split by H2/H3 headings, preserving a heading path
 *   3. Sub-chunk each section to ~500 tokens with ~50 token overlap
 *   4. sha256 each chunk for a stable dedupe key
 *   5. Batch-embed via OpenAI text-embedding-3-small (1536 dims)
 *   6. Convex `upsertChunk` per chunk; `pruneStale` per source at the end
 *
 * Usage:
 *   pnpm ingest:knowledge                # full ingest
 *   pnpm ingest:knowledge --dry-run      # chunk + report, don't embed or write
 *   pnpm ingest:knowledge --source docs  # restrict to a directory
 *
 * Env vars:
 *   OPENAI_API_KEY         — required (unless --dry-run)
 *   NEXT_PUBLIC_CONVEX_URL — required (unless --dry-run)
 */

import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative, resolve, sep } from 'node:path';
import { createHash } from 'node:crypto';

const REPO_ROOT = resolve(process.cwd());

const SOURCE_PATTERNS = [
  { dir: 'docs', recursive: true, match: /\.md$/ },
  { dir: '.claude/skills', recursive: true, match: /\.md$/ },
  { dir: '', recursive: false, match: /^(CLAUDE|colour_surfaces|typography|spacing|shapes|elevations|motion)\.md$/ },
];

const CHUNK_TARGET_TOKENS = 500;
const CHUNK_OVERLAP_TOKENS = 50;
const EMBED_BATCH_SIZE = 64;
const EMBED_MODEL = 'text-embedding-3-small';
const EMBED_DIMENSIONS = 1536;

type Chunk = {
  source: string;
  heading: string;
  headingPath: string[];
  content: string;
  contentHash: string;
  tokens: number;
  tags: string[];
};

function parseArgs() {
  const argv = process.argv.slice(2);
  return {
    dryRun: argv.includes('--dry-run'),
    source: (() => {
      const i = argv.indexOf('--source');
      return i >= 0 ? argv[i + 1] : null;
    })(),
    verbose: argv.includes('--verbose'),
  };
}

async function walkDir(dir: string, recursive: boolean, match: RegExp, out: string[] = []): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (recursive) await walkDir(full, recursive, match, out);
    } else if (entry.isFile() && match.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

async function collectSources(restrict: string | null): Promise<string[]> {
  const files: string[] = [];
  for (const pattern of SOURCE_PATTERNS) {
    if (restrict && !pattern.dir.startsWith(restrict) && pattern.dir !== restrict) continue;
    const base = pattern.dir ? join(REPO_ROOT, pattern.dir) : REPO_ROOT;
    if (pattern.dir === '') {
      // Top-level files: just read entries once, no recursion
      const entries = await readdir(base, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && pattern.match.test(entry.name)) {
          files.push(join(base, entry.name));
        }
      }
    } else {
      const s = await stat(base).catch(() => null);
      if (s?.isDirectory()) {
        await walkDir(base, pattern.recursive, pattern.match, files);
      }
    }
  }
  return Array.from(new Set(files));
}

/* Extremely rough token estimator — fine for budgeting, not for billing. */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

function hashContent(text: string): string {
  return createHash('sha256').update(text).digest('hex').slice(0, 16);
}

/*
 * Split a markdown string into sections keyed by heading path. A new section
 * starts at every H1/H2/H3. Content under each heading collects paragraphs
 * and code fences until the next same-or-higher heading.
 */
function splitByHeadings(markdown: string): Array<{ headingPath: string[]; body: string }> {
  const lines = markdown.split('\n');
  const sections: Array<{ headingPath: string[]; body: string }> = [];
  const stack: string[] = [];
  let bodyLines: string[] = [];

  const flush = () => {
    const body = bodyLines.join('\n').trim();
    if (body.length > 0) {
      sections.push({ headingPath: [...stack], body });
    }
    bodyLines = [];
  };

  let inFence = false;
  for (const line of lines) {
    if (/^```/.test(line)) {
      inFence = !inFence;
      bodyLines.push(line);
      continue;
    }
    if (!inFence) {
      const match = /^(#{1,3})\s+(.*)$/.exec(line);
      if (match) {
        flush();
        const depth = match[1].length;
        const title = match[2].trim();
        stack.length = depth - 1;
        stack.push(title);
        continue;
      }
    }
    bodyLines.push(line);
  }
  flush();
  return sections;
}

/*
 * Break a section body into ~CHUNK_TARGET_TOKENS chunks with overlap. Splits
 * on paragraph boundaries when possible; falls back to sentence splits for
 * very long paragraphs.
 */
function subChunk(body: string): string[] {
  const targetChars = CHUNK_TARGET_TOKENS * 4;
  const overlapChars = CHUNK_OVERLAP_TOKENS * 4;
  if (body.length <= targetChars) return [body];

  const paragraphs = body.split(/\n\n+/);
  const chunks: string[] = [];
  let current = '';

  for (const para of paragraphs) {
    if (current.length + para.length + 2 <= targetChars) {
      current = current.length > 0 ? `${current}\n\n${para}` : para;
    } else {
      if (current.length > 0) {
        chunks.push(current);
        const tail = current.slice(Math.max(0, current.length - overlapChars));
        current = `${tail}\n\n${para}`;
      } else {
        // Single paragraph bigger than target — break at sentence boundaries
        const sentences = para.split(/(?<=[.!?])\s+/);
        let buf = '';
        for (const s of sentences) {
          if (buf.length + s.length + 1 <= targetChars) {
            buf = buf.length > 0 ? `${buf} ${s}` : s;
          } else {
            if (buf.length > 0) chunks.push(buf);
            buf = s;
          }
        }
        if (buf.length > 0) current = buf;
      }
    }
  }
  if (current.length > 0) chunks.push(current);
  return chunks;
}

/* Infer tags from the source path + heading path so RAG filters are useful. */
function inferTags(source: string, headingPath: string[]): string[] {
  const tags = new Set<string>();
  const lower = `${source} ${headingPath.join(' ')}`.toLowerCase();
  const taxonomy: Record<string, string[]> = {
    surfaces: ['surface', 'fg-bold', 'bg-bold', 'bold inversion', 'data-surface'],
    typography: ['typography', 'font', 'display', 'headline', 'title', 'body-m', 'label'],
    color: ['color', 'colour', 'oklch', 'palette', 'scale'],
    spacing: ['spacing', 'f-step', 'margin', 'gutter'],
    shape: ['shape', 'radius', 'pill'],
    motion: ['motion', 'easing', 'duration'],
    elevation: ['elevation', 'shadow'],
    architecture: ['architecture', 'cascade', 'layer', 'injection', 'engine'],
    components: ['component', 'button', 'input', 'chip', 'card'],
    brand: ['brand', 'foundation', 'theme-scope'],
    accessibility: ['wcag', 'contrast', 'a11y', 'accessibility'],
  };
  for (const [tag, keywords] of Object.entries(taxonomy)) {
    if (keywords.some((k) => lower.includes(k))) tags.add(tag);
  }
  const sourceSegments = source.split(/[\/\\]/);
  if (sourceSegments.includes('.claude')) tags.add('skill');
  if (sourceSegments[0] === 'docs') tags.add('docs');
  return Array.from(tags);
}

// ============================================================================
// Component meta ingestion
// ============================================================================

/*
 * Reads packages/ui/src/components/*​/*.meta.ts files, extracts the key
 * semantic fields via tolerant regex (we don't run the TS compiler here —
 * meta files import recipes/tokens and those pull React transitively,
 * which would break a plain Node script), and renders a markdown wrapper
 * per component.
 *
 * Regex extraction is fine for our uniform meta shape: every file is a
 * single `export const X_META: ComponentMeta = { ... }` and the top-level
 * fields (name/description/category/tags/surfaceAware/multiAccent) always
 * appear before the `props` array, so matching the first occurrence is
 * unambiguous.
 *
 * Per-prop descriptions are captured too so a query like "how does the
 * condensed button prop work?" lands the right chunk.
 */

type ExtractedMeta = {
  name: string;
  displayName?: string;
  description?: string;
  category?: string;
  tags: string[];
  surfaceAware?: boolean;
  multiAccent?: boolean;
  props: Array<{ name: string; description?: string; type?: string; defaultValue?: string }>;
  slots: Array<{ name: string; description?: string }>;
};

// Hoisted regexes — compiled once at module load instead of per-file-per-prop
// inside the extraction loop. The `g` flags on OBJECT_RE and TAGS_VALUE_RE are
// load-bearing: they let the caller drive `exec()` / `matchAll()` walks.
const META_CONST_RE = /export\s+const\s+\w+_META\s*:\s*ComponentMeta\s*=\s*\{/;
const PROPS_ANCHOR_RE = /\n\s*props\s*:\s*\[/;
const SLOTS_ANCHOR_RE = /\n\s*slots\s*:\s*\[/;
const NAME_RE = /\bname\s*:\s*['"]([^'"]+)['"]/;
const DISPLAY_NAME_RE = /\bdisplayName\s*:\s*['"]([^'"]+)['"]/;
const DESCRIPTION_RE = /\bdescription\s*:\s*['"]([^'"]+)['"]/;
const CATEGORY_RE = /\bcategory\s*:\s*['"]([^'"]+)['"]/;
const TAGS_RE = /\btags\s*:\s*\[([^\]]*)\]/;
const TAG_VALUE_RE = /['"]([^'"]+)['"]/g;
const SURFACE_AWARE_RE = /\bsurfaceAware\s*:\s*(true|false)/;
const MULTI_ACCENT_RE = /\bmultiAccent\s*:\s*(true|false)/;
const OBJECT_NAME_RE = /\{\s*\n?\s*name\s*:\s*['"]([^'"]+)['"]([^}]*)\}/g;
const INNER_DESCRIPTION_RE = /description\s*:\s*['"]([^'"]+)['"]/;
const INNER_TYPE_RE = /type\s*:\s*['"]([^'"]+)['"]/;
const INNER_DEFAULT_RE = /defaultValue\s*:\s*['"]?([^,'"}\n]+)['"]?/;

function matchString(re: RegExp, source: string): string | undefined {
  const m = re.exec(source);
  return m ? m[1] : undefined;
}

function matchBool(re: RegExp, source: string): boolean | undefined {
  const m = re.exec(source);
  if (!m) return undefined;
  return m[1] === 'true';
}

function extractTopLevelMeta(fileText: string): ExtractedMeta | null {
  const constMatch = META_CONST_RE.exec(fileText);
  if (!constMatch) return null;
  const body = fileText.slice(constMatch.index + constMatch[0].length);

  const propsAnchor = PROPS_ANCHOR_RE.exec(body);
  const topSection = propsAnchor ? body.slice(0, propsAnchor.index) : body;

  const name = matchString(NAME_RE, topSection);
  if (!name) return null;

  const displayName = matchString(DISPLAY_NAME_RE, topSection);
  const description = matchString(DESCRIPTION_RE, topSection);
  const category = matchString(CATEGORY_RE, topSection);

  const tagsMatch = TAGS_RE.exec(topSection);
  const tags: string[] = tagsMatch
    ? Array.from(tagsMatch[1].matchAll(TAG_VALUE_RE)).map((m) => m[1])
    : [];

  const surfaceAware = matchBool(SURFACE_AWARE_RE, body);
  const multiAccent = matchBool(MULTI_ACCENT_RE, body);

  const props: ExtractedMeta['props'] = [];
  if (propsAnchor) {
    const afterProps = body.slice(propsAnchor.index + propsAnchor[0].length);
    OBJECT_NAME_RE.lastIndex = 0;
    let pm: RegExpExecArray | null;
    while ((pm = OBJECT_NAME_RE.exec(afterProps)) !== null) {
      const rest = pm[2];
      props.push({
        name: pm[1],
        description: matchString(INNER_DESCRIPTION_RE, rest),
        type: matchString(INNER_TYPE_RE, rest),
        defaultValue: matchString(INNER_DEFAULT_RE, rest)?.trim(),
      });
    }
  }

  const slots: ExtractedMeta['slots'] = [];
  const slotsAnchor = SLOTS_ANCHOR_RE.exec(body);
  if (slotsAnchor) {
    const afterSlots = body.slice(slotsAnchor.index + slotsAnchor[0].length);
    OBJECT_NAME_RE.lastIndex = 0;
    let sm: RegExpExecArray | null;
    while ((sm = OBJECT_NAME_RE.exec(afterSlots)) !== null) {
      slots.push({
        name: sm[1],
        description: matchString(INNER_DESCRIPTION_RE, sm[2]),
      });
      // First `],` closes the slots array — stop walking to avoid
      // bleeding into previewMatrix.
      if (afterSlots.slice(sm.index, sm.index + 200).includes('\n  ],')) break;
    }
  }

  return {
    name,
    displayName,
    description,
    category,
    tags,
    surfaceAware,
    multiAccent,
    props,
    slots,
  };
}

/** Render an ExtractedMeta as clean markdown so the embedding model sees
 *  structured prose instead of TypeScript syntax noise. */
function renderComponentMarkdown(meta: ExtractedMeta): string {
  const lines: string[] = [];
  lines.push(`# ${meta.displayName ?? meta.name}`);
  lines.push('');
  if (meta.description) {
    lines.push(meta.description);
    lines.push('');
  }
  const attrs: string[] = [];
  if (meta.category) attrs.push(`Category: **${meta.category}**`);
  if (meta.surfaceAware !== undefined)
    attrs.push(`Surface-aware: **${meta.surfaceAware ? 'yes' : 'no'}**`);
  if (meta.multiAccent !== undefined)
    attrs.push(`Multi-accent: **${meta.multiAccent ? 'yes' : 'no'}**`);
  if (attrs.length > 0) {
    lines.push(attrs.join('  \n'));
    lines.push('');
  }
  if (meta.tags.length > 0) {
    lines.push(`Tags: ${meta.tags.map((t) => `\`${t}\``).join(', ')}`);
    lines.push('');
  }
  if (meta.props.length > 0) {
    lines.push('## Props');
    lines.push('');
    for (const p of meta.props) {
      const typeStr = p.type ? ` (${p.type})` : '';
      const defStr = p.defaultValue ? ` — default \`${p.defaultValue}\`` : '';
      const desc = p.description ? `: ${p.description}` : '';
      lines.push(`- **${p.name}**${typeStr}${defStr}${desc}`);
    }
    lines.push('');
  }
  if (meta.slots.length > 0) {
    lines.push('## Slots');
    lines.push('');
    for (const s of meta.slots) {
      const desc = s.description ? `: ${s.description}` : '';
      lines.push(`- **${s.name}**${desc}`);
    }
    lines.push('');
  }
  return lines.join('\n').trim();
}

async function collectComponentChunks(): Promise<Chunk[]> {
  const componentsDir = join(REPO_ROOT, 'packages/ui/src/components');
  const entries = await readdir(componentsDir, { withFileTypes: true }).catch(() => []);
  const dirs = entries.filter((e) => e.isDirectory()).map((e) => join(componentsDir, e.name));
  const subListings = await Promise.all(dirs.map((dir) => readdir(dir).catch(() => [] as string[])));
  const metaFiles: string[] = [];
  dirs.forEach((dir, i) => {
    for (const fname of subListings[i]) {
      if (fname.endsWith('.meta.ts')) metaFiles.push(join(dir, fname));
    }
  });

  const results = await Promise.all(
    metaFiles.map(async (absPath) => {
      const rel = relative(REPO_ROOT, absPath).split(sep).join('/');
      const raw = await readFile(absPath, 'utf8');
      const extracted = extractTopLevelMeta(raw);
      if (!extracted) {
        console.warn(`[ingest] Skipping ${rel} — could not extract ComponentMeta`);
        return null;
      }
      const markdown = renderComponentMarkdown(extracted);
      const headingPath = ['Components', extracted.displayName ?? extracted.name];
      const tags = new Set<string>(['components', 'composition']);
      if (extracted.category) tags.add(extracted.category);
      if (extracted.surfaceAware) tags.add('surfaces');
      for (const t of extracted.tags) tags.add(t);
      return {
        source: rel,
        heading: extracted.displayName ?? extracted.name,
        headingPath,
        content: markdown,
        contentHash: hashContent(`${rel}::${markdown}`),
        tokens: estimateTokens(markdown),
        tags: Array.from(tags),
      } satisfies Chunk;
    }),
  );
  return results.filter((c): c is Chunk => c !== null);
}

// ============================================================================
// Shared data file ingestion
// ============================================================================

/** Extracts the leading JSDoc block (/** ... *​/) from a TS file, if present. */
function extractLeadingJsDoc(fileText: string): string | null {
  const m = /^\s*\/\*\*([\s\S]*?)\*\//.exec(fileText);
  if (!m) return null;
  return m[1]
    .split('\n')
    .map((line) => line.replace(/^\s*\*\s?/, ''))
    .join('\n')
    .trim();
}

async function collectSharedDataChunks(): Promise<Chunk[]> {
  const dataDir = join(REPO_ROOT, 'packages/shared/src/data');
  const entries = await readdir(dataDir, { withFileTypes: true }).catch(() => []);
  const files = entries
    .filter((e) => e.isFile() && e.name.endsWith('.ts') && !e.name.endsWith('.test.ts'))
    .map((e) => e.name);

  const perFile = await Promise.all(
    files.map(async (fname): Promise<Chunk[]> => {
      const absPath = join(dataDir, fname);
      const rel = relative(REPO_ROOT, absPath).split(sep).join('/');
      const raw = await readFile(absPath, 'utf8');
      const jsdoc = extractLeadingJsDoc(raw);
      const baseName = fname.replace(/\.ts$/, '');
      const codeBody = jsdoc ? raw.replace(/^\s*\/\*\*[\s\S]*?\*\/\s*/, '') : raw;
      const lines: string[] = [`# ${baseName}`, ''];
      if (jsdoc) {
        lines.push(jsdoc, '');
      }
      lines.push(`Source: \`${rel}\``, '', '```ts', codeBody.trim(), '```');
      const content = lines.join('\n');
      const pieces = subChunk(content);
      const headingPath = ['Foundations', baseName];
      return pieces.map((piece) => ({
        source: rel,
        heading: baseName,
        headingPath,
        content: piece,
        contentHash: hashContent(`${rel}::${headingPath.join('>')}::${piece}`),
        tokens: estimateTokens(piece),
        tags: ['foundations', inferDataTag(baseName)],
      }));
    }),
  );
  return perFile.flat();
}

function inferDataTag(baseName: string): string {
  const lower = baseName.toLowerCase();
  if (lower.includes('typography')) return 'typography';
  if (lower.includes('dimension') || lower.includes('scale')) return 'spacing';
  if (lower.includes('spacing')) return 'spacing';
  if (lower.includes('motion')) return 'motion';
  if (lower.includes('shape')) return 'shape';
  if (lower.includes('color') || lower.includes('colour')) return 'color';
  return 'architecture';
}

async function chunkFile(absPath: string): Promise<Chunk[]> {
  const rel = relative(REPO_ROOT, absPath).split(sep).join('/');
  const raw = await readFile(absPath, 'utf8');
  const sections = splitByHeadings(raw);
  const chunks: Chunk[] = [];

  for (const section of sections) {
    const heading = section.headingPath[section.headingPath.length - 1] ?? rel;
    const pieces = subChunk(section.body);
    for (const piece of pieces) {
      const content = piece.trim();
      if (content.length < 40) continue;
      const contentHash = hashContent(`${rel}::${section.headingPath.join('>')}::${content}`);
      chunks.push({
        source: rel,
        heading,
        headingPath: section.headingPath,
        content,
        contentHash,
        tokens: estimateTokens(content),
        tags: inferTags(rel, section.headingPath),
      });
    }
  }
  return chunks;
}

async function embedBatch(texts: string[]): Promise<number[][]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set');

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: EMBED_MODEL,
      input: texts,
      dimensions: EMBED_DIMENSIONS,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`OpenAI embedding request failed: ${response.status} ${errBody}`);
  }

  const payload = (await response.json()) as {
    data: Array<{ embedding: number[]; index: number }>;
  };
  return payload.data.sort((a, b) => a.index - b.index).map((d) => d.embedding);
}

async function main() {
  const args = parseArgs();
  const files = await collectSources(args.source);
  if (files.length === 0) {
    console.error('No knowledge sources found.');
    process.exit(1);
  }

  console.log(`[ingest] Found ${files.length} source file(s)`);
  const allChunks: Chunk[] = [];
  for (const file of files) {
    const chunks = await chunkFile(file);
    allChunks.push(...chunks);
    if (args.verbose) {
      console.log(`  ${relative(REPO_ROOT, file)} → ${chunks.length} chunks`);
    }
  }

  // Extend with component metas + shared data files unless the user
  // restricted the run to a specific source directory.
  if (!args.source || args.source === 'packages') {
    const componentChunks = await collectComponentChunks();
    allChunks.push(...componentChunks);
    console.log(`[ingest] Extracted ${componentChunks.length} component chunk(s)`);

    const dataChunks = await collectSharedDataChunks();
    allChunks.push(...dataChunks);
    console.log(`[ingest] Extracted ${dataChunks.length} shared-data chunk(s)`);
  }

  console.log(`[ingest] Chunked ${allChunks.length} section(s) total`);

  if (args.dryRun) {
    const bySource = new Map<string, number>();
    for (const c of allChunks) bySource.set(c.source, (bySource.get(c.source) ?? 0) + 1);
    console.log('[ingest] Dry run — per-source counts:');
    for (const [source, count] of bySource) console.log(`  ${source}: ${count}`);
    return;
  }

  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    console.error('NEXT_PUBLIC_CONVEX_URL is not set.');
    process.exit(1);
  }

  const { ConvexHttpClient } = await import('convex/browser');
  const { api } = await import('@oneui/convex');
  const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

  console.log(`[ingest] Embedding ${allChunks.length} chunk(s) in batches of ${EMBED_BATCH_SIZE}…`);
  for (let i = 0; i < allChunks.length; i += EMBED_BATCH_SIZE) {
    const batch = allChunks.slice(i, i + EMBED_BATCH_SIZE);
    const vectors = await embedBatch(batch.map((c) => `${c.headingPath.join(' > ')}\n${c.content}`));
    for (let j = 0; j < batch.length; j++) {
      const chunk = batch[j];
      await convex.mutation(api.knowledge.upsertChunk, {
        source: chunk.source,
        heading: chunk.heading,
        headingPath: chunk.headingPath,
        content: chunk.content,
        contentHash: chunk.contentHash,
        embedding: vectors[j],
        tokens: chunk.tokens,
        tags: chunk.tags,
      });
    }
    console.log(`[ingest] Upserted ${Math.min(i + EMBED_BATCH_SIZE, allChunks.length)} / ${allChunks.length}`);
  }

  console.log('[ingest] Pruning stale chunks per source…');
  const bySource = new Map<string, string[]>();
  for (const c of allChunks) {
    const list = bySource.get(c.source) ?? [];
    list.push(c.contentHash);
    bySource.set(c.source, list);
  }
  for (const [source, validHashes] of bySource) {
    const result = await convex.mutation(api.knowledge.pruneStale, { source, validHashes });
    if (result.deleted > 0) {
      console.log(`  ${source}: pruned ${result.deleted} stale chunk(s)`);
    }
  }

  const stats = await convex.query(api.knowledge.stats, {});
  console.log(`[ingest] Done. Index total: ${stats.total} chunk(s) across ${stats.sources.length} source(s).`);
}

main().catch((err) => {
  console.error('[ingest] Failed:', err);
  process.exit(1);
});
