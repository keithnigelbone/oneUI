import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPinOff = forwardRef<SVGSVGElement, IconComponentProps>(function IcPinOff(
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
            d="M12.71 7.05 8.24 2.59a2 2 0 0 0-2.83 0L2.59 5.41a2 2 0 0 0 0 2.83l4.46 4.47zm2.62 6.84 3.79-3.79a1.5 1.5 0 0 0-1.06-2.56h-.15L20.49 5a1.055 1.055 0 0 0-1.148-1.718q-.194.08-.342.228L3.51 19A1.054 1.054 0 1 0 5 20.49l2.58-2.58v.15a1.5 1.5 0 0 0 2.56 1.06l3.79-3.79L19 20.49A1.054 1.054 0 1 0 20.49 19z"
          />
    </svg>
  );
});

IcPinOff.displayName = 'IcPinOff';
