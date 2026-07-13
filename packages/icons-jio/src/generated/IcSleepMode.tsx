import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSleepMode = forwardRef<SVGSVGElement, IconComponentProps>(function IcSleepMode(
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
            d="M18.82 14.75a7 7 0 0 1-8-10 1 1 0 0 0-1.16-1.43A9 9 0 1 0 20 16.18a1 1 0 0 0-1.15-1.43zM14.5 8h.79l-1.14 1.15a.47.47 0 0 0-.11.54.5.5 0 0 0 .46.31h2a.5.5 0 0 0 0-1h-.79l1.14-1.15a.47.47 0 0 0-.05-.776.5.5 0 0 0-.3-.074h-2a.5.5 0 0 0 0 1m6-3h-.79l1.14-1.15a.47.47 0 0 0-.05-.776.5.5 0 0 0-.3-.074h-2a.5.5 0 0 0 0 1h.79l-1.14 1.15a.47.47 0 0 0-.11.54.5.5 0 0 0 .46.31h2a.5.5 0 0 0 0-1"
          />
    </svg>
  );
});

IcSleepMode.displayName = 'IcSleepMode';
