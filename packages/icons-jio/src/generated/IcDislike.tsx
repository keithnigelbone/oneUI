import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDislike = forwardRef<SVGSVGElement, IconComponentProps>(function IcDislike(
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
            d="m3.568 6.67-.55 5A3 3 0 0 0 5.998 15h4v3.92a2 2 0 0 0 3.94.56l1-4q.06-.236.06-.48V4h-8.45a3 3 0 0 0-2.98 2.67M18.998 4h-2v11h2a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2"
          />
    </svg>
  );
});

IcDislike.displayName = 'IcDislike';
