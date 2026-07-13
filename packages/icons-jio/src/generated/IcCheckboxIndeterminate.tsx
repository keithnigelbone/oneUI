import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCheckboxIndeterminate = forwardRef<SVGSVGElement, IconComponentProps>(function IcCheckboxIndeterminate(
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
      <path fill="currentColor" d="M0 0h24v24H0z" />
          <path
            fill="#fff"
            d="M3.293 11.293A1 1 0 0 1 4 11h16a1 1 0 0 1 0 2H4a1 1 0 0 1-.707-1.707"
          />
    </svg>
  );
});

IcCheckboxIndeterminate.displayName = 'IcCheckboxIndeterminate';
