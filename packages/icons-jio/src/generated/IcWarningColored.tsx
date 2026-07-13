import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcWarningColored = forwardRef<SVGSVGElement, IconComponentProps>(function IcWarningColored(
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
      <circle cx={12} cy={12} r={10} fill="#fff" />
          <path
            fill="#F06D0F"
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m-1 4.5a1 1 0 0 1 2 0v6a1 1 0 0 1-2 0zm1 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"
          />
    </svg>
  );
});

IcWarningColored.displayName = 'IcWarningColored';
