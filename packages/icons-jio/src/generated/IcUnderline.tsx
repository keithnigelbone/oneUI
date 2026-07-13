import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcUnderline = forwardRef<SVGSVGElement, IconComponentProps>(function IcUnderline(
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
            d="M12 18c3.84 0 6.96-3.12 6.96-6.96V4c0-.55-.45-1-1-1s-1 .45-1 1v7.04a4.96 4.96 0 1 1-9.92 0V4c0-.55-.45-1-1-1s-1 .45-1 1v7.04C5.04 14.88 8.16 18 12 18m7 2H5c-.55 0-1 .45-1 1s.45 1 1 1h14c.55 0 1-.45 1-1s-.45-1-1-1"
          />
    </svg>
  );
});

IcUnderline.displayName = 'IcUnderline';
