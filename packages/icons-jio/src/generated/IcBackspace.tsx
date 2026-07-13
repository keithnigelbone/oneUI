import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBackspace = forwardRef<SVGSVGElement, IconComponentProps>(function IcBackspace(
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
            d="M21 10a1 1 0 0 0-1 1v1H4v-1a1 1 0 1 0-2 0v2a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"
          />
    </svg>
  );
});

IcBackspace.displayName = 'IcBackspace';
