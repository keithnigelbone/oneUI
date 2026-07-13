import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFavouriteMode = forwardRef<SVGSVGElement, IconComponentProps>(function IcFavouriteMode(
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
            d="M7.71 11.29a1 1 0 0 0-1.42 0l-.22.22a6 6 0 0 1 10.22-3.75 1.004 1.004 0 1 0 1.42-1.42 8 8 0 0 0-13.64 5.31l-.36-.36a1.004 1.004 0 1 0-1.42 1.42l2 2a1 1 0 0 0 1.42 0l2-2a1 1 0 0 0 0-1.42m14 0-2-2a1 1 0 0 0-1.42 0l-2 2a1.003 1.003 0 1 0 1.42 1.42l.27-.27A6 6 0 0 1 12 18a5.93 5.93 0 0 1-4.24-1.76 1.004 1.004 0 1 0-1.42 1.42A8 8 0 0 0 20 12.39l.31.32a1 1 0 0 0 1.42 0 1 1 0 0 0-.02-1.42M12 9.51A2 2 0 0 0 10.73 9a1.89 1.89 0 0 0-1.91 1.92c0 1.19.93 2.27 2.53 3.74l.17.15a.7.7 0 0 0 1 0l.17-.15c1.6-1.47 2.53-2.55 2.53-3.74A1.89 1.89 0 0 0 13.27 9a2 2 0 0 0-1.27.51"
          />
    </svg>
  );
});

IcFavouriteMode.displayName = 'IcFavouriteMode';
