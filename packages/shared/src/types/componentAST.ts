/**
 * componentAST.ts
 *
 * Serializable component tree format for:
 * - Templates and micro-patterns
 * - Code export (AST → JSX source)
 * - Future experience builder
 *
 * All values are JSON-compatible — no React elements, no functions.
 */

// ---------------------------------------------------------------------------
// Serializable values
// ---------------------------------------------------------------------------

/** JSON-compatible value types that can appear in AST props */
export type ASTSerializableValue =
  | string
  | number
  | boolean
  | null
  | ASTSerializableValue[]
  | { [key: string]: ASTSerializableValue };

// ---------------------------------------------------------------------------
// AST Node types
// ---------------------------------------------------------------------------

/** A registered component (resolved via COMPONENT_REGISTRY) */
export interface ComponentASTNode {
  /** Unique node identifier (for selection, keying, diffing) */
  id: string;
  kind: 'component';
  /** PascalCase component name (e.g., 'Button', 'IconButton') */
  type: string;
  /** Props to pass to the component */
  props: Record<string, ASTSerializableValue>;
  /** Child nodes (rendered as children prop) */
  children: ASTNode[];
}

/** A raw HTML element wrapper */
export interface ElementASTNode {
  id: string;
  kind: 'element';
  /** HTML tag name (e.g., 'div', 'span', 'section') */
  tag: string;
  /** HTML attributes / props */
  props: Record<string, ASTSerializableValue>;
  /** Child nodes */
  children: ASTNode[];
}

/** A text content node */
export interface TextASTNode {
  id: string;
  kind: 'text';
  /** Text content */
  text: string;
}

/** Union of all node types */
export type ASTNode = ComponentASTNode | ElementASTNode | TextASTNode;

// ---------------------------------------------------------------------------
// AST Root (document)
// ---------------------------------------------------------------------------

export interface ASTRoot {
  /** Schema version for forward compatibility */
  version: 1;
  /** Human-readable name for this composition */
  name: string;
  /** Root node of the tree */
  root: ASTNode;
  /** Optional surface mode to wrap the entire tree */
  surfaceMode?: string;
  /** Arbitrary metadata (author, created, tags, etc.) */
  metadata?: Record<string, ASTSerializableValue>;
}
