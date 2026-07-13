import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcReply = forwardRef<SVGSVGElement, IconComponentProps>(function IcReply(
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
            d="m2.59 9.59 5-5a2 2 0 0 1 2.18-.44A2 2 0 0 1 11 6v2s10.25 1.86 11 11.84A1.09 1.09 0 0 1 20.93 21a1.08 1.08 0 0 1-1-.78C19.32 18.39 17.33 14 11 14v2a2 2 0 0 1-1.23 1.85 2 2 0 0 1-2.18-.44l-5-5a2 2 0 0 1 0-2.82"
          />
    </svg>
  );
});

IcReply.displayName = 'IcReply';
