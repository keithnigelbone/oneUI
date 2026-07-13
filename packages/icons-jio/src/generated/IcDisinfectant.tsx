import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDisinfectant = forwardRef<SVGSVGElement, IconComponentProps>(function IcDisinfectant(
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
            d="M15 8V7a1 1 0 0 0-1-1h-1V4h.51a2 2 0 0 1 .64.1l2.53.9q.16.021.32 0a1 1 0 0 0 1.05-1.068 1 1 0 0 0-.68-.882l-2.54-.84A3.9 3.9 0 0 0 13.51 2H9a1 1 0 0 0 0 2h2v2h-1a1 1 0 0 0-1 1v1a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3m-1 8h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 0 1 0-2h1v-1a1 1 0 0 1 2 0v1h1a1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcDisinfectant.displayName = 'IcDisinfectant';
