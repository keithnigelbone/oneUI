/**
 * ArtboardToolbar.tsx
 *
 * Magic Path-inspired floating toolbar that docks above the currently selected
 * frame or Sketch artboard. Tracks selection + camera reactively via tldraw's
 * `track()`, translates the shape's page bounds into screen coordinates, and
 * renders a pill with:
 *   - device icon (mobile / tablet / desktop, inferred from width)
 *   - editable name (bound to `shape.props.name` for frames, `prompt` for sketches)
 *   - Flow / Variants / Full-preview buttons
 *   - Kebab menu (Refresh / Rename / Copy / Duplicate / Export as image /
 *     Share design / Extract theme from design / Delete / Add to library)
 *
 * Wire-scope: Refresh / Rename / Duplicate / Delete are wired against the
 * editor API. Copy / Export / Share / Extract / Add-to-library render but
 * surface a "Coming soon" toast via aria-disabled — visual parity today,
 * real behaviour slotted into future slices.
 */

'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { track, useEditor } from 'tldraw';
import { Button } from '@oneui/ui-internal/components/Button/Button';
import { IconButton } from '@oneui/ui-internal/components/IconButton/IconButton';
import { Input } from '@oneui/ui-internal/components/Input/Input';
import { Icon } from '@oneui/ui-internal/icons/Icon';
import { Menu } from '@oneui/ui-internal/components/Menu/Menu';
import { SKETCH_HTML_SHAPE_TYPE } from './SketchHTMLShape';
import { DEFAULT_CANVAS_MODEL } from './useCanvasChat';
import styles from './ArtboardToolbar.module.css';

/** Grace period before hiding the pill after both shape + pill hover drop. */
const HOVER_GRACE_MS = 260;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Infer a device glyph from the artboard's page-space width. */
function deviceIconForWidth(w: number): 'smartphone' | 'tablet' | 'monitor' {
  if (w <= 480) return 'smartphone';
  if (w <= 900) return 'tablet';
  return 'monitor';
}

/** Shape types that qualify as "artboards" worthy of the toolbar. */
const ARTBOARD_TYPES = new Set<string>(['frame', SKETCH_HTML_SHAPE_TYPE]);

/**
 * Read the display name for an artboard shape. Frames use `props.name`;
 * Sketch shapes fall back to the prompt the designer typed.
 */
function getArtboardName(shape: any): string {
  if (shape.type === 'frame') return (shape.props?.name as string) || 'Untitled';
  if (shape.type === SKETCH_HTML_SHAPE_TYPE) {
    const prompt = (shape.props?.prompt as string) || '';
    if (prompt) return prompt.length > 40 ? prompt.slice(0, 40) + '…' : prompt;
    return 'Sketch';
  }
  return shape.type;
}

// ---------------------------------------------------------------------------
// ArtboardToolbar
// ---------------------------------------------------------------------------

