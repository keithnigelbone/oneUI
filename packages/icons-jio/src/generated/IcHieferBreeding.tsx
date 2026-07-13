import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHieferBreeding = forwardRef<SVGSVGElement, IconComponentProps>(function IcHieferBreeding(
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
            d="M18.29 15.29 16 17.59l-.29-.3a1.003 1.003 0 0 0-1.638.326 1.005 1.005 0 0 0 .218 1.094l1 1a1 1 0 0 0 1.42 0l3-3a1.004 1.004 0 1 0-1.42-1.42M10 15a3 3 0 0 0 0 6h3a4.92 4.92 0 0 1 0-6zm8.75-7h-.66c.552-1.264.86-2.621.91-4a1 1 0 0 0-1.89-.45 5.7 5.7 0 0 1-.77 1.14A6 6 0 0 0 12 3a6 6 0 0 0-4.34 1.69 5.8 5.8 0 0 1-.77-1.14A1 1 0 0 0 5 4a11 11 0 0 0 .91 4h-.66A2.25 2.25 0 0 0 3 10.25a.76.76 0 0 0 .75.75h1.5c.307 0 .61-.065.89-.19q.135.715.35 1.41c.19.617.327 1.25.41 1.89A5 5 0 0 1 10 13h4c.51.005 1.016.09 1.5.25.484-.16.99-.244 1.5-.25h.3c.06-.29.14-.56.21-.81q.215-.695.35-1.41c.28.125.583.19.89.19h1.5a.76.76 0 0 0 .75-.75A2.25 2.25 0 0 0 18.75 8M9 11a1 1 0 1 1 0-2 1 1 0 0 1 0 2m6 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcHieferBreeding.displayName = 'IcHieferBreeding';
