import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcEnergyOthers = forwardRef<SVGSVGElement, IconComponentProps>(function IcEnergyOthers(
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
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M4 12a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0m14 0a6 6 0 0 1-1.11 3.47l.82.82a1.002 1.002 0 0 1-.325 1.639 1 1 0 0 1-1.095-.219l-.82-.82a6 6 0 0 1-7 0l-.81.82a1 1 0 0 1-1.639-.325 1 1 0 0 1 .219-1.095l1.47-1.46a1 1 0 0 1 1.41 0 4 4 0 1 0 0-5.66 1 1 0 0 1-1.41 0L6.29 7.71a1.004 1.004 0 0 1 1.42-1.42l.81.82a6 6 0 0 1 7 0l.82-.82a1.003 1.003 0 1 1 1.42 1.42l-.82.82A6 6 0 0 1 18 12"
          />
    </svg>
  );
});

IcEnergyOthers.displayName = 'IcEnergyOthers';
