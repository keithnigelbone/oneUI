import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAlignBottom = forwardRef<SVGSVGElement, IconComponentProps>(function IcAlignBottom(
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
            d="M20 19H4c-.55 0-1 .45-1 1s.45 1 1 1h16c.55 0 1-.45 1-1s-.45-1-1-1m-10-2h4c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3h-4C8.34 3 7 4.34 7 6v8c0 1.66 1.34 3 3 3"
          />
    </svg>
  );
});

IcAlignBottom.displayName = 'IcAlignBottom';
