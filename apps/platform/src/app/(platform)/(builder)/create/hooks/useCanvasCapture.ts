'use client';

import { useCallback, useRef } from 'react';
import type { PlatformEntry } from '@oneui/shared';
import type { Editor } from '@/design-tools/ExperienceCanvas';
import { editorGetSnapshot, editorLoadSnapshot } from '../lib/tldrawStoreApi';
import { enrichContentBlockPropsWithFoundation } from '../lib/enrichContentBlockFoundation';
import {
  clearTopLevelShapes,
  createMarketingFrame,
  extractScreens,
  getPrimaryFrameId,
  placeComponents,
  placeJioRibbonOnFrame,
  placeContentBlockOnFrame,
  removeChildComponentsOfType,
} from '@/design-tools/ExperienceCanvas';

export interface CaptureLayoutOptions {
  /** Add Jio ribbon (positioned by placement/orientation within artboard). */
  jioRibbon?: boolean;
  ribbonProps?: Record<string, unknown>;
  /** Add ContentBlock (positioned by position/alignment within artboard). */
  contentBlock?: boolean;
  contentBlockProps?: Record<string, unknown>;
  /** Platform brand's enabled foundation platforms — fills ContentBlock dimension overrides when needed. */
  foundationPlatformEntries?: PlatformEntry[];
}

/**
 * Detect whether an AST already contains a ContentBlock component.
 */
function astHasContentBlock(ast: unknown): boolean {
  const screens = extractScreens(ast);
  return screens.some((s) => s.components.some((c) => c.type === 'ContentBlock'));
}

function mergeContentBlockPlacementProps(
  raw: Record<string, unknown> | undefined,
  canvasWidth: number,
  canvasHeight: number,
  foundationPlatformEntries: PlatformEntry[] | undefined,
): Record<string, unknown> {
  const merged = {
    ...raw,
    canvasWidth,
    canvasHeight,
  };
  return enrichContentBlockPropsWithFoundation(merged, foundationPlatformEntries, canvasWidth);
}

/**
 * Hidden tldraw capture pipeline: build AST on a fresh frame, export PNG + snapshot.
 *
 * Layout stacking order:
 * 1. Frame (artboard at dimension size)
 * 2. JioRibbon (hug-content, positioned by placement/orientation)
 * 3. ContentBlock (hug-content, positioned by position/alignment props)
 */
