import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcRuler = forwardRef<SVGSVGElement, IconComponentProps>(function IcRuler(
  { size = 24, width, height, color = 'currentColor', className, style, ...props },
  ref,
) {
  const dim = width ?? height ?? size;
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={width ?? dim}
      height={height ?? dim}
      color={color}
      className={className}
      style={style}
      {...props}
    >
      <path
            fill="currentColor"
            d="m20.41 6.59-3-3a2 2 0 0 0-2.82 0l-.3.29 1.42 1.41a1 1 0 0 1-.326 1.639 1 1 0 0 1-1.094-.22l-1.41-1.42-1.59 1.59 3.42 3.41a1 1 0 0 1-.326 1.64 1 1 0 0 1-1.094-.22L9.88 8.29 8.29 9.88l1.42 1.41a1 1 0 0 1 0 1.42 1 1 0 0 1-1.42 0l-1.41-1.42-1.59 1.59 3.42 3.41a1 1 0 0 1-.326 1.64 1 1 0 0 1-1.094-.22l-3.41-3.42-.29.3a2 2 0 0 0 0 2.82l3 3a2 2 0 0 0 2.82 0l11-11a2 2 0 0 0 0-2.82"
          />
    </svg>
  );
});

IcRuler.displayName = 'IcRuler';
