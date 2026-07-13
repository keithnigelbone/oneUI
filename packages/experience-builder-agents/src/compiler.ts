/**
 * compiler.ts — GEN-06: IR → AST → React + Jio CSS code string.
 *
 * The compiler is PURE and deterministic (no model, no I/O). It:
 *
 *   1. maps IR to canonical `CompositionSpec`, applies the quality recipe, then
 *      maps to the shared ASTRoot;
 *   2. emits the canonical React + Jio CSS code STRING via
 *      `astToReactComponent(ast, { importSource: '@oneui/ui', ... })` — this
 *      string is the PERSISTED compiled bundle (D-07). `importSource` defaults
 *      to `@oneui/ui`, which is exactly the approved-import constraint;
 *   3. runs `validateAst(astRootToArtifactAst(ast.root), ctx)` — the D-08
 *      step-2 allowlist check — against the same AST that is code-generated.
 *
 * The ephemeral `ASTRenderer` runtime-render path is intentionally NOT wired
 * here: D-07 says that render is an internal-convenience sanity check, never
 * persisted and never the export source. Only the codegen string is the
 * artifact.
 *
 * Acceptance triad (D-08), proven credential-free in `compiler.test.ts`:
 *   (leg 1) the emitted module type-checks and its `@oneui/ui` imports resolve;
 *   (leg 2) `validation.passed === true` for a compliant IR, `false` for a
 *           non-compliant one (literal / unregistered component, Pitfall #5);
 *   (leg 3) the codegen string is snapshot-stable for a fixed IR (determinism).
 */

import {
  compositionSpecToAst,
  improveCompositionSpecQuality,
  irToAst,
  irToCompositionSpec,
  type JioExperienceIRT,
  type JioValidationResultT,
} from '@oneui/experience-builder-core';
import type { ASTNode } from '@oneui/shared/types/componentAST';
import { astToReactComponent } from '@oneui/shared/codegen';
import { validateAst, type ArtifactAst, type ArtifactAstNode, type ResolvedImport } from '@oneui/experience-builder-validation';

/** Optional compile context — forwarded to the validator (brand/profile). */
export interface CompileContext {
  brandId?: string;
  outputProfile?: string;
  /** Raw user prompt/intent, used only to keep focused module outputs from being normalized as landing pages. */
  intent?: string;
}

/** The compiler's output: the canonical bundle string + the validation result. */
export interface CompileResult {
  /** The canonical, persisted React + Jio CSS code string (D-07). */
  bundle: string;
  /** The D-08 allowlist validation of the compiled output. */
  validation: JioValidationResultT;
}

/** The component name emitted for every compiled artifact (snapshot-stable). */
export const GENERATED_ARTIFACT_NAME = 'GeneratedArtifact';

function mergeValidationResults(
  first: JioValidationResultT,
  second: JioValidationResultT,
): JioValidationResultT {
  const blocking = [...first.blocking, ...second.blocking];
  return {
    passed: blocking.length === 0,
    blocking,
    warnings: [...first.warnings, ...second.warnings],
    repairSuggestions: [...first.repairSuggestions, ...second.repairSuggestions],
    componentGaps: [...first.componentGaps, ...second.componentGaps],
    foundationGaps: [...first.foundationGaps, ...second.foundationGaps],
  };
}

function toValidatorNode(node: ASTNode): ArtifactAstNode {
  if (node.kind === 'text') {
    return {
      id: node.id,
      kind: 'text',
      text: node.text,
    };
  }
  if (node.kind === 'element') {
    return {
      id: node.id,
      kind: 'element',
      tag: node.tag,
      props: node.props as Record<string, never>,
      children: node.children.map(toValidatorNode),
    };
  }
  return {
    id: node.id,
    kind: 'component',
    type: node.type,
    props: node.props as Record<string, never>,
    children: node.children.map(toValidatorNode),
  };
}

function collectTypes(node: ArtifactAstNode, acc: Set<string>): void {
  if (node.kind !== 'component') return;
  acc.add(node.type);
  node.children.forEach((child) => collectTypes(child, acc));
}

export function astRootToArtifactAst(root: ASTNode): ArtifactAst {
  const validatorRoot = toValidatorNode(root);
  const types = new Set<string>();
  collectTypes(validatorRoot, types);
  const imports: ResolvedImport[] = [...types].map((type) => ({
    source: `@oneui/ui/components/${type}`,
    imported: type,
    local: type,
  }));
  return { imports, root: validatorRoot };
}

/**
 * Compile an IR into the canonical React + Jio CSS bundle string and validate
 * it against the Jio allowlist. Pure + deterministic: same IR → same bundle.
 */
export function compile(ir: JioExperienceIRT, ctx: CompileContext = {}): CompileResult {
  // (1) IR → CompositionSpec → ASTRoot. CompositionSpec is the canonical
  // generated artifact for Experience Lab; compile from it so Daytona, export,
  // validation, and the same-tree canvas render the same component-only UI.
  const spec = improveCompositionSpecQuality(
    irToCompositionSpec(ir, {
      ...(ctx.intent ? { intent: ctx.intent } : {}),
    }),
  );
  const ast = compositionSpecToAst(spec);

  // (2) ASTRoot → canonical React + Jio CSS string (D-07). importSource defaults
  //     to '@oneui/ui' — the approved-import constraint.
  const bundle = astToReactComponent(ast, {
    importSource: '@oneui/ui',
    componentName: GENERATED_ARTIFACT_NAME,
  });

  // (3) Allowlist validation (D-08 step 2) via the existing bridge — the
  //     Stack→Container remap + synthesized Jio imports are reused, not redone.
  //     `skipPlaceholderContent`: the compiler's internal validation is the
  //     IMPORT/COMPONENT/LITERAL allowlist gate, NOT the content quality gate.
  //     The deterministic backfill (D-08/QUAL-03) is the intended last-resort
  //     safety net here; its humanized defaults must not hard-block the assembler.
  //     The placeholder-content BLOCK (QUAL-04) lives at the WORKFLOW quality gate
  //     (`validateIrAndAst`), which reads Plan-03 provenance to distinguish a
  //     flagged-acceptable backfill from real shipping output.
  const originalAst = irToAst(ir);
  const originalValidation = validateAst(astRootToArtifactAst(originalAst.root), {
    ...ctx,
    skipPlaceholderContent: true,
  });
  const compiledValidation = validateAst(astRootToArtifactAst(ast.root), {
    ...ctx,
    skipPlaceholderContent: true,
  });
  const validation = mergeValidationResults(originalValidation, compiledValidation);

  return { bundle, validation };
}
