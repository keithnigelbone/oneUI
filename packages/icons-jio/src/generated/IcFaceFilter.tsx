import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFaceFilter = forwardRef<SVGSVGElement, IconComponentProps>(function IcFaceFilter(
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
            d="M22 4.24a.6.6 0 0 0-.48-.4l-1.34-.2-.61-1.29a.59.59 0 0 0-1.08 0l-.61 1.29-1.34.2a.6.6 0 0 0-.34 1l1 1-.28 1.46a.61.61 0 0 0 .89.63L19 7.27l1.19.66a.63.63 0 0 0 .64-.04.61.61 0 0 0 .25-.59l-.24-1.43 1-1a.59.59 0 0 0 .16-.63M10 6a8 8 0 1 0 0 16 8 8 0 0 0 0-16m-4 6a1 1 0 1 1 2 0 1 1 0 0 1-2 0m7.25 5.75a4.85 4.85 0 0 1-6.5 0 1.001 1.001 0 0 1 .97-1.734 1 1 0 0 1 .34.234 2.88 2.88 0 0 0 3.88 0 1 1 0 0 1 1.478.032 1 1 0 0 1-.168 1.468M13 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcFaceFilter.displayName = 'IcFaceFilter';
