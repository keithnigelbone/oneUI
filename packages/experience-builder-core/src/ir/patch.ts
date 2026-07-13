/**
 * patch.ts
 *
 * JSON-Patch (RFC 6902-style) diff/apply over the Jio Experience IR (IR-03).
 * Repair loops (P3) patch the IR, never the JSX — so a stable, self-contained
 * diff/apply pair is part of the frozen contract.
 *
 * Self-contained (no external json-patch dependency): a minimal but correct
 * implementation supporting `add` / `remove` / `replace` over the JSON tree.
 * `diffIr(a, b)` then `applyPatch(a, patch)` round-trips to `b`.
 *
 * Pure-TS, JSON-compatible values only.
 */

import type { JioExperienceIRT } from './schema';

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export interface PatchOperation {
  op: 'add' | 'remove' | 'replace';
  /** JSON Pointer path, e.g. '/sections/0/name'. */
  path: string;
  /** Present for add/replace. */
  value?: JsonValue;
}

export type IrPatch = PatchOperation[];

// ---------------------------------------------------------------------------
// JSON Pointer helpers (RFC 6901 escaping)
// ---------------------------------------------------------------------------

function escapeToken(token: string): string {
  return token.replace(/~/g, '~0').replace(/\//g, '~1');
}
function unescapeToken(token: string): string {
  return token.replace(/~1/g, '/').replace(/~0/g, '~');
}
function toPath(tokens: Array<string | number>): string {
  return '/' + tokens.map((t) => escapeToken(String(t))).join('/');
}
function parsePath(path: string): string[] {
  if (path === '') return [];
  return path
    .split('/')
    .slice(1)
    .map(unescapeToken);
}

function isObject(v: unknown): v is Record<string, JsonValue> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

function deepEqual(a: JsonValue, b: JsonValue): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ---------------------------------------------------------------------------
// Diff
// ---------------------------------------------------------------------------

function diffValue(
  a: JsonValue,
  b: JsonValue,
  pathTokens: Array<string | number>,
  ops: PatchOperation[],
): void {
  if (deepEqual(a, b)) return;

  // Type changed or primitive change → replace.
  const bothObjects = isObject(a) && isObject(b);
  const bothArrays = Array.isArray(a) && Array.isArray(b);

  if (bothObjects) {
    const aObj = a as Record<string, JsonValue>;
    const bObj = b as Record<string, JsonValue>;
    // Removed keys.
    for (const key of Object.keys(aObj)) {
      if (!(key in bObj)) {
        ops.push({ op: 'remove', path: toPath([...pathTokens, key]) });
      }
    }
    // Added / changed keys.
    for (const key of Object.keys(bObj)) {
      if (!(key in aObj)) {
        ops.push({ op: 'add', path: toPath([...pathTokens, key]), value: deepClone(bObj[key]) });
      } else {
        diffValue(aObj[key], bObj[key], [...pathTokens, key], ops);
      }
    }
    return;
  }

  if (bothArrays) {
    const aArr = a as JsonValue[];
    const bArr = b as JsonValue[];
    const min = Math.min(aArr.length, bArr.length);
    for (let i = 0; i < min; i++) {
      diffValue(aArr[i], bArr[i], [...pathTokens, i], ops);
    }
    if (bArr.length > aArr.length) {
      for (let i = aArr.length; i < bArr.length; i++) {
        ops.push({ op: 'add', path: toPath([...pathTokens, i]), value: deepClone(bArr[i]) });
      }
    } else if (aArr.length > bArr.length) {
      // Remove from the tail backwards so indices stay valid.
      for (let i = aArr.length - 1; i >= bArr.length; i--) {
        ops.push({ op: 'remove', path: toPath([...pathTokens, i]) });
      }
    }
    return;
  }

  // Primitive or type mismatch.
  ops.push({ op: 'replace', path: toPath(pathTokens), value: deepClone(b) });
}

/** Produce a JSON-patch that transforms IR `a` into IR `b`. */
export function diffIr(a: JioExperienceIRT, b: JioExperienceIRT): IrPatch {
  const ops: PatchOperation[] = [];
  diffValue(a as unknown as JsonValue, b as unknown as JsonValue, [], ops);
  return ops;
}

// ---------------------------------------------------------------------------
// Apply
// ---------------------------------------------------------------------------

function applyOne(doc: JsonValue, op: PatchOperation): JsonValue {
  const tokens = parsePath(op.path);
  if (tokens.length === 0) {
    // Whole-document replace.
    if (op.op === 'replace' || op.op === 'add') return deepClone(op.value as JsonValue);
    throw new Error(`Cannot ${op.op} the whole document`);
  }

  const root = doc;
  let parent: JsonValue = root;
  for (let i = 0; i < tokens.length - 1; i++) {
    const token = tokens[i];
    if (Array.isArray(parent)) {
      parent = parent[Number(token)];
    } else if (isObject(parent)) {
      parent = parent[token];
    } else {
      throw new Error(`Path not found: ${op.path}`);
    }
  }

  const last = tokens[tokens.length - 1];

  if (Array.isArray(parent)) {
    const idx = Number(last);
    switch (op.op) {
      case 'add':
        parent.splice(idx, 0, deepClone(op.value as JsonValue));
        break;
      case 'remove':
        parent.splice(idx, 1);
        break;
      case 'replace':
        parent[idx] = deepClone(op.value as JsonValue);
        break;
    }
  } else if (isObject(parent)) {
    switch (op.op) {
      case 'add':
      case 'replace':
        parent[last] = deepClone(op.value as JsonValue);
        break;
      case 'remove':
        delete parent[last];
        break;
    }
  } else {
    throw new Error(`Path parent is not a container: ${op.path}`);
  }

  return root;
}

/** Apply a JSON-patch to an IR document, returning a NEW document. */
export function applyPatch(ir: JioExperienceIRT, patch: IrPatch): JioExperienceIRT {
  let doc = deepClone(ir) as unknown as JsonValue;
  for (const op of patch) {
    doc = applyOne(doc, op);
  }
  return doc as unknown as JioExperienceIRT;
}
