import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcShuffle = forwardRef<SVGSVGElement, IconComponentProps>(function IcShuffle(
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
            d="M17.24 8h1.35l-.3.29a1 1 0 0 0 .325 1.64 1 1 0 0 0 1.095-.22l2-2a1 1 0 0 0 0-1.42l-2-2a1.003 1.003 0 1 0-1.42 1.42l.3.29h-1.35a4.06 4.06 0 0 0-2.83 1.17l-8.24 8.24a2 2 0 0 1-1.41.59H3a1 1 0 1 0 0 2h1.76a4.06 4.06 0 0 0 2.83-1.17l8.24-8.24A2 2 0 0 1 17.24 8M3 8h1.76a2 2 0 0 1 1.41.59l2 2 1.42-1.42-2-2A4.06 4.06 0 0 0 4.76 6H3a1 1 0 1 0 0 2m16.71 6.29a1.004 1.004 0 1 0-1.42 1.42l.3.29h-1.35a2 2 0 0 1-1.41-.59l-2-2-1.42 1.42 2 2A4.06 4.06 0 0 0 17.24 18h1.35l-.3.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l2-2a1 1 0 0 0 0-1.42z"
          />
    </svg>
  );
});

IcShuffle.displayName = 'IcShuffle';
