import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMobileOff = forwardRef<SVGSVGElement, IconComponentProps>(function IcMobileOff(
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
            d="M15 2H9a3 3 0 0 0-3 3v8.76l11-11A3 3 0 0 0 15 2m5.49 1.51a1 1 0 0 0-1.45 0L3.51 19A1.053 1.053 0 1 0 5 20.49l1-1.09A3 3 0 0 0 9 22h6a3 3 0 0 0 3-3V7.44L20.49 5a.998.998 0 0 0 0-1.49M12 20a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5"
          />
    </svg>
  );
});

IcMobileOff.displayName = 'IcMobileOff';
