/**
 * compositionCodeAnnotator.ts
 *
 * Server-side TSX post-processor that injects `data-oneui-loc` attributes
 * on every JSX opening element. The iframe-side selection bridge reads
 * those attributes when the user clicks: `event.target.closest('[data-oneui-loc]')`
 * gives the nearest annotated element, and we post `{ loc, tag }` back
 * to the parent so the next revision prompt can target it.
 *
 * Why server-side instead of a Babel plugin in Sandpack:
 *   - Sandpack's `react-ts` template uses a fixed bundler config we
 *     can't customize without forking the whole runtime.
 *   - We already parse the TSX server-side (validator runs there).
 *     Reusing the parse + adding a generator pass costs ~5ms per
 *     generation — invisible compared to the model call.
 *   - The annotated output stays in the user-visible TSX. Designers can
 *     see / inspect / copy the source with the data-attrs intact, which
 *     also means the click bridge keeps working when they paste the
 *     code into their own project.
 *
 * Imports `@babel/generator` (added explicitly to packages/shared's
 * dependencies; see package.json). Mirrors the validator's CJS-default
 * normalisation so it works in both ESM and CJS server contexts.
 */

import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
import _generate from '@babel/generator';
import type * as t from '@babel/types';

// `@babel/traverse` and `@babel/generator` ship CJS defaults under `.default`
// when imported from CJS-shaped contexts (Next API routes). Normalise once.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const traverse: typeof _traverse = ((_traverse as any).default ?? _traverse) as typeof _traverse;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generate: typeof _generate = ((_generate as any).default ?? _generate) as typeof _generate;

const LOC_ATTR = 'data-oneui-loc';
const COMPONENT_ATTR = 'data-oneui-component';

/**
 * Inject `data-oneui-loc` on every JSX opening element. Returns the
 * rewritten source. Falls back to the input verbatim on parse failure
 * (the validator will surface the error separately — we don't want one
 * post-process step to obliterate output).
 *
 * The attribute value is `L<line>:C<col>` based on the *parsed* source
 * positions, not the generated ones. Designers see the line numbers
 * matching what they'd see if they opened the file in an editor.
 */
export function annotateTsxWithLocations(code: string): string {
  let ast: t.File;
  try {
    ast = parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
      errorRecovery: true,
    });
  } catch {
    return code;
  }

  let mutated = false;
  traverse(ast, {
    JSXOpeningElement(path) {
      const node = path.node;
      const loc = node.loc?.start;
      if (!loc) return;

      // Skip Fragment shorthand `<>` — it has no name node, no attrs.
      if (node.name.type !== 'JSXIdentifier' && node.name.type !== 'JSXMemberExpression') {
        return;
      }

      // Resolve the component / tag identifier. For lowercase tags
      // (`<div>`, `<span>`) we don't need to annotate component name —
      // they're DOM elements, not @oneui components. For PascalCase
      // identifiers we capture the local binding name.
      let componentName: string | null = null;
      if (node.name.type === 'JSXIdentifier' && /^[A-Z]/.test(node.name.name)) {
        componentName = node.name.name;
      } else if (node.name.type === 'JSXMemberExpression') {
        // `<Foo.Bar>` style — flatten to "Foo.Bar".
        const parts: string[] = [];
        let cursor: t.JSXMemberExpression | t.JSXIdentifier = node.name;
        while (cursor.type === 'JSXMemberExpression') {
          parts.unshift(cursor.property.name);
          cursor = cursor.object;
        }
        if (cursor.type === 'JSXIdentifier') parts.unshift(cursor.name);
        componentName = parts.join('.');
      }

      // Don't double-annotate. Models may sometimes echo the attr from
      // an existing turn; we keep their value rather than overwriting,
      // so user-supplied locs still work.
      const existingLoc = node.attributes.find(
        (a) =>
          a.type === 'JSXAttribute' &&
          a.name.type === 'JSXIdentifier' &&
          a.name.name === LOC_ATTR,
      );
      if (!existingLoc) {
        const value = `L${loc.line}:C${loc.column + 1}`;
        node.attributes.push({
          type: 'JSXAttribute',
          name: { type: 'JSXIdentifier', name: LOC_ATTR },
          value: { type: 'StringLiteral', value },
        } as t.JSXAttribute);
        mutated = true;
      }

      if (componentName) {
        const existingComp = node.attributes.find(
          (a) =>
            a.type === 'JSXAttribute' &&
            a.name.type === 'JSXIdentifier' &&
            a.name.name === COMPONENT_ATTR,
        );
        if (!existingComp) {
          node.attributes.push({
            type: 'JSXAttribute',
            name: { type: 'JSXIdentifier', name: COMPONENT_ATTR },
            value: { type: 'StringLiteral', value: componentName },
          } as t.JSXAttribute);
          mutated = true;
        }
      }
    },
  });

  if (!mutated) return code;

  try {
    const output = generate(ast, {
      retainLines: true,
      compact: false,
      jsescOption: { minimal: true },
    });
    return output.code;
  } catch {
    return code;
  }
}
