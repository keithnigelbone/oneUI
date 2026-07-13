import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcReset = forwardRef<SVGSVGElement, IconComponentProps>(function IcReset(
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
            d="M12 4a8 8 0 0 0-8 7.61l-.31-.32a1.004 1.004 0 1 0-1.42 1.42l2 2a1 1 0 0 0 1.42 0l2-2a1.004 1.004 0 1 0-1.42-1.42l-.27.27a6 6 0 1 1 1.8 4.73 1.001 1.001 0 1 0-1.39 1.42A7.92 7.92 0 0 0 12 20a8 8 0 1 0 0-16"
          />
    </svg>
  );
});

IcReset.displayName = 'IcReset';
