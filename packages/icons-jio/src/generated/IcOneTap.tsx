import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcOneTap = forwardRef<SVGSVGElement, IconComponentProps>(function IcOneTap(
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
            d="M12 2a8 8 0 0 0-8 8 8 8 0 0 0 .09 1.14 1.01 1.01 0 0 0 2-.28A5.5 5.5 0 0 1 6 10a6 6 0 1 1 12 0q0 .433-.07.86a1 1 0 0 0 .85 1.14h.14a1 1 0 0 0 1-.86q.081-.568.08-1.14a8 8 0 0 0-8-8m0 4a4 4 0 0 0-4 4v11a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V10a4 4 0 0 0-4-4m2 5.5a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5V10a2 2 0 1 1 4 0z"
          />
    </svg>
  );
});

IcOneTap.displayName = 'IcOneTap';
