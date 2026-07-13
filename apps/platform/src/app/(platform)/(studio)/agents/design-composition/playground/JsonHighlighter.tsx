/**
 * JsonHighlighter.tsx
 *
 * Tiny, dependency-free JSON syntax highlighter. Tokenises a pretty-printed
 * JSON string into <span>s with class names the playground's `.codeIde`
 * CSS styles. We deliberately don't pull in a full highlighter library —
 * AST payloads are small, the tokens are limited (string/key/number/bool/
 * null/punct), and shipping a dark IDE feel is a CSS + regex problem.
 *
 * If richer language support is needed later (TSX from codegen), swap this
 * for `shiki` or `highlight.js`.
 */

import React from 'react';

type Token =
  | { kind: 'key'; value: string }
  | { kind: 'string'; value: string }
  | { kind: 'number'; value: string }
  | { kind: 'boolean'; value: string }
  | { kind: 'null'; value: string }
  | { kind: 'punct'; value: string }
  | { kind: 'text'; value: string };

const STRING_RE = /"(?:\\.|[^"\\])*"/y;
const NUMBER_RE = /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y;
const BOOL_RE = /true|false/y;
const NULL_RE = /null/y;

function tokenize(json: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  while (i < json.length) {
    const ch = json[i];

    // Whitespace + newlines — pass through verbatim.
    if (ch === ' ' || ch === '\n' || ch === '\t') {
      let j = i;
      while (j < json.length && (json[j] === ' ' || json[j] === '\n' || json[j] === '\t')) j++;
      tokens.push({ kind: 'text', value: json.slice(i, j) });
      i = j;
      continue;
    }

    // Strings — may be keys (followed by `:`) or values.
    if (ch === '"') {
      STRING_RE.lastIndex = i;
      const m = STRING_RE.exec(json);
      if (m) {
        // Look ahead: if the next non-whitespace char is `:`, this is a key.
        let k = STRING_RE.lastIndex;
        while (k < json.length && (json[k] === ' ' || json[k] === '\t')) k++;
        const isKey = json[k] === ':';
        tokens.push({ kind: isKey ? 'key' : 'string', value: m[0] });
        i = STRING_RE.lastIndex;
        continue;
      }
    }

    // Numbers.
    NUMBER_RE.lastIndex = i;
    const numMatch = NUMBER_RE.exec(json);
    if (numMatch && numMatch.index === i) {
      tokens.push({ kind: 'number', value: numMatch[0] });
      i = NUMBER_RE.lastIndex;
      continue;
    }

    // Booleans.
    BOOL_RE.lastIndex = i;
    const boolMatch = BOOL_RE.exec(json);
    if (boolMatch && boolMatch.index === i) {
      tokens.push({ kind: 'boolean', value: boolMatch[0] });
      i = BOOL_RE.lastIndex;
      continue;
    }

    // Null.
    NULL_RE.lastIndex = i;
    const nullMatch = NULL_RE.exec(json);
    if (nullMatch && nullMatch.index === i) {
      tokens.push({ kind: 'null', value: nullMatch[0] });
      i = NULL_RE.lastIndex;
      continue;
    }

    // Punctuation: { } [ ] : , — the structural characters.
    if ('{}[]:,'.includes(ch)) {
      tokens.push({ kind: 'punct', value: ch });
      i += 1;
      continue;
    }

    // Fallback: consume a single char as plain text.
    tokens.push({ kind: 'text', value: ch });
    i += 1;
  }
  return tokens;
}

const CLASS_FOR: Record<Token['kind'], string> = {
  key: 'tokKey',
  string: 'tokString',
  number: 'tokNumber',
  boolean: 'tokBoolean',
  null: 'tokNull',
  punct: 'tokPunct',
  text: '',
};

export function JsonHighlighter({ json }: { json: string }) {
  const tokens = tokenize(json);
  return (
    <>
      {tokens.map((t, i) =>
        t.kind === 'text' ? (
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
