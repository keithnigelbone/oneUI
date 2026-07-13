import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcToddler = forwardRef<SVGSVGElement, IconComponentProps>(function IcToddler(
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
            d="M20 11h-.07A8 8 0 0 0 12 4a7.7 7.7 0 0 0-1.45.14l-.84-.85a1.004 1.004 0 0 0-1.42 1.42l.14.14A8 8 0 0 0 4.07 11H4a1 1 0 0 0 0 2h.07a8 8 0 0 0 15.86 0H20a1 1 0 1 0 0-2m-13-.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0m8.28 5.25a4.93 4.93 0 0 1-6.56 0 1 1 0 0 1 .094-1.57A1 1 0 0 1 9.38 14h5.24a1 1 0 0 1 .966 1.242 1 1 0 0 1-.306.508M15.5 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"
          />
    </svg>
  );
});

IcToddler.displayName = 'IcToddler';
