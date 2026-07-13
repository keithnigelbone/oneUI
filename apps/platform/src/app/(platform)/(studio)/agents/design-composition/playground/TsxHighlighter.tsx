/**
 * TsxHighlighter.tsx
 *
 * Lightweight, dependency-free TSX/JSX syntax highlighter. Sibling of
 * `JsonHighlighter` — same approach, different vocabulary. Used by the
 * Code-view tab in the canvas when the renderer is `'sandpack'` so
 * designers can scan the AI-generated source without a fat editor.
 *
 * If we ever need real fidelity (semantic tokens, theme-matched palettes,
 * import auto-linkification) we can swap to Shiki — but for browsing
 * 100-line composition output, this is plenty.
 */

import React from 'react';

type Token =
  | { kind: 'comment'; value: string }
  | { kind: 'string'; value: string }
  | { kind: 'template'; value: string }
  | { kind: 'number'; value: string }
  | { kind: 'keyword'; value: string }
  | { kind: 'tag'; value: string }
  | { kind: 'attr'; value: string }
  | { kind: 'punct'; value: string }
  | { kind: 'text'; value: string };

const KEYWORDS = new Set([
  'import',
  'from',
  'export',
  'default',
  'const',
  'let',
  'var',
  'function',
  'return',
  'if',
  'else',
  'for',
  'while',
  'switch',
  'case',
  'break',
  'continue',
  'new',
  'class',
  'extends',
  'implements',
  'interface',
  'type',
  'as',
  'in',
  'of',
  'true',
  'false',
  'null',
  'undefined',
  'void',
  'async',
  'await',
  'try',
  'catch',
  'throw',
]);

const LINE_COMMENT_RE = /\/\/[^\n]*/y;
const BLOCK_COMMENT_RE = /\/\*[\s\S]*?\*\//y;
const STRING_DOUBLE_RE = /"(?:\\.|[^"\\])*"/y;
const STRING_SINGLE_RE = /'(?:\\.|[^'\\])*'/y;
const TEMPLATE_RE = /`(?:\\.|\$\{[^}]*\}|[^`\\])*`/y;
const NUMBER_RE = /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y;
const IDENT_RE = /[A-Za-z_$][A-Za-z0-9_$]*/y;

function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  // Track whether we're "inside a JSX opening tag" so we can mark
  // attribute names and tag names. Heuristic — toggles on `<` and `>`.
  let inTag = false;
  while (i < source.length) {
    const ch = source[i];

    // Whitespace passes through.
    if (ch === ' ' || ch === '\n' || ch === '\t' || ch === '\r') {
      let j = i;
      while (
        j < source.length &&
        (source[j] === ' ' || source[j] === '\n' || source[j] === '\t' || source[j] === '\r')
      ) j++;
      tokens.push({ kind: 'text', value: source.slice(i, j) });
      i = j;
      continue;
    }

    // Comments.
    if (ch === '/' && source[i + 1] === '/') {
      LINE_COMMENT_RE.lastIndex = i;
      const m = LINE_COMMENT_RE.exec(source);
      if (m) {
        tokens.push({ kind: 'comment', value: m[0] });
        i = LINE_COMMENT_RE.lastIndex;
        continue;
      }
    }
    if (ch === '/' && source[i + 1] === '*') {
      BLOCK_COMMENT_RE.lastIndex = i;
      const m = BLOCK_COMMENT_RE.exec(source);
      if (m) {
        tokens.push({ kind: 'comment', value: m[0] });
        i = BLOCK_COMMENT_RE.lastIndex;
        continue;
      }
    }

    // Strings.
    if (ch === '"') {
      STRING_DOUBLE_RE.lastIndex = i;
      const m = STRING_DOUBLE_RE.exec(source);
      if (m) {
        tokens.push({ kind: 'string', value: m[0] });
        i = STRING_DOUBLE_RE.lastIndex;
        continue;
      }
    }
    if (ch === "'") {
      STRING_SINGLE_RE.lastIndex = i;
      const m = STRING_SINGLE_RE.exec(source);
      if (m) {
        tokens.push({ kind: 'string', value: m[0] });
        i = STRING_SINGLE_RE.lastIndex;
        continue;
      }
    }
    if (ch === '`') {
      TEMPLATE_RE.lastIndex = i;
      const m = TEMPLATE_RE.exec(source);
      if (m) {
        tokens.push({ kind: 'template', value: m[0] });
        i = TEMPLATE_RE.lastIndex;
        continue;
      }
    }

    // Numbers.
    NUMBER_RE.lastIndex = i;
    const numMatch = NUMBER_RE.exec(source);
    if (numMatch && numMatch.index === i) {
      tokens.push({ kind: 'number', value: numMatch[0] });
      i = NUMBER_RE.lastIndex;
      continue;
    }

    // Identifiers + keywords + JSX tag/attr names.
    IDENT_RE.lastIndex = i;
    const identMatch = IDENT_RE.exec(source);
    if (identMatch && identMatch.index === i) {
      const value = identMatch[0];
      let kind: Token['kind'] = 'text';
      if (KEYWORDS.has(value)) kind = 'keyword';
      else if (inTag && /^[A-Z]/.test(value)) kind = 'tag';
      else if (inTag) kind = 'attr';
      tokens.push({ kind, value });
      i = IDENT_RE.lastIndex;
      continue;
    }

    // Punctuation. JSX `<` / `>` toggle the inTag flag — heuristic only,
    // but good enough for visually distinguishing JSX tags from JS code.
    if (ch === '<') {
      inTag = true;
      tokens.push({ kind: 'punct', value: ch });
      i += 1;
      continue;
    }
    if (ch === '>') {
      inTag = false;
      tokens.push({ kind: 'punct', value: ch });
      i += 1;
      continue;
    }
    if ('{}[]():;,.!?=+-*/&|^%~'.includes(ch)) {
      tokens.push({ kind: 'punct', value: ch });
      i += 1;
      continue;
    }

    tokens.push({ kind: 'text', value: ch });
    i += 1;
  }
  return tokens;
}

const CLASS_FOR: Record<Token['kind'], string> = {
  comment: 'tokComment',
  string: 'tokString',
  template: 'tokString',
  number: 'tokNumber',
  keyword: 'tokKeyword',
  tag: 'tokTag',
  attr: 'tokAttr',
  punct: 'tokPunct',
  text: '',
};

export function TsxHighlighter({ source }: { source: string }) {
  const tokens = tokenize(source);
  return (
    <>
      {tokens.map((t, i) =>
        t.kind === 'text' || CLASS_FOR[t.kind] === '' ? (
          <React.Fragment key={i}>{t.value}</React.Fragment>
        ) : (
          <span key={i} className={CLASS_FOR[t.kind]}>
            {t.value}
          </span>
        ),
      )}
    </>
  );
}
