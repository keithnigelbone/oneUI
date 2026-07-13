'use client';

import { useMemo, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { IconButton } from '@oneui/ui/components/IconButton';
import { SemanticBadge } from './SemanticBadge';
import styles from './MachineDocs.module.css';

interface CodeSnippetProps {
  title: string;
  language: string;
  code: string;
}

type TokenType = 'plain' | 'keyword' | 'string' | 'tag' | 'comment' | 'number' | 'type' | 'punctuation' | 'operator' | 'prop' | 'boolean' | 'function';

const TOKEN_RULES: Array<{ type: TokenType; pattern: RegExp }> = [
  // Comments (single-line)
  { type: 'comment', pattern: /^\/\/.*/ },
  { type: 'comment', pattern: /^\/\*[\s\S]*?\*\// },
  // Template literals
  { type: 'string', pattern: /^`[^`]*`/ },
  // Strings
  { type: 'string', pattern: /^"[^"]*"|^'[^']*'/ },
  // JSX tags (opening/closing/self-closing)
  { type: 'tag', pattern: /^<\/?[A-Z][A-Za-z0-9.]*/ },
  { type: 'tag', pattern: /^<\/?[a-z][a-z0-9-]*/ },
  { type: 'tag', pattern: /^\/>|^>/ },
  // Booleans
  { type: 'boolean', pattern: /^(true|false|null|undefined)\b/ },
  // Keywords
  { type: 'keyword', pattern: /^(import|export|from|const|let|var|function|return|type|interface|class|extends|implements|new|this|if|else|switch|case|default|break|continue|for|while|do|throw|try|catch|finally|async|await|yield|of|in|as|typeof|instanceof|void|delete|readonly|enum|namespace|declare|abstract|static|private|protected|public|get|set|super)\b/ },
  // Type names (PascalCase identifiers)
  { type: 'type', pattern: /^[A-Z][A-Za-z0-9]*(?=[\s<>,;:)}\]|&])/ },
  // Function calls (identifier followed by paren)
  { type: 'function', pattern: /^[a-zA-Z_$][a-zA-Z0-9_$]*(?=\()/ },
  // JSX prop names (identifier followed by =)
  { type: 'prop', pattern: /^[a-zA-Z_$][a-zA-Z0-9_$-]*(?==)/ },
  // Numbers
  { type: 'number', pattern: /^0x[0-9a-fA-F]+|^0b[01]+|^0o[0-7]+|^\d+\.?\d*([eE][+-]?\d+)?/ },
  // Operators
  { type: 'operator', pattern: /^(===|!==|==|!=|<=|>=|=>|&&|\|\||[+\-*/%=<>!&|^~?:])+/ },
  // Punctuation
  { type: 'punctuation', pattern: /^[{}()\[\];,.]/ },
  // Identifiers (plain)
  { type: 'plain', pattern: /^[a-zA-Z_$][a-zA-Z0-9_$]*/ },
  // Whitespace
  { type: 'plain', pattern: /^\s+/ },
];

function tokenize(line: string): Array<{ type: TokenType; value: string }> {
  const tokens: Array<{ type: TokenType; value: string }> = [];
  let rest = line;
  while (rest.length > 0) {
    let matched = false;
    for (const rule of TOKEN_RULES) {
      const m = rest.match(rule.pattern);
      if (m) {
        tokens.push({ type: rule.type, value: m[0] });
        rest = rest.slice(m[0].length);
        matched = true;
        break;
      }
    }
    if (!matched) {
      tokens.push({ type: 'plain', value: rest[0] });
      rest = rest.slice(1);
    }
  }
  return tokens;
}

function getTokenClass(type: TokenType): string | undefined {
  switch (type) {
    case 'keyword': return styles.tokenKeyword;
    case 'string': return styles.tokenString;
    case 'tag': return styles.tokenTag;
    case 'comment': return styles.tokenComment;
    case 'number': return styles.tokenNumber;
    case 'type': return styles.tokenType;
    case 'punctuation': return styles.tokenPunctuation;
    case 'operator': return styles.tokenOperator;
    case 'prop': return styles.tokenProp;
    case 'boolean': return styles.tokenBoolean;
    case 'function': return styles.tokenFunction;
    default: return undefined;
  }
}

export function CodeSnippet({ title, language, code }: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);
  const lines = useMemo(() => code.split('\n'), [code]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section className={styles.codeSnippet}>
      <header className={styles.codeSnippetHeader}>
        <div className={styles.snippetTitleWrap}>
          <h4 className={styles.snippetTitle}>{title}</h4>
          <SemanticBadge intent="neutral" label={language} />
        </div>
        <IconButton
          icon={copied ? <Check size={14} /> : <Copy size={14} />}
          onPress={handleCopy}
          attention="low"
          size="small"
          aria-label={`Copy ${title} snippet`}
        />
      </header>
      <pre className={styles.code}>
        {lines.map((line, lineIndex) => (
          <div key={`${title}-line-${lineIndex}`}>
            {tokenize(line).map((token, tokenIndex) => (
              <span key={`${title}-${lineIndex}-${tokenIndex}`} className={getTokenClass(token.type)}>
                {token.value}
              </span>
            ))}
          </div>
        ))}
      </pre>
    </section>
  );
}
