import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHandcuffs = forwardRef<SVGSVGElement, IconComponentProps>(function IcHandcuffs(
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
            d="M16.5 2a5.49 5.49 0 0 0-4.89 3H11a1 1 0 0 0-1 1v.5h-.5a3 3 0 0 0-3 3v.5H6a1 1 0 0 0-1 1v.61a5.5 5.5 0 1 0 5 0V11a1 1 0 0 0-1-1h-.5v-.5a1 1 0 0 1 1-1h.5V9a1 1 0 0 0 1 1h.61a5.5 5.5 0 1 0 4.89-8M11 16.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m5.5-5.5a3.5 3.5 0 1 1 0-7.002 3.5 3.5 0 0 1 0 7.002"
          />
    </svg>
  );
});

IcHandcuffs.displayName = 'IcHandcuffs';
