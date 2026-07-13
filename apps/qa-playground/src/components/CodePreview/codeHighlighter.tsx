import { Fragment, type ReactNode } from 'react';
import styles from './CodePreview.module.css';

type TokenKind =
  | 'plain'
  | 'component'
  | 'property'
  | 'string'
  | 'boolean'
  | 'booleanJson'
  | 'null'
  | 'number'
  | 'punctuation'
  | 'function'
  | 'key';

type Token = { kind: TokenKind; text: string };

const TOKEN_CLASS: Record<TokenKind, string | undefined> = {
  plain: undefined,
  component: styles.tokenComponent,
  property: styles.tokenProperty,
  string: styles.tokenString,
  boolean: styles.tokenBoolean,
  booleanJson: styles.tokenBooleanJson,
  null: styles.tokenNull,
  number: styles.tokenNumber,
  punctuation: styles.tokenPunctuation,
  function: styles.tokenFunction,
  key: styles.tokenKey,
};

function renderTokens(tokens: Token[], keyPrefix: string): ReactNode[] {
  return tokens.map((token, index) => {
    if (token.kind === 'plain' || !TOKEN_CLASS[token.kind]) {
      return <Fragment key={`${keyPrefix}-${index}`}>{token.text}</Fragment>;
    }
    return (
      <span key={`${keyPrefix}-${index}`} className={TOKEN_CLASS[token.kind]}>
        {token.text}
      </span>
    );
  });
}

function pushPlain(tokens: Token[], text: string) {
  if (!text) return;
  const last = tokens[tokens.length - 1];
  if (last?.kind === 'plain') {
    last.text += text;
  } else {
    tokens.push({ kind: 'plain', text });
  }
}

function classifyJsxExpression(inner: string): TokenKind {
  const trimmed = inner.trim();
  if (trimmed === 'true' || trimmed === 'false') return 'boolean';
  if (trimmed === 'null') return 'null';
  if (/^-?\d+(?:\.\d+)?$/.test(trimmed)) return 'number';
  if (/^[a-zA-Z_$][\w$]*(?:\.[a-zA-Z_$][\w$]*)*\s*\(/.test(trimmed)) return 'function';
  return 'plain';
}

function tokenizeJsxLine(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    const rest = line.slice(i);

    if (rest.startsWith('</')) {
      pushPlain(tokens, '</');
      i += 2;
      const closeMatch = /^([A-Z][\w.]*)/.exec(line.slice(i));
      if (closeMatch) {
        tokens.push({ kind: 'component', text: closeMatch[1] });
        i += closeMatch[1].length;
      }
      continue;
    }

    if (rest.startsWith('<') && /^<[A-Z]/.test(rest)) {
      pushPlain(tokens, '<');
      i += 1;
      const openMatch = /^([A-Z][\w.]*)/.exec(line.slice(i));
      if (openMatch) {
        tokens.push({ kind: 'component', text: openMatch[1] });
        i += openMatch[1].length;
      }
      continue;
    }

    const stringMatch = /^("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/.exec(rest);
    if (stringMatch) {
      tokens.push({ kind: 'string', text: stringMatch[1] });
      i += stringMatch[1].length;
      continue;
    }

    const exprMatch = /^\{([^{}]*)\}/.exec(rest);
    if (exprMatch) {
      pushPlain(tokens, '{');
      const inner = exprMatch[1];
      const exprKind = classifyJsxExpression(inner);
      if (exprKind === 'plain') {
        pushPlain(tokens, inner);
      } else {
        tokens.push({ kind: exprKind, text: inner.trim() });
      }
      pushPlain(tokens, '}');
      i += exprMatch[0].length;
      continue;
    }

    const propMatch = /^(\s+)([\w-]+)(=)/.exec(rest);
    if (propMatch) {
      pushPlain(tokens, propMatch[1]);
      tokens.push({ kind: 'property', text: propMatch[2] });
      pushPlain(tokens, propMatch[3]);
      i += propMatch[0].length;
      continue;
    }

    const punctMatch = /^([/>\[\]{}(),:])/.exec(rest);
    if (punctMatch) {
      tokens.push({ kind: 'punctuation', text: punctMatch[1] });
      i += 1;
      continue;
    }

    pushPlain(tokens, rest[0] ?? '');
    i += 1;
  }

  return tokens;
}

function highlightJsx(code: string): ReactNode {
  const lines = code.split('\n');
  return lines.map((line, lineIndex) => (
    <Fragment key={`line-${lineIndex}`}>
      {lineIndex > 0 ? '\n' : null}
      {renderTokens(tokenizeJsxLine(line), `jsx-${lineIndex}`)}
    </Fragment>
  ));
}

function tokenizeJsonLine(line: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    const rest = line.slice(i);

    const keyMatch = /^("(?:\\.|[^"\\])*")(\s*:)/.exec(rest);
    if (keyMatch) {
      tokens.push({ kind: 'key', text: keyMatch[1] });
      pushPlain(tokens, keyMatch[2]);
      i += keyMatch[0].length;
      continue;
    }

    const stringMatch = /^("(?:\\.|[^"\\])*")/.exec(rest);
    if (stringMatch) {
      tokens.push({ kind: 'string', text: stringMatch[1] });
      i += stringMatch[1].length;
      continue;
    }

    const boolMatch = /^(true|false|null)\b/.exec(rest);
    if (boolMatch) {
      tokens.push({
        kind: boolMatch[1] === 'null' ? 'null' : 'booleanJson',
        text: boolMatch[1],
      });
      i += boolMatch[1].length;
      continue;
    }

    const numMatch = /^-?\d+(?:\.\d+)?/.exec(rest);
    if (numMatch) {
      tokens.push({ kind: 'number', text: numMatch[0] });
      i += numMatch[0].length;
      continue;
    }

    const punctMatch = /^([{}\[\],:])/.exec(rest);
    if (punctMatch) {
      tokens.push({ kind: 'punctuation', text: punctMatch[1] });
      i += 1;
      continue;
    }

    pushPlain(tokens, rest[0] ?? '');
    i += 1;
  }

  return tokens;
}

function highlightJson(code: string): ReactNode {
  const lines = code.split('\n');
  return lines.map((line, lineIndex) => (
    <Fragment key={`line-${lineIndex}`}>
      {lineIndex > 0 ? '\n' : null}
      {renderTokens(tokenizeJsonLine(line), `json-${lineIndex}`)}
    </Fragment>
  ));
}

export function highlightCode(code: string, language: CodePreviewLanguage): ReactNode {
  if (!code) return null;
  return language === 'json' ? highlightJson(code) : highlightJsx(code);
}
