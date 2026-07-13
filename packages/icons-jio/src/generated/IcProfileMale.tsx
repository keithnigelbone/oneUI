import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcProfileMale = forwardRef<SVGSVGElement, IconComponentProps>(function IcProfileMale(
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
            d="M10.78 10.84a4.51 4.51 0 0 0 5.56-5.56 4.46 4.46 0 0 0-3.12-3.12 4.51 4.51 0 0 0-5.56 5.56 4.46 4.46 0 0 0 3.12 3.12M12 12a8 8 0 0 0-8 8 2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 8 8 0 0 0-8-8"
          />
    </svg>
  );
});

IcProfileMale.displayName = 'IcProfileMale';
