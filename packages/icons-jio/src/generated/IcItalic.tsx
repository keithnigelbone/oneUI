import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcItalic = forwardRef<SVGSVGElement, IconComponentProps>(function IcItalic(
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
            d="M20 3h-9c-.55 0-1 .45-1 1s.45 1 1 1h3.38l-7 14H4c-.55 0-1 .45-1 1s.45 1 1 1h9c.55 0 1-.45 1-1s-.45-1-1-1H9.62l7-14H20c.55 0 1-.45 1-1s-.45-1-1-1"
          />
    </svg>
  );
});

IcItalic.displayName = 'IcItalic';
