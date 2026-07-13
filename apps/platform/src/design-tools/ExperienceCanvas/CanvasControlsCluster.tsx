/**
 * CanvasControlsCluster.tsx
 *
 * Bottom-centre toolbar. Two groups — tools + view — every slot rendered
 * as an identical IconButton with the same minimal ghost chrome so the
 * row reads as one icon family. All glyphs come from lucide-react at
 * size 16 / strokeWidth 1.5, including the zoom ± and theme moon/sun,
 * so the row is visually uniform.
 *
 * The Artboards "add" is a plain IconButton (no dropdown chevron) that
 * drops the default artboard preset onto the canvas on click — keeping
 * its interaction pattern identical to every other tool. Picking a
 * different preset remains possible via the sidebar-moves-elsewhere
 * (TBD) but for the common case of "give me an artboard", one tap.
 */

'use client';

import React, { useCallback, useContext, useRef } from 'react';
import { track, useEditor, createShapeId } from 'tldraw';
import {
  MousePointer2,
  Hand,
  Plus,
  Frame,
  Image as ImageIcon,
  Square,
  Type,
  Pencil,
  Minus,
  Moon,
  Sun,
} from 'lucide-react';
import { IconButton } from '@oneui/ui-internal/components/IconButton/IconButton';
import { Button } from '@oneui/ui-internal/components/Button/Button';
import { Tooltip } from '@oneui/ui-internal/components/Tooltip/Tooltip';
import { usePlatformContext } from '@/contexts/PlatformContext';
import { ArtboardPresetsContext, type ArtboardPreset } from './ExperienceCanvas';
import styles from './CanvasControlsCluster.module.css';

type ToolId = 'select' | 'hand' | 'geo' | 'text' | 'draw';

/**
 * Every icon in the cluster comes from lucide-react so they share one
 * family, one size, one stroke. strokeWidth=2 makes Square (and the
 * thinner glyphs like Type) render crisp at 16px — 1.5 was visually
 * invisible for Rectangle at this size.
 */
const ICON_SIZE = 16;
const ICON_STROKE = 2;

interface ToolDef {
  id: ToolId;
  icon: React.ReactElement;
  label: string;
  shortcut?: string;
}

const TOOL_DEFS: ToolDef[] = [
  { id: 'select', icon: <MousePointer2 size={ICON_SIZE} strokeWidth={ICON_STROKE} />, label: 'Select', shortcut: 'V' },
  { id: 'hand', icon: <Hand size={ICON_SIZE} strokeWidth={ICON_STROKE} />, label: 'Pan', shortcut: 'H' },
  { id: 'geo', icon: <Square size={ICON_SIZE} strokeWidth={ICON_STROKE} />, label: 'Rectangle', shortcut: 'R' },
  { id: 'text', icon: <Type size={ICON_SIZE} strokeWidth={ICON_STROKE} />, label: 'Text', shortcut: 'T' },
  { id: 'draw', icon: <Pencil size={ICON_SIZE} strokeWidth={ICON_STROKE} />, label: 'Draw', shortcut: 'D' },
];

interface CanvasControlsClusterProps {
  /** Opens the "Add component" popover owned by the parent. */
  onAddComponent?: () => void;
  /** Opens an image file picker (parent owns the hidden input). */
  onUploadImage?: () => void;
}

