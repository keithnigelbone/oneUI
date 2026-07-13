/**
 * Resolve git conflict markers where HEAD/dev differ only cosmetically,
 * or prefer HEAD when dev re-adds removed color-contrast tests.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..', '..', '..');

function normalize(s: string): string {
  return s
    .replace(/\u001b\[[0-9;]*m/g, '')
    .split('\n')
    .map((l) => l.trim().replace(/,$/, ''))
    .filter((l) => l.length > 0)
    .join('\n');
}

function pickSide(head: string, dev: string): string {
  const nh = normalize(head);
  const nd = normalize(dev);

  if (nh === nd) {
    // Prefer dev when it adds trailing commas / formatting only
    const devLines = dev.trimEnd().split('\n');
    const headLines = head.trimEnd().split('\n');
    if (devLines.length === headLines.length) return dev.trimEnd();
    return dev.trim() || head.trim();
  }

  if (!nh && nd) return dev.trim();
  if (nh && !nd) return head.trim();

  // Color-contrast tests removed on HEAD — keep HEAD when dev re-adds them
  const contrastRe =
    /color-contrast|colour contrast|COLOR_CONTRAST|minimum contrast|color contrast/i;
  if (contrastRe.test(dev) && !contrastRe.test(head)) return head.trim();

  // Default: keep current branch QA work
  return head.trim();
}

function resolveContent(source: string): { resolved: string; count: number } {
  let count = 0;
  let out = '';
  let i = 0;

  while (i < source.length) {
    const start = source.indexOf('<<<' + '<<<<', i);
    if (start < 0) {
      out += source.slice(i);
      break;
    }
    out += source.slice(i, start);
    const mid = source.indexOf('===' + '====', start);
    const end = source.indexOf('>>>' + '>>>>', mid);
    if (mid < 0 || end < 0) {
      out += source.slice(start);
      break;
    }

    const head = source.slice(start + source.slice(start).indexOf('\n') + 1, mid);
    const dev = source.slice(mid + 7, end);
    out += pickSide(head, dev);
    if (out.length > 0 && !out.endsWith('\n')) out += '\n';
    count += 1;
    i = end + source.slice(end).indexOf('\n') + 1;
    if (source[i - 1] !== '\n' && source[i] === undefined) i = end + 7;
    while (source[i] === '\n') {
      out += '\n';
      i += 1;
    }
  }

  return { resolved: out, count };
}

function walk(dir: string, files: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue;
    const p = join(dir, name);
    try {
      if (statSync(p).isDirectory()) walk(p, files);
      else files.push(p);
    } catch {
      /* skip broken symlinks */
    }
  }
  return files;
}

const explicit = process.argv.slice(2);
const targets =
  explicit.length > 0
    ? explicit.map((p) => (p.startsWith('/') ? p : join(ROOT, p)))
    : walk(join(ROOT, 'apps', 'qa-playground'));

let filesFixed = 0;
let blocksFixed = 0;

for (const file of targets) {
  const text = readFileSync(file, 'utf8');
  if (!text.includes('<<<<<<<')) continue;
  const { resolved, count } = resolveContent(text);
  if (count > 0) {
    writeFileSync(file, resolved, 'utf8');
    filesFixed += 1;
    blocksFixed += count;
    console.log(`resolved ${count} block(s): ${file.replace(ROOT + '/', '')}`);
  }
}

console.log(`Done. ${filesFixed} files, ${blocksFixed} conflict blocks.`);
