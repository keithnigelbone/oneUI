import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSmartSwitchPlug = forwardRef<SVGSVGElement, IconComponentProps>(function IcSmartSwitchPlug(
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
            d="M16 6h-3v12h3a6 6 0 1 0 0-12m2 7a1 1 0 0 1-2 0v-2a1 1 0 0 1 2 0zM2 12a6 6 0 0 0 6 6h3V6H8a6 6 0 0 0-6 6m6.5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"
          />
    </svg>
  );
});

IcSmartSwitchPlug.displayName = 'IcSmartSwitchPlug';
