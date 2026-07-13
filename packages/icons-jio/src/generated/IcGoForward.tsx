import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcGoForward = forwardRef<SVGSVGElement, IconComponentProps>(function IcGoForward(
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
            d="M19 12a1 1 0 0 0-1 1 6 6 0 1 1-6.44-6l-.27.27a1 1 0 0 0 .325 1.64 1 1 0 0 0 1.095-.22l2-2a1 1 0 0 0 0-1.42l-2-2a1.003 1.003 0 1 0-1.42 1.42l.32.31A8 8 0 1 0 20 13a1 1 0 0 0-1-1"
          />
    </svg>
  );
});

IcGoForward.displayName = 'IcGoForward';
