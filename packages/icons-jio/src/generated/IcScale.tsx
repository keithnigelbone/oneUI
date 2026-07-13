import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcScale = forwardRef<SVGSVGElement, IconComponentProps>(function IcScale(
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
            d="M20 7h-1v5a1 1 0 0 1-2 0V7h-2v3a1 1 0 0 1-2 0V7h-2v5a1 1 0 0 1-2 0V7H7v3a1 1 0 1 1-2 0V7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2"
          />
    </svg>
  );
});

IcScale.displayName = 'IcScale';
