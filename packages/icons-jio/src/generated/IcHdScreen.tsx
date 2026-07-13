import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHdScreen = forwardRef<SVGSVGElement, IconComponentProps>(function IcHdScreen(
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
            d="M15 2H9a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3m-5 3a1 1 0 1 1 0 2 1 1 0 0 1 0-2m6 14a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-8a1 1 0 0 1 .29-.71l1-1a1 1 0 0 1 1.42 0l1.29 1.3 2.29-2.3a1 1 0 0 1 1.09-.21A1 1 0 0 1 16 9zm-4-3a1 1 0 1 0 0 2 1 1 0 0 0 0-2"
          />
    </svg>
  );
});

IcHdScreen.displayName = 'IcHdScreen';
