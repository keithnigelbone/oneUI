/**
 * ComponentAnnotation.tsx
 *
 * Wireframe diagram with interactive token annotations.
 * Shows where each key token is applied visually.
 */

'use client';

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import styles from './ComponentAnnotation.module.css';

export interface TokenAnnotation {
  /** Token name (e.g., 'backgroundColor') */
  tokenName: string;
  /** Display label for the annotation */
  label: string;
  /** Position relative to the component */
  position: 'top' | 'right' | 'bottom' | 'left' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Offset from the position in pixels */
  offset: { x: number; y: number };
}

export interface ComponentAnnotationProps {
  /** The component to annotate */
  children: React.ReactNode;
  /** Annotations to display */
  annotations: TokenAnnotation[];
  /** Currently selected token name */
  selectedToken: string | null;
  /** Currently highlighted token name (from panel hover) */
  highlightedToken: string | null;
  /** Callback when an annotation is clicked */
  onAnnotationClick: (tokenName: string) => void;
  /** Callback when mouse enters an annotation */
  onAnnotationHover: (tokenName: string | null) => void;
}

export function ComponentAnnotation({
  children,
  annotations,
  selectedToken,
  highlightedToken,
  onAnnotationClick,
  onAnnotationHover,
}: ComponentAnnotationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const componentRef = useRef<HTMLDivElement>(null);
  const [componentRect, setComponentRect] = useState<DOMRect | null>(null);

  // Update component rect on mount and resize
  useEffect(() => {
    const updateRect = () => {
      if (componentRef.current) {
        setComponentRect(componentRef.current.getBoundingClientRect());
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, []);

  // Calculate annotation positions relative to component
  const annotationPositions = useMemo(() => {
    if (!componentRect) return [];

    return annotations.map((annotation) => {
      let x = 0;
      let y = 0;

      // Base position relative to component center
      const centerX = 0;
      const centerY = 0;
      const halfWidth = 80; // Approximate half-width of component
      const halfHeight = 24; // Approximate half-height of component

      switch (annotation.position) {
        case 'top':
          x = centerX;
          y = -halfHeight - 60;
          break;
        case 'bottom':
          x = centerX;
          y = halfHeight + 60;
          break;
        case 'left':
          x = -halfWidth - 100;
          y = centerY;
          break;
        case 'right':
          x = halfWidth + 100;
          y = centerY;
          break;
        case 'top-left':
          x = -halfWidth - 80;
          y = -halfHeight - 40;
          break;
        case 'top-right':
          x = halfWidth + 80;
          y = -halfHeight - 40;
          break;
        case 'bottom-left':
          x = -halfWidth - 80;
          y = halfHeight + 40;
          break;
        case 'bottom-right':
          x = halfWidth + 80;
          y = halfHeight + 40;
          break;
      }

      // Apply custom offset
      x += annotation.offset.x;
      y += annotation.offset.y;

      return {
        ...annotation,
        x,
        y,
      };
    });
  }, [componentRect, annotations]);

  const handleAnnotationClick = useCallback((tokenName: string) => {
    onAnnotationClick(tokenName);
  }, [onAnnotationClick]);

  const handleAnnotationMouseEnter = useCallback((tokenName: string) => {
    onAnnotationHover(tokenName);
  }, [onAnnotationHover]);

  const handleAnnotationMouseLeave = useCallback(() => {
    onAnnotationHover(null);
  }, [onAnnotationHover]);

  return (
    <div className={styles.annotationContainer} ref={containerRef}>
      {/* SVG overlay for annotation lines */}
      <svg className={styles.annotationOverlay} viewBox="-200 -150 400 300">
        {annotationPositions.map((annotation) => {
          const isSelected = selectedToken === annotation.tokenName;
          const isHighlighted = highlightedToken === annotation.tokenName;

          // Calculate line endpoint (towards center)
          const lineEndX = annotation.x > 0 ? annotation.x - 30 : annotation.x + 30;
          const lineEndY = annotation.y > 0 ? annotation.y - 10 : annotation.y + 10;

          return (
            <g key={annotation.tokenName}>
              {/* Line from annotation to component */}
              <line
                className={styles.annotationLine}
                x1={annotation.x}
                y1={annotation.y}
                x2={lineEndX > 0 ? 40 : -40}
                y2={annotation.y > 0 ? 20 : -20}
                data-selected={isSelected}
                data-highlighted={isHighlighted}
              />
              {/* Endpoint dot */}
              <circle
                className={styles.lineEndpoint}
                cx={lineEndX > 0 ? 40 : -40}
                cy={annotation.y > 0 ? 20 : -20}
                r={3}
              />
            </g>
          );
        })}
      </svg>

      {/* Component preview */}
      <div className={styles.componentPreview} ref={componentRef}>
        {children}
      </div>

      {/* Annotation labels */}
      {annotationPositions.map((annotation) => {
        const isSelected = selectedToken === annotation.tokenName;
        const isHighlighted = highlightedToken === annotation.tokenName;

        return (
          <div
            key={annotation.tokenName}
            className={styles.annotationLabel}
            data-position={annotation.position}
            data-selected={isSelected}
            data-highlighted={isHighlighted}
            style={{
              left: `calc(50% + ${annotation.x}px)`,
              top: `calc(50% + ${annotation.y}px)`,
            }}
            onClick={() => handleAnnotationClick(annotation.tokenName)}
            onMouseEnter={() => handleAnnotationMouseEnter(annotation.tokenName)}
            onMouseLeave={handleAnnotationMouseLeave}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                handleAnnotationClick(annotation.tokenName);
              }
            }}
          >
            <span className={styles.annotationDot} />
            <span className={styles.annotationText}>{annotation.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default ComponentAnnotation;
