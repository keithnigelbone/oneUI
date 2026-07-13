import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcArcade = forwardRef<SVGSVGElement, IconComponentProps>(function IcArcade(
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
            d="M18 18h-2v-.5a1.5 1.5 0 0 0-1.5-1.5H13v-5.14a4 4 0 1 0-2 0V16H9.5A1.5 1.5 0 0 0 8 17.5v.5H6a2 2 0 0 0 0 4h12a2 2 0 0 0 0-4"
          />
    </svg>
  );
});

IcArcade.displayName = 'IcArcade';
