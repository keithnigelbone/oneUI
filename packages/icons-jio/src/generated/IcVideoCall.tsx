import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcVideoCall = forwardRef<SVGSVGElement, IconComponentProps>(function IcVideoCall(
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
            d="m19.6 7.8-2.6 2V9a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-.75l2.6 1.95A1.5 1.5 0 0 0 22 15V9a1.5 1.5 0 0 0-2.4-1.2"
          />
    </svg>
  );
});

IcVideoCall.displayName = 'IcVideoCall';
