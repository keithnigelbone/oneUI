import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMagic = forwardRef<SVGSVGElement, IconComponentProps>(function IcMagic(
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
            d="M12 10a1 1 0 0 0 .58-.19l7-5a1 1 0 1 0-1.16-1.62l-7 5A1 1 0 0 0 12 10m7 1H5a1 1 0 0 0 0 2h14a1 1 0 0 0 0-2M8 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2M6 20a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-5H6zM5.5 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"
          />
    </svg>
  );
});

IcMagic.displayName = 'IcMagic';
