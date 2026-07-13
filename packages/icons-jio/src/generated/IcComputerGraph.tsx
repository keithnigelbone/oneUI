import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcComputerGraph = forwardRef<SVGSVGElement, IconComponentProps>(function IcComputerGraph(
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
            d="M8 10a1 1 0 0 0-1 1v1a1 1 0 1 0 2 0v-1a1 1 0 0 0-1-1m4-3a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0V8a1 1 0 0 0-1-1m4 2a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-1-1m4.41-4.41A2 2 0 0 0 19 4H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h6v2H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2h6a2 2 0 0 0 2-2V6a2 2 0 0 0-.59-1.41M19 14H5V6.5a.51.51 0 0 1 .5-.5h13a.51.51 0 0 1 .5.5z"
          />
    </svg>
  );
});

IcComputerGraph.displayName = 'IcComputerGraph';
