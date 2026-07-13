/**
 * ContainerShape.tsx
 *
 * Custom tldraw shape for Surface containers.
 * Supports appearance roles (Primary, Secondary, Neutral, etc.)
 * and surface modes (default, minimal, subtle, moderate, bold, elevated).
 */

import {
  ShapeUtil,
  HTMLContainer,
  Rectangle2d,
  resizeBox,
  T,
  type TLResizeInfo,
  type Geometry2d,
  type RecordProps,
} from 'tldraw';
import { useMemo } from 'react';
import { useFrameThemeContext } from './FrameThemeContext';
import { getSubBrandIdForShape } from './artboardSubBrandUtils';
import { resolveArtboardBackgroundCss, resolveArtboardBrandBgFillHex } from './artboardSurfaces';

export const CONTAINER_SHAPE_TYPE = 'oneui-container' as const;

export type ContainerShapeProps = {
  w: number;
  h: number;
  surfaceMode: string;
  appearance: string;
  label: string;
};

/**
 * Normalize legacy V4 surface mode names to unified names for backward compat
 * with saved canvas data that still carries `bg-*` / `fg-*` prefixes.
 */
export function normalizeSurfaceModeForCanvas(mode: string): string {
  switch (mode) {
    case 'bg-minimal': case 'fg-minimal': return 'minimal';
    case 'bg-subtle': case 'fg-subtle': return 'subtle';
    case 'bg-bold': case 'fg-bold': return 'bold';
    default: return mode;
  }
}

function ContainerShapeBody({ shape, editor }: { shape: any; editor: any }) {
  const frameSubCtx = useFrameThemeContext();
  const subBrandId = frameSubCtx
    ? getSubBrandIdForShape(editor, shape.id, frameSubCtx.frameSubBrandByFrameId)
    : null;
  const subBrandDataAttr =
    subBrandId && subBrandId.length > 0 ? ({ 'data-oneui-subbrand': subBrandId } as const) : {};

  const { appearance } = shape.props;
  const rawSurfaceMode = shape.props.surfaceMode;
  const normalizedSurfaceMode = normalizeSurfaceModeForCanvas(rawSurfaceMode);

  const subBrandConfig = useMemo(
    () =>
      subBrandId && frameSubCtx?.availableSubBrands?.length
        ? frameSubCtx.availableSubBrands.find((s) => s.id === subBrandId)
        : undefined,
    [subBrandId, frameSubCtx?.availableSubBrands],
  );

  const bgColor = useMemo(() => {
    if (
      appearance === 'brand-bg' &&
      subBrandConfig &&
      frameSubCtx?.baseFoundationData
    ) {
      const hex = resolveArtboardBrandBgFillHex(
        frameSubCtx.baseFoundationData,
        subBrandConfig,
        frameSubCtx.mode,
        rawSurfaceMode,
      );
      if (hex) return hex;
    }
    return resolveArtboardBackgroundCss(appearance, rawSurfaceMode);
  }, [
    appearance,
    rawSurfaceMode,
    subBrandConfig,
    frameSubCtx?.baseFoundationData,
    frameSubCtx?.mode,
  ]);
  // [data-surface] remapping matches foundations (same normalized modes as the FG surface stack).
  const dataSurface = normalizedSurfaceMode;

  return (
    <HTMLContainer
      style={{
        width: shape.props.w,
        height: shape.props.h,
        pointerEvents: 'none',
      }}
      {...subBrandDataAttr}
    >
      <div
        data-surface={dataSurface}
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 'var(--Shape-4)',
          padding: 'var(--Spacing-4)',
          backgroundColor: bgColor,
          position: 'relative',
        } as Record<string, string>}
        {...subBrandDataAttr}
      >
        <span
          style={{
            position: 'absolute',
            top: 4,
            left: 8,
            fontSize: 'var(--Code-XS-FontSize)',
            // INTENTIONAL-LITERAL: semi-transparent on-bold label overlay; no opacity-bearing token in the system
            color:
              normalizedSurfaceMode === 'bold' || rawSurfaceMode === 'bold'
                ? 'rgba(255,255,255,0.6)'
                : 'var(--Text-Low)',
            fontFamily: 'var(--Typography-Font-Code)',
            opacity: 0.7,
          }}
        >
          {appearance}/{rawSurfaceMode}
        </span>
      </div>
    </HTMLContainer>
  );
}

export class ContainerShapeUtil extends ShapeUtil<any> {
  static override type = CONTAINER_SHAPE_TYPE;

  static override props: RecordProps<any> = {
    w: T.number,
    h: T.number,
    surfaceMode: T.string,
    appearance: T.string,
    label: T.string,
  };

  getDefaultProps() {
    return {
      w: 300,
      h: 200,
      surfaceMode: 'default',
      appearance: 'primary',
      label: 'Surface',
    };
  }

  override canEdit() { return false; }
  override canResize() { return true; }
  override isAspectRatioLocked() { return false; }

  getGeometry(shape: any): Geometry2d {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  override onResize(shape: any, info: TLResizeInfo<any>) {
    return resizeBox(shape, info);
  }

  component(shape: any) {
    return <ContainerShapeBody shape={shape} editor={this.editor} />;
  }

  indicator(shape: any) {
    return <rect width={shape.props.w} height={shape.props.h} rx={8} />;
  }
}
