/**
 * compositionDesignGate.ts
 *
 * Deterministic quality gate for TSX-mode DCA output. The strict code
 * validator answers "is this safe and token-correct enough to render?";
 * this gate answers the next question: "does this look like a plausible
 * first draft for the requested screen archetype?"
 */

import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import * as t from '@babel/types';
import {
  PLAYGROUND_IMAGE_FALLBACK_SRC,
  isPlaygroundImageUrl,
} from './playgroundImageAssets';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const traverse: typeof _traverse = ((_traverse as any).default ?? _traverse) as typeof _traverse;

export type DesignGateSeverity = 'error' | 'warning' | 'info';

export type CompositionDesignArchetype =
  | 'settings'
  | 'ecommerce'
  | 'auth'
  | 'generic';

export interface DesignGateIssue {
  severity: DesignGateSeverity;
  id: string;
  message: string;
  line?: number;
}

export interface DesignGateResult {
  passed: boolean;
  score: number;
  issues: DesignGateIssue[];
  archetype: CompositionDesignArchetype;
}

export interface EvaluateCompositionDesignGateOptions {
  code: string;
  prompt?: string;
  context?: string;
}

const CONTROL_COMPONENTS = new Set([
  'Switch',
  'Checkbox',
  'Radio',
  'Toggle',
  'ToggleGroup',
  'SegmentedControl',
  'Select',
  'Slider',
  'Stepper',
  'NumberField',
  'Input',
  'InputField',
  'SearchInput',
]);

const STRUCTURAL_COMPONENTS = new Set([
  'Surface',
  'Container',
  'Grid',
  'ScrollArea',
  'ListItem',
  'ListItemGroup',
  'PreviewCard',
  'Tabs',
  'TabGroup',
]);

const ECOMMERCE_IMAGE_IDS = [
  'ecommerce-hero',
  'product-card-1',
  'product-card-2',
  'product-card-3',
  'lifestyle-1',
] as const;

type JSXNameNode = t.JSXIdentifier | t.JSXMemberExpression | t.JSXNamespacedName;

interface GateStats {
  totalComponents: number;
  structuralCount: number;
  controlsCount: number;
  listItemCount: number;
  imageSrcs: Array<{ src: string | null; line?: number }>;
  placeholderImageLines: number[];
  remoteImageLines: number[];
  ecommerceImageCount: number;
  iconCount: number;
  giantIcons: Array<{ line?: number; reason: string }>;
}

