import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHarvest = forwardRef<SVGSVGElement, IconComponentProps>(function IcHarvest(
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
            d="m19.25 5.47-.33-.32A7.3 7.3 0 0 0 13.74 3a.5.5 0 0 0-.35.85l3.78 3.78a2.59 2.59 0 0 1 .27 3.44 2.51 2.51 0 0 1-3.73.18l-.51-.49a1.49 1.49 0 0 0-2.1 0l-2.16 2.18-.35-.35a1 1 0 0 0-1.42 0l-2.29 2.29-1 1a3 3 0 0 0 0 4.24 3 3 0 0 0 4.24 0l1-1 2.29-2.29a1 1 0 0 0 0-1.42l-.35-.35 1.15-1.15a5.51 5.51 0 0 0 7.73-1.16 5.63 5.63 0 0 0-.69-7.28"
          />
    </svg>
  );
});

IcHarvest.displayName = 'IcHarvest';
