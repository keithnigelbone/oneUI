import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCallComposer = forwardRef<SVGSVGElement, IconComponentProps>(function IcCallComposer(
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
            d="M10 6h10a1 1 0 1 0 0-2H10a1 1 0 0 0 0 2m5.62 9.86a2 2 0 0 0-2.83 0l-.7.71a1 1 0 0 1-1.42 0l-4.24-4.24a1 1 0 0 1 0-1.42l.71-.7a2 2 0 0 0 0-2.83l-.71-.71a2 2 0 0 0-2.83 0l-1 1a2 2 0 0 0-.56 1.13c-.16 1.4-.04 4.74 3.68 8.48s7.08 3.84 8.49 3.72a2 2 0 0 0 1.13-.56l1-1a2 2 0 0 0 0-2.83zM20 12h-2a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2m0-4h-6a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2"
          />
    </svg>
  );
});

IcCallComposer.displayName = 'IcCallComposer';