export const CanvasControlsCluster = track(function CanvasControlsCluster({
  onAddComponent,
  onUploadImage,
}: CanvasControlsClusterProps) {
  const editor = useEditor();
  const { theme, setTheme } = usePlatformContext();
  const onToggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  const hiddenFileInputRef = useRef<HTMLInputElement | null>(null);
  const artboardPresets = useContext(ArtboardPresetsContext);

  const currentToolId = editor.getCurrentToolId() as ToolId;

  const handleSelectTool = useCallback(
    (id: ToolId) => {
      editor.setCurrentTool(id);
    },
    [editor],
  );

  /** Single-click on the Artboards button drops the first preset (usually
   *  a phone / mobile viewport) onto the canvas. Keeps the interaction
   *  identical to every other tool — one tap, one outcome. Picking a
   *  different preset goes through selection → duplicate; the dropdown
   *  menu was removed because its chrome was visually inconsistent. */
  const handleAddDefaultArtboard = useCallback(() => {
    const preset: ArtboardPreset | undefined = artboardPresets[0];
    if (!preset) return;
    const bounds = editor.getViewportPageBounds();
    const cx = bounds.x + bounds.w / 2;
    const cy = bounds.y + bounds.h / 2;
    editor.createShape({
      id: createShapeId(),
      type: 'frame',
      x: cx - preset.w / 2,
      y: cy - preset.h / 2,
      props: { w: preset.w, h: preset.h, name: preset.label, color: 'white' },
    });
  }, [editor, artboardPresets]);

  const handleImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      onUploadImage?.();
      e.target.value = '';
    },
    [onUploadImage],
  );

  const zoomLevel = Math.round(editor.getZoomLevel() * 100);

  /** Shared wrapper so every button in the cluster uses IDENTICAL chrome
   *  (size, attention, className). Active state for tool buttons is
   *  conveyed through `data-active` picked up in CSS — avoids the visual
   *  divergence between IconButton and SelectableIconButton that the
   *  earlier implementation suffered from. */
  const ToolButton = ({
    icon,
    label,
    shortcut,
    active,
    onPress,
  }: {
    icon: React.ReactElement;
    label: string;
    shortcut?: string;
    active?: boolean;
    onPress: () => void;
  }) => (
    <Tooltip content={shortcut ? `${label} (${shortcut})` : label} side="top">
      <IconButton
        icon={icon}
        appearance="neutral"
        attention="low"
        size="s"
        onPress={onPress}
        aria-label={label}
        aria-pressed={active}
        className={styles.toolBtn}
        data-active={active || undefined}
      />
    </Tooltip>
  );

  return (
    <div className={styles.cluster} role="toolbar" aria-label="Canvas controls">
      {/* ── Tools ─────────────────────────────────────────────────────── */}
      <div className={styles.group}>
        {TOOL_DEFS.slice(0, 2).map((tool) => (
          <ToolButton
            key={tool.id}
            icon={tool.icon}
            label={tool.label}
            shortcut={tool.shortcut}
            active={currentToolId === tool.id}
            onPress={() => handleSelectTool(tool.id)}
          />
        ))}

        <ToolButton
          icon={<Plus size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
          label="Add component"
          onPress={() => onAddComponent?.()}
        />

        <ToolButton
          icon={<Frame size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
          label="Add artboard"
          onPress={handleAddDefaultArtboard}
        />

        <ToolButton
          icon={<ImageIcon size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
          label="Upload image"
          onPress={() => hiddenFileInputRef.current?.click()}
        />
        <input
          ref={hiddenFileInputRef}
          type="file"
          accept="image/*"
          className={styles.hiddenFileInput}
          onChange={handleImageUpload}
        />

        {TOOL_DEFS.slice(2).map((tool) => (
          <ToolButton
            key={tool.id}
            icon={tool.icon}
            label={tool.label}
            shortcut={tool.shortcut}
            active={currentToolId === tool.id}
            onPress={() => handleSelectTool(tool.id)}
          />
        ))}
      </div>

      <span className={styles.divider} aria-hidden />

      {/* ── View ──────────────────────────────────────────────────────── */}
      <div className={styles.group}>
        <ToolButton
          icon={<Minus size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
          label="Zoom out"
          onPress={() => editor.zoomOut(undefined, { animation: { duration: 160 } })}
        />
        <Tooltip content="Zoom to fit" side="top">
          <Button
            appearance="neutral"
            attention="low"
            size="s"
            onPress={() => editor.zoomToFit({ animation: { duration: 200 } })}
            className={styles.zoomReadout}
          >
            {zoomLevel}%
          </Button>
        </Tooltip>
        <ToolButton
          icon={<Plus size={ICON_SIZE} strokeWidth={ICON_STROKE} />}
          label="Zoom in"
          onPress={() => editor.zoomIn(undefined, { animation: { duration: 160 } })}
        />
        <ToolButton
          icon={
            theme === 'dark'
              ? <Sun size={ICON_SIZE} strokeWidth={ICON_STROKE} />
              : <Moon size={ICON_SIZE} strokeWidth={ICON_STROKE} />
          }
          label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          onPress={onToggleTheme}
        />
      </div>
    </div>
  );
});