export function evaluateCompositionDesignGate({
  code,
  prompt = '',
  context,
}: EvaluateCompositionDesignGateOptions): DesignGateResult {
  const issues: DesignGateIssue[] = [];
  const archetype = inferCompositionDesignArchetype(prompt, code);

  let ast: t.File;
  try {
    ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
      errorRecovery: false,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return scoreDesignGate(archetype, [
      {
        severity: 'error',
        id: 'design-parse-failure',
        message: `TSX parse failed before design gate could run: ${msg}`,
      },
    ]);
  }

  const stats: GateStats = {
    totalComponents: 0,
    structuralCount: 0,
    controlsCount: 0,
    listItemCount: 0,
    imageSrcs: [],
    placeholderImageLines: [],
    remoteImageLines: [],
    ecommerceImageCount: 0,
    iconCount: 0,
    giantIcons: [],
  };

  traverse(ast, {
    JSXOpeningElement(path) {
      const tagName = getJSXName(path.node.name);
      if (!tagName || !/^[A-Z]/.test(tagName)) return;

      stats.totalComponents += 1;
      if (STRUCTURAL_COMPONENTS.has(tagName)) stats.structuralCount += 1;
      if (CONTROL_COMPONENTS.has(tagName)) stats.controlsCount += 1;
      if (tagName === 'ListItem') stats.listItemCount += 1;

      if (tagName === 'Icon') {
        stats.iconCount += 1;
        const giantReason = getGiantIconReason(path.node);
        if (giantReason) {
          stats.giantIcons.push({
            line: path.node.loc?.start.line,
            reason: giantReason,
          });
        }
      }

      if (tagName === 'Image') {
        const src = attrStringValue(path.node, 'src');
        const line = path.node.loc?.start.line;
        stats.imageSrcs.push({ src, line });

        if (!src || src === PLAYGROUND_IMAGE_FALLBACK_SRC) {
          if (line) stats.placeholderImageLines.push(line);
          return;
        }

        if (!isPlaygroundImageUrl(src)) {
          if (line) stats.remoteImageLines.push(line);
          return;
        }

        if (ECOMMERCE_IMAGE_IDS.some((id) => src.includes(`/${id}.`))) {
          stats.ecommerceImageCount += 1;
        }
      }
    },
  });

  for (const icon of stats.giantIcons) {
    issues.push({
      severity: archetype === 'settings' ? 'error' : 'warning',
      id: 'giant-icon',
      message: `Icon is rendered at hero scale (${icon.reason}). Generated app screens should use compact semantic icons, not oversized decorative glyphs.`,
      line: icon.line,
    });
  }

  for (const line of stats.remoteImageLines) {
    issues.push({
      severity: 'error',
      id: 'design-remote-image',
      message: 'Image source is outside the local playground image registry. Use a seeded /playground-assets/images/... URL.',
      line,
    });
  }

  for (const line of stats.placeholderImageLines) {
    issues.push({
      severity: archetype === 'ecommerce' ? 'error' : 'warning',
      id: 'placeholder-image',
      message: 'Placeholder images are not acceptable as final visual content. Choose a concrete local image asset from the playground registry.',
      line,
    });
  }

  if (stats.totalComponents < 5) {
    issues.push({
      severity: 'warning',
      id: 'thin-composition',
      message: 'Composition is very thin for a playground first draft. Add meaningful structure, content, and component variety.',
    });
  }

  if (stats.structuralCount < 3 && context !== 'social-post') {
    issues.push({
      severity: 'warning',
      id: 'weak-layout-structure',
      message: 'Composition has little OneUI structure. Use Surface, Container, Grid, ListItem, or PreviewCard to create a scannable layout.',
    });
  }

  if (archetype === 'settings') {
    const settingsRows = stats.controlsCount + stats.listItemCount;
    if (settingsRows < 2) {
      issues.push({
        severity: 'error',
        id: 'settings-missing-controls',
        message: 'Settings screens need at least two usable settings rows or controls such as Switch, Checkbox, Select, Slider, or ListItem.',
      });
    }
    if (stats.giantIcons.length > 0) {
      issues.push({
        severity: 'error',
        id: 'settings-giant-icon',
        message: 'Settings screens should be dense, row-based utility screens. Remove hero-sized icons and use compact leading icons only when they support row scanning.',
        line: stats.giantIcons[0]?.line,
      });
    }
    if (stats.controlsCount === 0 && stats.iconCount > 2) {
      issues.push({
        severity: 'error',
        id: 'settings-icon-only-layout',
        message: 'Settings output is icon-led instead of control-led. Build rows with labels, helper text, and interactive controls.',
      });
    }
  }

  if (archetype === 'ecommerce') {
    const hasConcreteLocalImage = stats.imageSrcs.some(
      ({ src }) => Boolean(src && src !== PLAYGROUND_IMAGE_FALLBACK_SRC && isPlaygroundImageUrl(src)),
    );
    if (!hasConcreteLocalImage) {
      issues.push({
        severity: 'error',
        id: 'ecommerce-missing-local-image',
        message: 'E-commerce compositions need at least one concrete local product, lifestyle, or hero image from /playground-assets/images/.',
      });
    }
    if (stats.ecommerceImageCount === 0 && hasConcreteLocalImage) {
      issues.push({
        severity: 'warning',
        id: 'ecommerce-weak-image-choice',
        message: 'Use e-commerce-specific local assets such as ecommerce-hero.svg or product-card-*.svg for commerce screens.',
      });
    }
  }

  return scoreDesignGate(archetype, issues);
}

export function inferCompositionDesignArchetype(
  prompt: string,
  code = '',
): CompositionDesignArchetype {
  const promptText = prompt.toLowerCase();
  if (/\b(settings?|preferences?|notifications?|privacy|sound|messages?|app updates?|security)\b/.test(promptText)) {
    return 'settings';
  }
  if (/\b(e-?commerce|shop|store|cart|checkout|catalog|product|deals?|grocery|marketplace)\b/.test(promptText)) {
    return 'ecommerce';
  }
  if (/\b(login|sign in|signin|otp|password|authenticate|auth)\b/.test(promptText)) {
    return 'auth';
  }

  const codeText = code.toLowerCase();
  if (/\b(settings?|preferences?|notifications?|privacy|sound|messages?|app updates?|security)\b/.test(codeText)) {
    return 'settings';
  }
  if (/\b(e-?commerce|shop|store|cart|checkout|catalog|product|deals?|grocery|marketplace)\b/.test(codeText)) {
    return 'ecommerce';
  }
  if (/\b(login|sign in|signin|otp|password|authenticate|auth)\b/.test(codeText)) {
    return 'auth';
  }
  return 'generic';
}

export function formatDesignGateIssues(result: DesignGateResult): string {
  if (result.issues.length === 0) return '';
  return result.issues
    .map((issue) => {
      const where = issue.line ? ` (line ${issue.line})` : '';
      const tag = issue.severity === 'error' ? 'ERROR' : issue.severity === 'warning' ? 'warn' : 'info';
      return `- [${tag}]${where} ${issue.message}`;
    })
    .join('\n');
}

