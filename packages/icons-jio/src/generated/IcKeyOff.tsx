import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcKeyOff = forwardRef<SVGSVGElement, IconComponentProps>(function IcKeyOff(
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
            d="m20.71 16.71-6-6L20.49 5a1.055 1.055 0 0 0-.745-1.799A1.05 1.05 0 0 0 19 3.51L3.51 19A1.053 1.053 0 1 0 5 20.49L11.44 14H12v2h2v2h2v2l.71.71a1 1 0 0 0 .7.29H20a1 1 0 0 0 1-1v-2.59a1 1 0 0 0-.29-.7M6.81 13 13 6.81A5.5 5.5 0 1 0 6.81 13M6.5 5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3"
          />
    </svg>
  );
});

IcKeyOff.displayName = 'IcKeyOff';