export function useCanvasCapture() {
  const editorRef = useRef<Editor | null>(null);
  const pendingRef = useRef<Array<() => void>>([]);

  const drainPending = useCallback(() => {
    const ed = editorRef.current;
    if (!ed) return;
    const q = pendingRef.current.splice(0);
    for (const fn of q) {
      try {
        fn();
      } catch (e) {
        console.error('[useCanvasCapture] pending job failed', e);
      }
    }
  }, []);

  const onCaptureEditorReady = useCallback(
    (ed: Editor) => {
      editorRef.current = ed;
      drainPending();
    },
    [drainPending]
  );

  const runWhenEditorReady = useCallback((fn: (ed: Editor) => void) => {
    const ed = editorRef.current;
    if (ed) fn(ed);
    else pendingRef.current.push(() => fn(editorRef.current!));
  }, []);

  const captureLayoutToPngAndSnapshot = useCallback(
    async (
      ast: unknown,
      dimension: { width: number; height: number; name: string },
      options?: CaptureLayoutOptions
    ): Promise<{ blob: Blob; snapshot: string }> =>
      new Promise((resolve, reject) => {
        runWhenEditorReady((ed) => {
          void (async () => {
            try {
              clearTopLevelShapes(ed);
              const frameId = createMarketingFrame(ed, {
                w: dimension.width,
                h: dimension.height,
                name: dimension.name,
              });

              const hasContentBlockInAST = astHasContentBlock(ast);
              const screens = extractScreens(ast);
              const first = screens[0];

              if (hasContentBlockInAST) {
                // AST already has ContentBlock — skip generic placement,
                // we'll place it as a positioned shape below.
              } else if (first?.components?.length) {
                const nonContentBlockComponents = first.components.filter(
                  (c) => c.type !== 'ContentBlock'
                );
                if (nonContentBlockComponents.length > 0) {
                  placeComponents(ed, frameId, dimension.width, nonContentBlockComponents);
                }
              }

              // Layer 1: JioRibbon (hug-content, positioned by placement)
              if (options?.jioRibbon) {
                placeJioRibbonOnFrame(
                  ed,
                  frameId,
                  dimension.width,
                  dimension.height,
                  options.ribbonProps
                );
              }

              // Layer 2: ContentBlock (hug-content, positioned by position/alignment)
              if (options?.contentBlock) {
                placeContentBlockOnFrame(
                  ed,
                  frameId,
                  dimension.width,
                  dimension.height,
                  mergeContentBlockPlacementProps(
                    options.contentBlockProps,
                    dimension.width,
                    dimension.height,
                    options.foundationPlatformEntries,
                  ),
                );
              } else if (hasContentBlockInAST) {
                const cbComponent = first?.components?.find((c) => c.type === 'ContentBlock');
                if (cbComponent) {
                  placeContentBlockOnFrame(
                    ed,
                    frameId,
                    dimension.width,
                    dimension.height,
                    mergeContentBlockPlacementProps(
                      cbComponent.props as Record<string, unknown>,
                      dimension.width,
                      dimension.height,
                      options?.foundationPlatformEntries,
                    ),
                  );
                }
              }

              await new Promise<void>((r) => {
                requestAnimationFrame(() => requestAnimationFrame(() => r()));
              });
              ed.select(frameId as never);
              const result = await ed.toImage([frameId as never], { scale: 2, background: true });
              if (!result) {
                reject(new Error('Canvas toImage returned empty'));
                return;
              }
              const blob = 'blob' in result ? result.blob : (result as Blob);
              const snapshot = JSON.stringify(editorGetSnapshot(ed));
              resolve({ blob, snapshot });
            } catch (e) {
              reject(e);
            }
          })();
        });
      }),
    [runWhenEditorReady]
  );

  const recaptureFromStoredSnapshot = useCallback(
    async (
      snapshot: string,
      dimension: { width: number; height: number },
      options?: CaptureLayoutOptions
    ): Promise<{ blob: Blob; snapshot: string }> =>
      new Promise((resolve, reject) => {
        runWhenEditorReady((ed) => {
          void (async () => {
            try {
              editorLoadSnapshot(ed, JSON.parse(snapshot));
              await new Promise<void>((r) => {
                requestAnimationFrame(() => requestAnimationFrame(() => r()));
              });
              const frameId = getPrimaryFrameId(ed);
              if (!frameId) {
                reject(new Error('No frame in stored snapshot'));
                return;
              }
              if (options?.jioRibbon) {
                removeChildComponentsOfType(ed, frameId, 'JioRibbon');
                placeJioRibbonOnFrame(
                  ed,
                  frameId,
                  dimension.width,
                  dimension.height,
                  options.ribbonProps
                );
              }
              if (options?.contentBlock) {
                removeChildComponentsOfType(ed, frameId, 'ContentBlock');
                placeContentBlockOnFrame(
                  ed,
                  frameId,
                  dimension.width,
                  dimension.height,
                  mergeContentBlockPlacementProps(
                    options.contentBlockProps,
                    dimension.width,
                    dimension.height,
                    options.foundationPlatformEntries,
                  ),
                );
              }
              await new Promise<void>((r) => {
                requestAnimationFrame(() => requestAnimationFrame(() => r()));
              });
              ed.select(frameId as never);
              const result = await ed.toImage([frameId as never], { scale: 2, background: true });
              if (!result) {
                reject(new Error('Canvas toImage returned empty'));
                return;
              }
              const blob = 'blob' in result ? result.blob : (result as Blob);
              const nextSnapshot = JSON.stringify(editorGetSnapshot(ed));
              resolve({ blob, snapshot: nextSnapshot });
            } catch (e) {
              reject(e);
            }
          })();
        });
      }),
    [runWhenEditorReady]
  );

  return {
    onCaptureEditorReady,
    captureLayoutToPngAndSnapshot,
    recaptureFromStoredSnapshot,
  };
}
