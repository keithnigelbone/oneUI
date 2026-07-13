import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSlide = forwardRef<SVGSVGElement, IconComponentProps>(function IcSlide(
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
            d="M2 8v8a2 2 0 0 0 2 2h1V6H4a2 2 0 0 0-2 2m18-2h-1v12h1a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2m-5-2H9a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2"
          />
    </svg>
  );
});

IcSlide.displayName = 'IcSlide';
