import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDownloadsFast = forwardRef<SVGSVGElement, IconComponentProps>(function IcDownloadsFast(
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
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m2.8 10.6-3 4a.999.999 0 1 1-1.6-1.2L12 13h-2a1 1 0 0 1-.8-1.6l3-4a1 1 0 1 1 1.6 1.2L12 11h2a1 1 0 0 1 .8 1.6"
          />
    </svg>
  );
});

IcDownloadsFast.displayName = 'IcDownloadsFast';