function scoreDesignGate(
  archetype: CompositionDesignArchetype,
  issues: DesignGateIssue[],
): DesignGateResult {
  const errorCount = issues.filter((issue) => issue.severity === 'error').length;
  const warningCount = issues.filter((issue) => issue.severity === 'warning').length;
  const score = Math.max(0, 100 - errorCount * 30 - warningCount * 10);
  return {
    archetype,
    issues,
    score,
    passed: errorCount === 0 && score >= 70,
  };
}

function getJSXName(name: JSXNameNode): string | null {
  if (name.type === 'JSXIdentifier') return name.name;
  if (name.type === 'JSXMemberExpression') {
    const object = getJSXName(name.object);
    const property = getJSXName(name.property);
    return object && property ? `${object}.${property}` : null;
  }
  return null;
}

function attrStringValue(node: t.JSXOpeningElement, attrName: string): string | null {
  const attr = findJSXAttr(node, attrName);
  if (!attr?.value) return null;
  if (attr.value.type === 'StringLiteral') return attr.value.value.trim();
  if (
    attr.value.type === 'JSXExpressionContainer' &&
    attr.value.expression.type === 'StringLiteral'
  ) {
    return attr.value.expression.value.trim();
  }
  return null;
}

function findJSXAttr(node: t.JSXOpeningElement, attrName: string): t.JSXAttribute | null {
  for (const attr of node.attributes) {
    if (
      attr.type === 'JSXAttribute' &&
      attr.name.type === 'JSXIdentifier' &&
      attr.name.name === attrName
    ) {
      return attr;
    }
  }
  return null;
}

function getStyleObject(node: t.JSXOpeningElement): t.ObjectExpression | null {
  const attr = findJSXAttr(node, 'style');
  if (
    attr?.value?.type === 'JSXExpressionContainer' &&
    attr.value.expression.type === 'ObjectExpression'
  ) {
    return attr.value.expression;
  }
  return null;
}

function propName(prop: t.ObjectProperty): string | null {
  if (prop.key.type === 'Identifier') return prop.key.name;
  if (prop.key.type === 'StringLiteral') return prop.key.value;
  return null;
}

function getStyleString(object: t.ObjectExpression, key: string): string | null {
  for (const prop of object.properties) {
    if (prop.type !== 'ObjectProperty' || propName(prop) !== key) continue;
    if (prop.value.type === 'StringLiteral') return prop.value.value.trim();
    if (prop.value.type === 'NumericLiteral') return String(prop.value.value);
  }
  return null;
}

function getNumericAttrValue(node: t.JSXOpeningElement, attrName: string): number | null {
  const attr = findJSXAttr(node, attrName);
  if (!attr?.value) return null;
  if (attr.value.type === 'StringLiteral') {
    const numeric = Number(attr.value.value);
    return Number.isFinite(numeric) ? numeric : null;
  }
  if (
    attr.value.type === 'JSXExpressionContainer' &&
    attr.value.expression.type === 'NumericLiteral'
  ) {
    return attr.value.expression.value;
  }
  return null;
}

function getGiantIconReason(node: t.JSXOpeningElement): string | null {
  const numericSize = getNumericAttrValue(node, 'size');
  if (numericSize !== null && numericSize > 64) {
    return `size ${numericSize}`;
  }

  const stringSize = attrStringValue(node, 'size');
  if (stringSize && /(?:hero|jumbo|display|xxl|2xl|3xl)/i.test(stringSize)) {
    return `size "${stringSize}"`;
  }

  const styleObject = getStyleObject(node);
  if (!styleObject) return null;

  for (const key of ['width', 'height', 'fontSize', 'minWidth', 'minHeight']) {
    const value = getStyleString(styleObject, key);
    if (!value) continue;
    const estimated = estimateCssSizePx(value);
    if (estimated !== null && estimated > 72) {
      return `${key}: ${value}`;
    }
    if (/--Display-[A-Z]+-FontSize/.test(value)) {
      return `${key}: ${value}`;
    }
  }

  const transform = getStyleString(styleObject, 'transform');
  const scale = transform ? /scale\((\d+(?:\.\d+)?)\)/.exec(transform) : null;
  if (scale && Number(scale[1]) > 2) {
    return `transform: ${transform}`;
  }

  return null;
}

function estimateCssSizePx(value: string): number | null {
  const px = /(\d+(?:\.\d+)?)px\b/.exec(value);
  if (px) return Number(px[1]);

  const rem = /(\d+(?:\.\d+)?)(?:rem|em)\b/.exec(value);
  if (rem) return Number(rem[1]) * 16;

  const spacingMultiplier = /calc\(\s*var\(--Spacing-40\)\s*\*\s*(\d+(?:\.\d+)?)\s*\)/.exec(value);
  if (spacingMultiplier) return Number(spacingMultiplier[1]) * 80;

  const spacingToken = /var\(--Spacing-(\d+(?:\.\d+)?)\)/.exec(value);
  if (spacingToken) return Number(spacingToken[1]) * 4;

  return null;
}
