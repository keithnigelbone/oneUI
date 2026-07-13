import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcArrowLineDot = forwardRef<SVGSVGElement, IconComponentProps>(function IcArrowLineDot(
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
            d="M20 15c-.55 0-1 .45-1 1v1.59L7.82 6.41c.11-.28.18-.59.18-.91a2.5 2.5 0 0 0-5 0A2.5 2.5 0 0 0 5.5 8c.32 0 .63-.07.91-.18L17.59 19H16c-.55 0-1 .45-1 1s.45 1 1 1h4c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1"
          />
    </svg>
  );
});

IcArrowLineDot.displayName = 'IcArrowLineDot';
