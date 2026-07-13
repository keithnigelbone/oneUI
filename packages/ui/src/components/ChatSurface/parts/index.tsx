/**
 * Barrel + helpers for ChatSurface message-part renderers.
 *
 * Consumers can either:
 *   a) import individual cards (e.g. `<ASTPreviewCard part={p} />`) and
 *      compose their own `renderMessagePart` slot, or
 *   b) pass `defaultRenderMessagePart` to ChatSurface to get the built-in
 *      dispatch (AST / tone guard / asset / composition error).
 */

import React from 'react';
import { ASTPreviewCard } from './ASTPreviewCard';
import { AssetCard } from './AssetCard';
import { CompositionCodePreviewCard } from './CompositionCodePreviewCard';
import { ToneGuardCard } from './ToneGuardCard';
import {
  isAssetPart,
  isCompositionASTPart,
  isCompositionCodePart,
  isCompositionErrorPart,
  isToneGuardPart,
} from './parts.shared';
import type { RenderMessagePart } from '../ChatSurface.shared';

export { ASTPreviewCard } from './ASTPreviewCard';
export type { ASTPreviewCardProps } from './ASTPreviewCard';
export { AssetCard } from './AssetCard';
export type { AssetCardProps } from './AssetCard';
export { CompositionCodePreviewCard } from './CompositionCodePreviewCard';
export type { CompositionCodePreviewCardProps } from './CompositionCodePreviewCard';
export { ToneGuardCard } from './ToneGuardCard';
export type { ToneGuardCardProps } from './ToneGuardCard';
export { AgentThinking } from './AgentThinking';
export type { AgentThinkingProps } from './AgentThinking';
export { StreamingText } from './StreamingText';
export type { StreamingTextProps } from './StreamingText';

export {
  PART_COMPOSITION_AST,
  PART_COMPOSITION_CODE,
  PART_COMPOSITION_ERROR,
  PART_COMPOSITION_REFERENCES,
  PART_COMPOSITION_RETRIEVAL_TRACE,
  PART_TONE_GUARD,
  PART_ASSET,
  isCompositionASTPart,
  isCompositionCodePart,
  isCompositionErrorPart,
  isCompositionReferencesPart,
  isCompositionRetrievalTracePart,
  isToneGuardPart,
  isAssetPart,
} from './parts.shared';

export type {
  AssetData,
  AssetKind,
  AssetPart,
  ChatSurfaceDataPart,
  CompositionASTData,
  CompositionASTPart,
  CompositionCodeData,
  CompositionCodePart,
  CompositionErrorData,
  CompositionErrorPart,
  CompositionReferencesData,
  CompositionReferencesPart,
  CompositionReferenceSummary,
  CompositionRetrievalTraceData,
  CompositionRetrievalTracePart,
  ToneGuardData,
  ToneGuardPart,
  ToneGuardPhase,
} from './parts.shared';

/**
 * Default dispatcher for ChatSurface `renderMessagePart`. Matches the
 * standard data-* parts and delegates everything else to the built-in
 * text + tool-call rendering.
 */
export const defaultRenderMessagePart: RenderMessagePart = (part) => {
  if (isCompositionASTPart(part)) {
    return <ASTPreviewCard part={part} />;
  }
  if (isCompositionCodePart(part)) {
    return <CompositionCodePreviewCard part={part} />;
  }
  if (isCompositionErrorPart(part)) {
    return (
      <div role="alert">
        {/* Minimal inline error — Voice/DCA callers can override with a richer card. */}
        Composition failed: {part.data.message}
      </div>
    );
  }
  if (isToneGuardPart(part)) {
    return <ToneGuardCard part={part} />;
  }
  if (isAssetPart(part)) {
    return <AssetCard part={part} />;
  }
  return null;
};
