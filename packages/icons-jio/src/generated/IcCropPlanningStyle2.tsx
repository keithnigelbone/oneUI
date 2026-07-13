import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCropPlanningStyle2 = forwardRef<SVGSVGElement, IconComponentProps>(function IcCropPlanningStyle2(
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
            d="M20.64 16.32a1 1 0 0 0-.82-.21 6 6 0 0 0-1.46.48l-.36.15v-2.86a4.23 4.23 0 0 0 3-3.29.48.48 0 0 0-.11-.41.49.49 0 0 0-.39-.18 3.82 3.82 0 0 0-2.5.86v-2a4.23 4.23 0 0 0 3-3.29.48.48 0 0 0-.11-.41.49.49 0 0 0-.39-.16 3.82 3.82 0 0 0-2.5.86V4a1 1 0 0 0-2 0v1.86A3.82 3.82 0 0 0 13.5 5a.49.49 0 0 0-.38.18.48.48 0 0 0-.11.41 4.23 4.23 0 0 0 3 3.29v2A3.82 3.82 0 0 0 13.5 10a.49.49 0 0 0-.38.18.48.48 0 0 0-.11.41 4.23 4.23 0 0 0 3 3.29V17a3.9 3.9 0 0 1-1.35-.38A5.66 5.66 0 0 0 12 16a5.7 5.7 0 0 0-2.66.59A3.8 3.8 0 0 1 8 17v-2.12a4.23 4.23 0 0 0 3-3.29.48.48 0 0 0-.11-.41.49.49 0 0 0-.39-.18 3.82 3.82 0 0 0-2.5.86v-2a4.23 4.23 0 0 0 3-3.29.48.48 0 0 0-.11-.41.49.49 0 0 0-.39-.16 3.82 3.82 0 0 0-2.5.86V5a1 1 0 1 0-2 0v1.86A3.82 3.82 0 0 0 3.5 6a.49.49 0 0 0-.38.18.48.48 0 0 0-.12.41 4.23 4.23 0 0 0 3 3.29v2A3.82 3.82 0 0 0 3.5 11a.49.49 0 0 0-.38.18.48.48 0 0 0-.11.41 4.23 4.23 0 0 0 3 3.29v1.86l-.37-.15a6 6 0 0 0-1.45-.48 1 1 0 0 0-.82.21 1 1 0 0 0-.36.77V20a1 1 0 0 0 1 1H20a1 1 0 0 0 1-1v-2.91a1 1 0 0 0-.36-.77"
          />
    </svg>
  );
});

IcCropPlanningStyle2.displayName = 'IcCropPlanningStyle2';
