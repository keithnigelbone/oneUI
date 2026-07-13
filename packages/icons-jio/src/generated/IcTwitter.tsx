import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTwitter = forwardRef<SVGSVGElement, IconComponentProps>(function IcTwitter(
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
                d='M3.042 4l6.709 8.952L3 20.23h1.52l5.91-6.372 4.775 6.372h5.17l-7.086-9.455L19.573 4h-1.52L12.61 9.869 8.213 4h-5.17zm2.235 1.117h2.375L18.14 19.113h-2.375L5.277 5.117z'
                fill='currentColor'
              />
    </svg>
  );
});

IcTwitter.displayName = 'IcTwitter';
