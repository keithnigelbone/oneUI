import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPlanting = forwardRef<SVGSVGElement, IconComponentProps>(function IcPlanting(
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
            d="M20.64 14.32a1 1 0 0 0-.82-.21 6 6 0 0 0-1.46.48 3.9 3.9 0 0 1-1.86.41 3.84 3.84 0 0 1-1.85-.41 5.8 5.8 0 0 0-1.65-.52V8.42c3.94-.62 4-4.87 4-4.92a.5.5 0 0 0-.5-.5A4.48 4.48 0 0 0 12 5.81 4.48 4.48 0 0 0 7.5 3a.5.5 0 0 0-.5.5s.06 4.3 4 4.92v5.65a5.8 5.8 0 0 0-1.66.52A3.8 3.8 0 0 1 7.5 15a4 4 0 0 1-1.87-.41 5.8 5.8 0 0 0-1.45-.48 1 1 0 0 0-.82.21 1 1 0 0 0-.36.77V20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-4.91a1 1 0 0 0-.36-.77"
          />
    </svg>
  );
});

IcPlanting.displayName = 'IcPlanting';
