import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSmileyDelighted = forwardRef<SVGSVGElement, IconComponentProps>(function IcSmileyDelighted(
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
            d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m3.5 6a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3m-7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3m9 6.4a6 6 0 0 1-11 0 1 1 0 0 1 .92-1.4h9.16a1 1 0 0 1 .91 1.4z"
          />
    </svg>
  );
});

IcSmileyDelighted.displayName = 'IcSmileyDelighted';
