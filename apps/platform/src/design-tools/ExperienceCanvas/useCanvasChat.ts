/**
 * useCanvasChat.ts
 *
 * State + action hook for the canvas chat. Lifts the generation pipeline
 * (compose / sketch, image upload, voice input, model selection) out of
 * the legacy `AIPrompt` component so `CanvasChatPanel` can render a
 * `ChatSurface` from `@oneui/ui-internal` with no native HTML leakage.
 *
 * Exposes a transcript shaped as `ChatMessage[]` (Vercel AI SDK compatible
 * shape) so ChatSurface renders with its default message bubble treatment
 * — primary-tinted badges, streaming indicator, etc.
 */
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createShapeId, type Editor } from 'tldraw';
import type { ChatMessage, ChatStatus } from '@oneui/ui-internal/components/ChatSurface/ChatSurface.shared';
import { COMPONENT_SHAPE_TYPE } from './ComponentShape';
import { extractScreens, placeComponents } from './canvasHelpers';
import { SKETCH_HTML_SHAPE_TYPE, SKETCH_VIEWPORTS, type SketchViewport } from './SketchHTMLShape';

export type GenerationMode = 'compose' | 'sketch';

export const DEFAULT_CANVAS_MODEL = 'claude-sonnet-4-20250514';

export interface CanvasChatModelOption {
  value: string;
  label: string;
}

export const CANVAS_CHAT_MODELS: CanvasChatModelOption[] = [
  { value: DEFAULT_CANVAS_MODEL, label: 'Sonnet 4' },
  { value: 'claude-haiku-4-5-20251001', label: 'Haiku 4.5' },
];

/** One turn in the chat transcript — the raw form before mapping to ChatMessage. */
export interface CanvasChatTurn {
  id: string;
  prompt: string;
  mode: GenerationMode;
  viewport?: SketchViewport;
  status: 'success' | 'error';
  error?: string;
  timestamp: number;
  screensCount?: number;
}

export interface UseCanvasChatReturn {
  /** Transcript in Vercel AI SDK message shape — feed directly into ChatSurface. */
  messages: ChatMessage[];
  /** Streaming status — drives ChatSurface's thinking indicator + composer disabled. */
  status: ChatStatus;
  /** Last transport error, if any. */
  error: Error | null;
  /** Current generation mode. */
  mode: GenerationMode;
  setMode: (m: GenerationMode) => void;
  /** Selected model value (`CANVAS_CHAT_MODELS`). */
  model: string;
  setModel: (m: string) => void;
  /** Sketch-only: viewport preset. */
  sketchViewport: SketchViewport;
  setSketchViewport: (v: SketchViewport) => void;
  /** Attached reference image (data URL) — null when nothing attached. */
  imagePreview: string | null;
  /** Attach an image from a user-selected File. */
  attachImage: (file: File) => void;
  /** Remove the currently-attached image. */
  clearImage: () => void;
  /** Submit the prompt. Called by the composer on Enter / Send. */
  submit: (text: string) => void;
  /** Human-readable model label for ChatComposer's modelLabel slot. */
  modelLabel: string;
}

function genTurnId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Turn the internal transcript into ChatSurface-compatible messages. */
function turnsToMessages(turns: CanvasChatTurn[]): ChatMessage[] {
  const out: ChatMessage[] = [];
  for (const turn of turns) {
    out.push({
      id: `${turn.id}-user`,
      role: 'user',
      parts: [{ type: 'text', text: turn.prompt }],
    });
    const assistantText = turn.status === 'success'
      ? (turn.mode === 'sketch'
        ? `Sketched ${turn.screensCount ?? 1} ${(turn.screensCount ?? 1) === 1 ? 'artboard' : 'artboards'} (${turn.viewport ?? 'mobile'}).`
        : `Composed ${turn.screensCount ?? 1} ${(turn.screensCount ?? 1) === 1 ? 'screen' : 'screens'}.`)
      : `Generation failed: ${turn.error ?? 'Unknown error'}`;
    out.push({
      id: `${turn.id}-assistant`,
      role: 'assistant',
      parts: [{ type: 'text', text: assistantText }],
    });
  }
  return out;
}

