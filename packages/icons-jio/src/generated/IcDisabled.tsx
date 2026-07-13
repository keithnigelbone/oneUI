import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDisabled = forwardRef<SVGSVGElement, IconComponentProps>(function IcDisabled(
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
            d="M10 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m11.89 13.55a1 1 0 0 0-1.34-.44l-1.1.55-2.56-5.11A1 1 0 0 0 16 13h-5v-2h4a1 1 0 0 0 0-2h-4V7a1 1 0 0 0-2 0v2a6.49 6.49 0 1 0 7 7.14l2.14 4.28A1 1 0 0 0 19 21a.93.93 0 0 0 .45-.11l2-1a1 1 0 0 0 .44-1.34M14 15.5a4.5 4.5 0 1 1-5-4.45V14a1 1 0 0 0 1 1h4z"
          />
    </svg>
  );
});

IcDisabled.displayName = 'IcDisabled';
