/**
 * @oneui/experience-builder-validation
 *
 * The AST-level compliance validator slice of the Jio AI Experience Builder
 * Lab. Walks a parsed, alias-resolved artifact AST against the Jio import +
 * registry + meta allowlists (never string denylists — Pitfall 4) and returns
 * a `JioValidationResult` in every branch.
 */

export { validateAst, validateIRStructure } from './astValidator';
export { validateCompositionSpec } from './compositionSpecValidator';
export type {
  ArtifactAst,
  ArtifactAstNode,
  ComponentNode,
  ElementNode,
  TextNode,
  ResolvedImport,
  AstValue,
  ValidateAstContext,
  BackfillRecord,
} from './astValidator';

export {
  REDTEAM_FIXTURES,
  type RedTeamFixture,
} from './fixtures/redteam';
