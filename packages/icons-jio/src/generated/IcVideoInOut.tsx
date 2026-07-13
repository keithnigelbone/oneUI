import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcVideoInOut = forwardRef<SVGSVGElement, IconComponentProps>(function IcVideoInOut(
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
            d="m19.6 7.8-2.6 2V9a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-.75l2.6 1.95A1.5 1.5 0 0 0 22 15V9a1.5 1.5 0 0 0-2.4-1.2M5 14a1 1 0 0 1-.71-1.71L6.59 10H6a1 1 0 0 1 0-2h3a1 1 0 0 1 .92.62 1 1 0 0 1-.21 1.09l-4 4A1 1 0 0 1 5 14m7 2H9a1 1 0 0 1-.92-.62 1 1 0 0 1 .21-1.09l4-4a1.004 1.004 0 0 1 1.42 1.42L11.41 14H12a1 1 0 0 1 0 2"
          />
    </svg>
  );
});

IcVideoInOut.displayName = 'IcVideoInOut';
