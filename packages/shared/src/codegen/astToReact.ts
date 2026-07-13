/**
 * astToReact.ts
 *
 * Pure function: AST → React/JSX source code.
 * No React dependency — runs in Node, browser, or worker.
 */

import type { ASTRoot, ASTNode, ASTSerializableValue } from '../types/componentAST';

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface AstToReactOptions {
  /** Number of spaces per indent level (default: 2) */
  indent?: number;
  /** Import source for components (default: '@oneui/ui') */
  importSource?: string;
  /** Whether to include import statements (default: true) */
  includeImports?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function indentStr(level: number, spaces: number): string {
  return ' '.repeat(level * spaces);
}

function serializePropValue(value: ASTSerializableValue): string {
  if (value === null) return '{null}';
  if (typeof value === 'string') return `"${value.replace(/"/g, '\\"')}"`;
  if (typeof value === 'boolean') return value ? '' : '{false}'; // true → bare prop
  if (typeof value === 'number') return `{${value}}`;
  // Arrays and objects
  return `{${JSON.stringify(value)}}`;
}

function renderProps(props: Record<string, ASTSerializableValue>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined) continue;
    if (typeof value === 'boolean' && value === true) {
      parts.push(key);
    } else {
      const serialized = serializePropValue(value);
      parts.push(`${key}=${serialized}`);
    }
  }
  return parts.length > 0 ? ' ' + parts.join(' ') : '';
}

// ---------------------------------------------------------------------------
// Node rendering
// ---------------------------------------------------------------------------

function renderNode(
  node: ASTNode,
  level: number,
  spaces: number,
  imports: Set<string>,
): string {
  const pad = indentStr(level, spaces);

  switch (node.kind) {
    case 'text':
      return `${pad}${node.text}`;

    case 'element': {
      const propsStr = renderProps(node.props);
      if (node.children.length === 0) {
        return `${pad}<${node.tag}${propsStr} />`;
      }
      const childrenStr = node.children
        .map((child) => renderNode(child, level + 1, spaces, imports))
        .join('\n');
      return `${pad}<${node.tag}${propsStr}>\n${childrenStr}\n${pad}</${node.tag}>`;
    }

    case 'component': {
      imports.add(node.type);
      const propsStr = renderProps(node.props);
      if (node.children.length === 0) {
        return `${pad}<${node.type}${propsStr} />`;
      }
      // Single text child — inline it
      if (node.children.length === 1 && node.children[0].kind === 'text') {
        return `${pad}<${node.type}${propsStr}>${node.children[0].text}</${node.type}>`;
      }
      const childrenStr = node.children
        .map((child) => renderNode(child, level + 1, spaces, imports))
        .join('\n');
      return `${pad}<${node.type}${propsStr}>\n${childrenStr}\n${pad}</${node.type}>`;
    }
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Compile an AST tree to a React/JSX source string.
 *
 * @param tree - The AST root document
 * @param options - Output formatting options
 * @returns Complete JSX source with optional import statements
 */
export function astToReact(tree: ASTRoot, options: AstToReactOptions = {}): string {
  const {
    indent = 2,
    importSource = '@oneui/ui',
    includeImports = true,
  } = options;

  const imports = new Set<string>();
  const jsx = renderNode(tree.root, 0, indent, imports);

  if (!includeImports || imports.size === 0) {
    return jsx;
  }

  const importLine = `import { ${[...imports].sort().join(', ')} } from '${importSource}';`;
  return `${importLine}\n\n${jsx}`;
}

/**
 * Compile an AST tree to a complete React component file.
 * Wraps the JSX in a named function component with proper imports.
 */
export function astToReactComponent(
  tree: ASTRoot,
  options: AstToReactOptions & { componentName?: string } = {},
): string {
  const {
    indent = 2,
    importSource = '@oneui/ui',
    componentName = 'GeneratedComponent',
  } = options;

  const imports = new Set<string>();
  const jsx = renderNode(tree.root, indent, indent, imports);

  const lines: string[] = [];

  // React import
  lines.push("import React from 'react';");

  // Component imports
  if (imports.size > 0) {
    lines.push(`import { ${[...imports].sort().join(', ')} } from '${importSource}';`);
  }

  lines.push('');
  lines.push(`export function ${componentName}() {`);
  lines.push(`${' '.repeat(indent)}return (`);
  lines.push(jsx);
  lines.push(`${' '.repeat(indent)});`);
  lines.push('}');
  lines.push('');

  return lines.join('\n');
}
