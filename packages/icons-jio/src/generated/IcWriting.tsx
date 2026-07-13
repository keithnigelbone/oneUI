import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcWriting = forwardRef<SVGSVGElement, IconComponentProps>(function IcWriting(
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
            d="M19 17h-1.44l2.2-2.6a1 1 0 0 0 .08-1.19L13 2.7v7.58a2 2 0 1 1-2 0V2.7L4.16 13.21a1 1 0 0 0 .08 1.19l2.2 2.6H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1"
          />
    </svg>
  );
});

IcWriting.displayName = 'IcWriting';
