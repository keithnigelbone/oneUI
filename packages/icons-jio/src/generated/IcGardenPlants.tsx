import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcGardenPlants = forwardRef<SVGSVGElement, IconComponentProps>(function IcGardenPlants(
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
            d="M21 12a2.5 2.5 0 0 0-2.5-2.5H18l.32-.33a2.5 2.5 0 0 0-3.53-3.53L14.5 6v-.5a2.5 2.5 0 0 0-5 0V6l-.33-.32a2.5 2.5 0 0 0-3.53 3.49L6 9.5h-.5a2.5 2.5 0 0 0 0 5H6l-.32.33a2.5 2.5 0 0 0 3.53 3.53L9.5 18v.46a2.5 2.5 0 0 0 5 0V18l.33.32a2.5 2.5 0 0 0 3.53-3.53L18 14.5h.46A2.5 2.5 0 0 0 21 12m-9 3a3 3 0 1 1 0-5.999A3 3 0 0 1 12 15"
          />
    </svg>
  );
});

IcGardenPlants.displayName = 'IcGardenPlants';