export function useCanvasChat(editor: Editor): UseCanvasChatReturn {
  const [turns, setTurns] = useState<CanvasChatTurn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [mode, setMode] = useState<GenerationMode>('compose');
  const [model, setModel] = useState<string>(DEFAULT_CANVAS_MODEL);
  const [sketchViewport, setSketchViewport] = useState<SketchViewport>('mobile');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const attachImage = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setImagePreview(result);
      setImageBase64(result.split(',')[1] ?? null);
    };
    reader.readAsDataURL(file);
  }, []);

  const clearImage = useCallback(() => {
    setImagePreview(null);
    setImageBase64(null);
  }, []);

  const submit = useCallback(
    async (raw: string) => {
      const input = raw.trim();
      if (!input || loading) return;

      // Existing selection becomes implicit context.
      const selectedIds = editor.getSelectedShapeIds();
      const selectedComponents = selectedIds
        .map((id) => editor.getShape(id) as any)
        .filter((s) => s?.type === COMPONENT_SHAPE_TYPE);
      const hasSelection = selectedComponents.length > 0;
      const selectionContext = hasSelection
        ? selectedComponents
            .map((s) => `${s.props.componentType}(${s.props.childText || ''})`)
            .join(', ')
        : '';

      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      setLoading(true);
      setError(null);

      const body: Record<string, unknown> = {
        prompt: hasSelection ? `Context: selected: ${selectionContext}. Request: ${input}` : input,
        model,
      };
      if (imageBase64) body.referenceImage = imageBase64;

      try {
        if (mode === 'sketch') {
          const res = await fetch('/api/canvas/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: ac.signal,
          });
          if (!res.ok) {
            const d = await res.json().catch(() => ({}));
            throw new Error((d as { error?: string }).error || `HTTP ${res.status}`);
          }
          const { ast } = (await res.json()) as { ast?: { root?: unknown } };
          if (!ast?.root) throw new Error('Sketch returned no AST');

          const viewportSpec = SKETCH_VIEWPORTS[sketchViewport];
          const viewBounds = editor.getViewportPageBounds() as any;
          const allShapes = editor.getCurrentPageShapes() as any[];
          let rightEdge = 0;
          for (const s of allShapes) {
            const b = editor.getShapePageBounds((s as any).id) as any;
            if (b) {
              const r = b.x + (b.w ?? b.width ?? 0);
              if (r > rightEdge) rightEdge = r;
            }
          }
          const x = allShapes.length === 0
            ? (viewBounds?.x ?? 0) + ((viewBounds?.w ?? viewBounds?.width ?? 800) / 2) - viewportSpec.w / 2
            : rightEdge + 60;
          const y = allShapes.length === 0
            ? (viewBounds?.y ?? 0) + ((viewBounds?.h ?? viewBounds?.height ?? 600) / 2) - viewportSpec.h / 2
            : 0;

          const sid = createShapeId() as any;
          editor.createShape({
            id: sid,
            type: SKETCH_HTML_SHAPE_TYPE as any,
            x,
            y,
            props: {
              w: viewportSpec.w,
              h: viewportSpec.h,
              ast,
              viewport: sketchViewport,
              prompt: input,
            },
          });
          editor.select(sid);
          editor.zoomToSelection({ animation: { duration: 300 } });

          setTurns((prev) => [
            ...prev,
            {
              id: genTurnId(),
              prompt: input,
              mode: 'sketch',
              viewport: sketchViewport,
              status: 'success',
              timestamp: Date.now(),
              screensCount: 1,
            },
          ]);
          clearImage();
          return;
        }

        const res = await fetch('/api/canvas/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: ac.signal,
        });
        if (!res.ok) {
          const d = await res.json().catch(() => ({}));
          throw new Error((d as { error?: string }).error || `HTTP ${res.status}`);
        }
        const { ast } = (await res.json()) as { ast?: { root?: unknown } };
        if (!ast?.root) throw new Error('Invalid response');

        const screens = extractScreens(ast as any);
        if (
          screens.length === 0 ||
          screens.every((s: any) => s.components.length === 0)
        ) {
          throw new Error('No components generated');
        }

        const allShapes = editor.getCurrentPageShapes() as any[];
        const existingFrames = allShapes.filter((s) => s.type === 'frame');
        const sel = selectedIds.length === 1 ? (editor.getShape(selectedIds[0]) as any) : null;

        if (screens.length === 1) {
          const tf = sel?.type === 'frame' ? sel : existingFrames[0] ?? null;
          let tid: string;
          let fw: number;
          if (tf) {
            tid = tf.id;
            fw = tf.props?.w ?? 390;
          } else {
            tid = createShapeId() as any;
            fw = 390;
            const b = editor.getViewportPageBounds() as any;
            editor.createShape({
              id: tid as any,
              type: 'frame',
              x: (b.x ?? 0) + ((b.w ?? b.width ?? 800) / 2) - 195,
              y: (b.y ?? 0) + ((b.h ?? b.height ?? 600) / 2) - 422,
              props: { w: 390, h: 844, name: screens[0].name, color: 'white' },
            });
          }
          placeComponents(editor, tid, fw, screens[0].components);
          editor.select(tid as any);
        } else {
          let rightEdge = 0;
          for (const s of allShapes) {
            const b = editor.getShapePageBounds((s as any).id) as any;
            if (b) {
              const r = b.x + (b.w ?? b.width ?? 0);
              if (r > rightEdge) rightEdge = r;
            }
          }
          const ids: string[] = [];
          screens.forEach((s: any, i: number) => {
            const fid = createShapeId() as any;
            ids.push(fid);
            editor.createShape({
              id: fid,
              type: 'frame',
              x: rightEdge + 60 + i * 430,
              y: 0,
              props: { w: 390, h: 844, name: s.name, color: 'white' },
            });
            placeComponents(editor, fid, 390, s.components);
          });
          editor.select(...ids.map((id) => id as any));
        }
        editor.zoomToSelection({ animation: { duration: 300 } });

        setTurns((prev) => [
          ...prev,
          {
            id: genTurnId(),
            prompt: input,
            mode: 'compose',
            status: 'success',
            timestamp: Date.now(),
            screensCount: screens.length,
          },
        ]);
        clearImage();
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        const message = err instanceof Error ? err.message : 'Unknown error';
        const asError = err instanceof Error ? err : new Error(message);
        setError(asError);
        setTurns((prev) => [
          ...prev,
          {
            id: genTurnId(),
            prompt: input,
            mode,
            viewport: mode === 'sketch' ? sketchViewport : undefined,
            status: 'error',
            error: message,
            timestamp: Date.now(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [loading, editor, model, mode, sketchViewport, imageBase64, clearImage],
  );

  const status: ChatStatus = loading ? 'streaming' : error ? 'error' : 'ready';
  const messages = turnsToMessages(turns);
  const modelLabel = CANVAS_CHAT_MODELS.find((m) => m.value === model)?.label ?? model;

  return {
    messages,
    status,
    error,
    mode,
    setMode,
    model,
    setModel,
    sketchViewport,
    setSketchViewport,
    imagePreview,
    attachImage,
    clearImage,
    submit,
    modelLabel,
  };
}
