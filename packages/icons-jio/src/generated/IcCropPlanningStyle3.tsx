import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCropPlanningStyle3 = forwardRef<SVGSVGElement, IconComponentProps>(function IcCropPlanningStyle3(
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
            d="m20.55 11.83.07-.07a1 1 0 0 0 .15-.14l.1-.15q.042-.087.07-.18a1 1 0 0 0 0-.2L21 11V5a1 1 0 0 0-2 0v1.46l-1 .67V4a1 1 0 0 0-2 0v3.13l-1-.67V5a1 1 0 0 0-2 0v6.09a1 1 0 0 0 0 .2q.03.093.07.18.045.078.1.15a1 1 0 0 0 .15.14l.07.07L16 13.54V17a3.8 3.8 0 0 1-1.35-.38A5.66 5.66 0 0 0 12 16a5.7 5.7 0 0 0-2.66.59A3.8 3.8 0 0 1 8 17v-2.46l2.55-1.71.07-.07a1 1 0 0 0 .15-.14q.055-.072.1-.15.042-.087.07-.18a1 1 0 0 0 0-.2L11 12V6a1 1 0 0 0-2 0v1.46l-1 .67V5a1 1 0 1 0-2 0v3.13l-1-.67V6a1 1 0 1 0-2 0v6.09a1 1 0 0 0 0 .2q.029.093.07.18l.1.15a1 1 0 0 0 .15.14l.07.07L6 14.54v2.2l-.37-.15a6 6 0 0 0-1.45-.48 1 1 0 0 0-.82.21 1 1 0 0 0-.36.77V20a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-2.91a1 1 0 0 0-.36-.77 1 1 0 0 0-.82-.21 6 6 0 0 0-1.46.48l-.36.15v-3.2zM18 9.54l1-.67v1.59l-1 .67zm-10 1 1-.67v1.59l-1 .67zm-2 1.59-1-.67V9.87l1 .67zm10-1-1-.67V8.87l1 .67z"
          />
    </svg>
  );
});

IcCropPlanningStyle3.displayName = 'IcCropPlanningStyle3';
