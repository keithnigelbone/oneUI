import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTrainStatus = forwardRef<SVGSVGElement, IconComponentProps>(function IcTrainStatus(
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
            d="M7 14h10a2 2 0 0 0 2-2V6a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v6a2 2 0 0 0 2 2m9-2a1 1 0 1 1 0-2 1 1 0 0 1 0 2m-3-6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1zM7 6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1zm1 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2m11 10H5a1 1 0 0 0 0 2h14a1 1 0 0 0 0-2M8 16a1 1 0 0 0 0 2h8a1 1 0 0 0 0-2z"
          />
    </svg>
  );
});

IcTrainStatus.displayName = 'IcTrainStatus';
