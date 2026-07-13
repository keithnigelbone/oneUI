import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAcRemote = forwardRef<SVGSVGElement, IconComponentProps>(function IcAcRemote(
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
            d="M12 7a1 1 0 1 0 0 2 1 1 0 0 0 0-2m2-5h-4a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h4a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3m-4 18a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m-2-5a3 3 0 1 1 0-5.999A3 3 0 0 1 12 11"
          />
    </svg>
  );
});

IcAcRemote.displayName = 'IcAcRemote';
