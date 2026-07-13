import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcGastrointestinal = forwardRef<SVGSVGElement, IconComponentProps>(function IcGastrointestinal(
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
            d="M15 3H7C4.79 3 3 4.79 3 7s1.79 4 4 4h4c.55 0 1 .45 1 1s-.45 1-1 1c-1.65 0-3 1.35-3 3 0 .35.07.69.18 1H7c-.55 0-1 .45-1 1s.45 1 1 1h6v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-1.1-.9-2-2-2h-2c-.55 0-1-.45-1-1s.45-1 1-1h4c3.31 0 6-2.69 6-6s-2.69-6-6-6"
          />
    </svg>
  );
});

IcGastrointestinal.displayName = 'IcGastrointestinal';
