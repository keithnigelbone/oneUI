import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMapLayers = forwardRef<SVGSVGElement, IconComponentProps>(function IcMapLayers(
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
            d="m2.59 7.91 9 4a1 1 0 0 0 .82 0l9-4a1 1 0 0 0 0-1.82l-9-4a1 1 0 0 0-.82 0l-9 4a1 1 0 0 0 0 1.82m18.82 8.18-1.11-.5-7.08 3.15a3 3 0 0 1-2.44 0L3.7 15.59l-1.11.5a1 1 0 0 0 0 1.82l9 4a1 1 0 0 0 .82 0l9-4a1 1 0 0 0 0-1.82m0-5-1.11-.5-7.08 3.15a3 3 0 0 1-2.44 0L3.7 10.59l-1.11.5a1 1 0 0 0 0 1.82l9 4a1 1 0 0 0 .82 0l9-4a1 1 0 0 0 0-1.82"
          />
    </svg>
  );
});

IcMapLayers.displayName = 'IcMapLayers';
