import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTrackEcg = forwardRef<SVGSVGElement, IconComponentProps>(function IcTrackEcg(
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
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m0 13h-5.38l-.73 1.45a1 1 0 0 1-1.78 0L9 15.24l-.11.21A1 1 0 0 1 8 16H6a1 1 0 0 1 0-2h1.38l.73-1.45a1 1 0 0 1 1.78 0L11 14.76l.11-.21A1 1 0 0 1 12 14h6a1 1 0 0 1 0 2m0-6h-1.38l-.73 1.45a1 1 0 0 1-1.78 0L13 9.24l-.11.21A1 1 0 0 1 12 10H6a1 1 0 0 1 0-2h5.38l.73-1.45a1 1 0 0 1 1.78 0L15 8.76l.11-.21A1 1 0 0 1 16 8h2a1 1 0 1 1 0 2"
          />
    </svg>
  );
});

IcTrackEcg.displayName = 'IcTrackEcg';
