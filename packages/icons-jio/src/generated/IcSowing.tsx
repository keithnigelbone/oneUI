import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSowing = forwardRef<SVGSVGElement, IconComponentProps>(function IcSowing(
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
            d="M16.5 15.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2M12 13a1 1 0 1 0 2 0 1 1 0 0 0-2 0m8.64 3.32a1 1 0 0 0-.82-.21 6 6 0 0 0-1.46.48 3.9 3.9 0 0 1-1.86.41 3.84 3.84 0 0 1-1.85-.41A5.66 5.66 0 0 0 12 16a5.7 5.7 0 0 0-2.66.59A3.8 3.8 0 0 1 7.5 17a4 4 0 0 1-1.87-.41 5.9 5.9 0 0 0-1.45-.48 1 1 0 0 0-.82.21 1 1 0 0 0-.36.77V20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-2.91a1 1 0 0 0-.36-.77M8.29 12.71a1 1 0 0 0 1.42 0l3-3a1 1 0 0 0 0-1.42l-5-5a1 1 0 0 0-1.42 0l-3 3a1 1 0 0 0 0 1.42z"
          />
    </svg>
  );
});

IcSowing.displayName = 'IcSowing';
