import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcJioTunes = forwardRef<SVGSVGElement, IconComponentProps>(function IcJioTunes(
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
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-1.5 5a1 1 0 0 1-.73 1L13 9.75v5.75a2.5 2.5 0 1 1-2-2.45V8a1 1 0 0 1 .73-1l3.5-1a1 1 0 0 1 1.164.513c.07.139.106.292.106.447z"
          />
    </svg>
  );
});

IcJioTunes.displayName = 'IcJioTunes';