export const ArtboardToolbar = track(() => {
  const editor = useEditor();
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [comingSoon, setComingSoon] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pillHovered, setPillHovered] = useState(false);
  const [showPillGraceful, setShowPillGraceful] = useState(false);
  const comingSoonTimerRef = useRef<number | null>(null);
  const refreshAbortRef = useRef<AbortController | null>(null);

  // Clear dangling timers on unmount
  useEffect(() => {
    return () => {
      if (comingSoonTimerRef.current !== null) clearTimeout(comingSoonTimerRef.current);
      refreshAbortRef.current?.abort();
    };
  }, []);

  // Resolve artboard anchor from selection OR hovered shape (whichever is an
  // artboard or has an artboard ancestor). This drives both the label and the
  // hover toolbar — the label stays visible while selected, the full toolbar
  // appears when the shape is actively hovered in tldraw.
  const selectedIds = editor.getSelectedShapeIds();
  const hoveredShapeId = editor.getHoveredShapeId();

  function resolveArtboard(id: string): any | null {
    const shape = editor.getShape(id as any) as any;
    if (!shape) return null;
    if (ARTBOARD_TYPES.has(shape.type)) return shape;
    let parentId: string | null = shape.parentId ?? null;
    while (parentId && parentId !== editor.getCurrentPageId()) {
      const parent = editor.getShape(parentId as any) as any;
      if (!parent) break;
      if (ARTBOARD_TYPES.has(parent.type)) return parent;
      parentId = parent.parentId ?? null;
    }
    return null;
  }

  const anchorShape: any | null = useMemo(() => {
    for (const id of selectedIds) {
      const found = resolveArtboard(id);
      if (found) return found;
    }
    if (hoveredShapeId) {
      const found = resolveArtboard(hoveredShapeId);
      if (found) return found;
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds.join(','), hoveredShapeId]);

  // Show the full action pill when the artboard (or a child) is actively
  // hovered in tldraw, or while the rename input is open, or while the
  // pointer is over the pill itself (tldraw clears `hoveredShapeId` the
  // moment the cursor crosses onto the overlaid pill, so we must keep the
  // pill open while the user is interacting with it).
  const isShapeHovered = hoveredShapeId != null && (
    hoveredShapeId === anchorShape?.id || resolveArtboard(hoveredShapeId)?.id === anchorShape?.id
  );
  const live = isShapeHovered || pillHovered || renaming;

  // Grace period: keep the pill visible for HOVER_GRACE_MS after the cursor
  // leaves both shape and pill so travelling across the gap between the
  // frame's top edge and the pill itself doesn't flicker the UI.
  useEffect(() => {
    if (live) {
      setShowPillGraceful(true);
      return;
    }
    const id = window.setTimeout(() => setShowPillGraceful(false), HOVER_GRACE_MS);
    return () => window.clearTimeout(id);
  }, [live]);

  const showPill = showPillGraceful;

  // Center-of-artboard in screen coords — pill uses translate(-50%) to center itself.
  const camera = editor.getCamera();
  const zoom = editor.getZoomLevel();
  const placement = useMemo(() => {
    if (!anchorShape) return null;
    const bounds = editor.getShapePageBounds(anchorShape.id);
    if (!bounds) return null;
    const topLeft = editor.pageToScreen({ x: bounds.x, y: bounds.y });
    return {
      centerX: topLeft.x + (bounds.w * zoom) / 2,
      top: topLeft.y,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchorShape?.id, anchorShape?.x, anchorShape?.y, anchorShape?.props?.w, camera.x, camera.y, zoom]);

  // ── Action handlers ───────────────────────────────────────────────────────

  const commitRename = useCallback(
    (value: string) => {
      if (!anchorShape) return;
      const trimmed = value.trim();
      if (!trimmed) {
        setRenaming(false);
        return;
      }
      if (anchorShape.type === 'frame') {
        editor.updateShape({
          id: anchorShape.id,
          type: 'frame',
          props: { name: trimmed },
        } as any);
      } else if (anchorShape.type === SKETCH_HTML_SHAPE_TYPE) {
        editor.updateShape({
          id: anchorShape.id,
          type: SKETCH_HTML_SHAPE_TYPE as any,
          props: { prompt: trimmed },
        } as any);
      }
      setRenaming(false);
    },
    [anchorShape, editor],
  );

  const startRename = useCallback(() => {
    if (!anchorShape) return;
    setDraftName(getArtboardName(anchorShape));
    setRenaming(true);
    // Input component owns its own focus via autoFocus prop below.
  }, [anchorShape]);

  const handleDuplicate = useCallback(() => {
    if (!anchorShape) return;
    const bounds = editor.getShapePageBounds(anchorShape.id);
    const offsetX = (bounds?.w ?? 400) + 60;
    editor.duplicateShapes([anchorShape.id], { x: offsetX, y: 0 });
  }, [anchorShape, editor]);

  const handleDelete = useCallback(() => {
    if (!anchorShape) return;
    editor.deleteShape(anchorShape.id as any);
  }, [anchorShape, editor]);

  const setComingSoonWithTimeout = useCallback((msg: string, durationMs = 2400) => {
    if (comingSoonTimerRef.current !== null) clearTimeout(comingSoonTimerRef.current);
    setComingSoon(msg);
    comingSoonTimerRef.current = window.setTimeout(() => {
      setComingSoon(null);
      comingSoonTimerRef.current = null;
    }, durationMs);
  }, []);

  const handleRefresh = useCallback(async () => {
    if (!anchorShape) return;

    if (anchorShape.type !== SKETCH_HTML_SHAPE_TYPE) {
      setComingSoonWithTimeout('Refresh works on Sketch artboards. Use Chat to update a component frame.');
      return;
    }

    const storedPrompt = (anchorShape.props?.prompt as string) || '';
    if (!storedPrompt) {
      setComingSoonWithTimeout('No prompt stored — type a new one in Chat.');
      return;
    }

    // Abort any in-flight refresh before starting a new one
    refreshAbortRef.current?.abort();
    const ac = new AbortController();
    refreshAbortRef.current = ac;

    setRefreshing(true);
    try {
      const res = await fetch('/api/canvas/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: storedPrompt, model: DEFAULT_CANVAS_MODEL }),
        signal: ac.signal,
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error || `HTTP ${res.status}`);
      }
      const { ast } = await res.json() as { ast?: { root?: unknown } };
      if (!ast?.root) throw new Error('No AST returned');
      editor.updateShape({
        id: anchorShape.id,
        type: SKETCH_HTML_SHAPE_TYPE as any,
        props: { ast },
      } as any);
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setComingSoonWithTimeout(`Refresh failed: ${msg}`, 3000);
    } finally {
      setRefreshing(false);
    }
  }, [anchorShape, editor, setComingSoonWithTimeout]);

  const showComingSoon = useCallback((label: string) => {
    setComingSoonWithTimeout(`${label} — Coming soon`);
  }, [setComingSoonWithTimeout]);

  // ── Render ────────────────────────────────────────────────────────────────

  if (!anchorShape || !placement) return null;

  const width = anchorShape.props?.w ?? 390;
  const iconName = deviceIconForWidth(width);
  const displayName = renaming ? draftName : getArtboardName(anchorShape);

  return (
    <div
      className={styles.toolbarWrapper}
      style={{
        // Position at the horizontal centre of the artboard so both the label
        // and the pill can self-centre with translate(-50%).
        transform: `translate(${placement.centerX}px, ${placement.top}px)`,
      }}
      aria-label="Artboard toolbar"
    >
      {showPill ? (
        <div
          className={styles.pill}
          onPointerEnter={() => setPillHovered(true)}
          onPointerLeave={() => setPillHovered(false)}
        >
          <span className={styles.deviceIcon} aria-hidden>
            <Icon name={iconName} />
          </span>
          {renaming ? (
            <Input
              size="s"
              appearance="neutral"
              attention="high"
              value={draftName}
              onChange={setDraftName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commitRename(draftName);
                if (e.key === 'Escape') setRenaming(false);
              }}
              onBlur={() => commitRename(draftName)}
              autoFocus
              aria-label="Artboard name"
              className={styles.nameInput}
            />
          ) : (
            <span
              className={styles.nameWrap}
              onDoubleClick={startRename}
              title="Double-click to rename"
            >
              <Button
                size="s"
                appearance="neutral"
                attention="low"
                onPress={() => editor.select(anchorShape.id as any)}
                className={styles.nameButton}
              >
                {displayName}
              </Button>
            </span>
          )}
          <span className={styles.divider} aria-hidden />
          <IconButton
            icon={<Icon name="link" />}
            appearance="neutral"
            attention="low"
            size="s"
            onPress={() => showComingSoon('Flow')}
            aria-label="Flow — link artboards"
          />
          <IconButton
            icon={<Icon name="sparkles" />}
            appearance="neutral"
            attention="low"
            size="s"
            onPress={() => showComingSoon('Generate variants')}
            aria-label="Variants"
          />
          <IconButton
            icon={<Icon name="globe" />}
            appearance="neutral"
            attention="low"
            size="s"
            onPress={() => showComingSoon('Full browser preview')}
            aria-label="Full preview"
          />
          <Menu>
            <Menu.Trigger
              render={
                <IconButton
                  icon={<Icon name="menu" />}
                  appearance="neutral"
                  attention="low"
                  size="s"
                  aria-label="More actions"
                />
              }
            />
            <Menu.Portal side="bottom" align="end">
              <Menu.Item onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? 'Refreshing…' : 'Refresh'}
              </Menu.Item>
              <Menu.Item onClick={startRename}>Rename</Menu.Item>
              <Menu.Item onClick={() => showComingSoon('Copy')}>Copy</Menu.Item>
              <Menu.Item onClick={handleDuplicate}>Duplicate</Menu.Item>
              <Menu.Separator />
              <Menu.Item onClick={() => showComingSoon('Export as image')}>Export as image</Menu.Item>
              <Menu.Item onClick={() => showComingSoon('Share design')}>Share design</Menu.Item>
              <Menu.Item onClick={() => showComingSoon('Extract theme from design')}>
                Extract theme from design
              </Menu.Item>
              <Menu.Item onClick={() => showComingSoon('Add to library')}>Add to library</Menu.Item>
              <Menu.Separator />
              <Menu.Item onClick={handleDelete}>Delete</Menu.Item>
            </Menu.Portal>
          </Menu>
        </div>
      ) : (
        /* Simple label — visible when the artboard is selected but not hovered */
        <span className={styles.idleLabel} aria-hidden>
          {displayName}
        </span>
      )}
      {(comingSoon || refreshing) && (
        <div className={styles.toast} role="status" aria-live="polite">
          {refreshing ? 'Refreshing artboard…' : comingSoon}
        </div>
      )}
    </div>
  );
});
