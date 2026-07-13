import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBreezy = forwardRef<SVGSVGElement, IconComponentProps>(function IcBreezy(
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
            d="M3 10h10c1.65 0 3-1.35 3-3s-1.35-3-3-3c-.55 0-1 .45-1 1s.45 1 1 1 1 .45 1 1-.45 1-1 1H3c-.55 0-1 .45-1 1s.45 1 1 1m10 4H3c-.55 0-1 .45-1 1s.45 1 1 1h10c.55 0 1 .45 1 1s-.45 1-1 1-1 .45-1 1 .45 1 1 1c1.65 0 3-1.35 3-3s-1.35-3-3-3m6-7c-.55 0-1 .45-1 1s.45 1 1 1 1 .45 1 1-.45 1-1 1H3c-.55 0-1 .45-1 1s.45 1 1 1h16c1.65 0 3-1.35 3-3s-1.35-3-3-3"
          />
    </svg>
  );
});

IcBreezy.displayName = 'IcBreezy';
