import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcConfirm = forwardRef<SVGSVGElement, IconComponentProps>(function IcConfirm(
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
            d="M9 19a1 1 0 0 1-.71-.29l-5-5a1.004 1.004 0 1 1 1.42-1.42L9 16.59l10.29-10.3a1.004 1.004 0 1 1 1.42 1.42l-11 11A1 1 0 0 1 9 19"
          />
    </svg>
  );
});

IcConfirm.displayName = 'IcConfirm';
