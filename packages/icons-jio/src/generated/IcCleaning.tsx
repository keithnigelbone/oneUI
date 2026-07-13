import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCleaning = forwardRef<SVGSVGElement, IconComponentProps>(function IcCleaning(
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
            d="M12.45 5a5 5 0 0 1 1.26.3l-.6 1.22a1 1 0 0 0 .44 1.34A.93.93 0 0 0 14 8a1 1 0 0 0 .89-.55l.23-.45H17a2 2 0 0 0 2-2.34A2.07 2.07 0 0 0 16.89 3H12.5a.5.5 0 0 0-.5.5v1a.51.51 0 0 0 .45.5M20 12h-2l-1-3.3a1 1 0 0 0-1.9 0L14 12h-2v-1a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v1H4a1 1 0 0 0 0 2h.13l.76 5.28a2 2 0 0 0 2 1.72h10.24a2 2 0 0 0 2-1.72l.74-5.28H20a1 1 0 1 0 0-2m-9-6a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v1h4z"
          />
    </svg>
  );
});

IcCleaning.displayName = 'IcCleaning';
