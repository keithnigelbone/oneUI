/**
 * astToPage.ts
 *
 * Generates complete page files from AST:
 * - Next.js page (React Server Component or Client Component)
 * - React Native screen
 */

import type { ASTRoot } from '../types/componentAST';
import { astToReact } from './astToReact';

// ---------------------------------------------------------------------------
// Next.js Page
// ---------------------------------------------------------------------------

export interface NextPageOptions {
  /** Page component name (default: 'Page') */
  pageName?: string;
  /** Whether to use 'use client' directive (default: true) */
  clientComponent?: boolean;
  /** Import source for OneUI components (default: '@oneui/ui') */
  importSource?: string;
  /** Indent size (default: 2) */
  indent?: number;
}

export function astToNextPage(tree: ASTRoot, options: NextPageOptions = {}): string {
  const {
    pageName = 'Page',
    clientComponent = true,
    importSource = '@oneui/ui',
    indent = 2,
  } = options;

  const pad = ' '.repeat(indent);

  // Get JSX + imports from the base renderer
  const imports = new Set<string>();
  const jsxContent = astToReact(tree, { indent, importSource, includeImports: false });

  // Collect component names from the JSX to build import
  const componentMatches = jsxContent.match(/<([A-Z][a-zA-Z]*)/g);
  if (componentMatches) {
    for (const match of componentMatches) {
      const name = match.slice(1);
      imports.add(name);
    }
  }

  const lines: string[] = [];

  if (clientComponent) {
    lines.push("'use client';");
    lines.push('');
  }

  if (imports.size > 0) {
    lines.push(`import { ${[...imports].sort().join(', ')} } from '${importSource}';`);
    lines.push('');
  }

  lines.push(`export default function ${pageName}() {`);
  lines.push(`${pad}return (`);

  // Indent the JSX content
  const indentedJsx = jsxContent
    .split('\n')
    .map((line) => `${pad}${pad}${line}`)
    .join('\n');
  lines.push(indentedJsx);

  lines.push(`${pad});`);
  lines.push('}');
  lines.push('');

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// React Native Screen
// ---------------------------------------------------------------------------

export interface ReactNativeScreenOptions {
  /** Screen component name (default: 'Screen') */
  screenName?: string;
  /** Import source for OneUI components (default: '@oneui/ui') */
  importSource?: string;
  /** Indent size (default: 2) */
  indent?: number;
}

export function astToReactNativeScreen(tree: ASTRoot, options: ReactNativeScreenOptions = {}): string {
  const {
    screenName = 'Screen',
    importSource = '@oneui/ui',
    indent = 2,
  } = options;

  const pad = ' '.repeat(indent);

  // Get JSX content
  const jsxContent = astToReact(tree, { indent, importSource, includeImports: false });

  // Collect component names
  const imports = new Set<string>();
  const componentMatches = jsxContent.match(/<([A-Z][a-zA-Z]*)/g);
  if (componentMatches) {
    for (const match of componentMatches) {
      imports.add(match.slice(1));
    }
  }

  const lines: string[] = [];

  lines.push("import React from 'react';");
  lines.push("import { View, ScrollView, StyleSheet } from 'react-native';");

  if (imports.size > 0) {
    lines.push(`import { ${[...imports].sort().join(', ')} } from '${importSource}';`);
  }

  lines.push('');
  lines.push(`export function ${screenName}() {`);
  lines.push(`${pad}return (`);
  lines.push(`${pad}${pad}<ScrollView style={styles.container}>`);

  const indentedJsx = jsxContent
    .split('\n')
    .map((line) => `${pad}${pad}${pad}${line}`)
    .join('\n');
  lines.push(indentedJsx);

  lines.push(`${pad}${pad}</ScrollView>`);
  lines.push(`${pad});`);
  lines.push('}');
  lines.push('');
  lines.push('const styles = StyleSheet.create({');
  lines.push(`${pad}container: {`);
  lines.push(`${pad}${pad}flex: 1,`);
  lines.push(`${pad}${pad}padding: 16,`);
  lines.push(`${pad}},`);
  lines.push('});');
  lines.push('');

  return lines.join('\n');
}
