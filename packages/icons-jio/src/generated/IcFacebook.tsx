import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFacebook = forwardRef<SVGSVGElement, IconComponentProps>(function IcFacebook(
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
                d='M20 3H4a1 1 0 00-1 1v16a1 1 0 001 1h8.61v-7h-2.33v-2.68h2.33v-2a3.279 3.279 0 013.51-3.59 13.31 13.31 0 012.09.11v2.41h-1.43c-1.13 0-1.35.54-1.35 1.33v1.73h2.7L17.78 14h-2.35v7H20a1 1 0 001-1V4a1 1 0 00-1-1z'
                fill='currentColor'
              />
    </svg>
  );
});

IcFacebook.displayName = 'IcFacebook';
