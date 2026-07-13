import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcTrivia = forwardRef<SVGSVGElement, IconComponentProps>(function IcTrivia(
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
            d="M16 6V5a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h1v-5a5 5 0 0 1 5-5zm3 2h-8a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3m-2.28 9a.5.5 0 0 1-.67-.23l-.11-.22h-1.88l-.11.22a.502.502 0 0 1-.9-.44l1.5-3a.52.52 0 0 1 .9 0l1.5 3a.51.51 0 0 1-.23.67m-2.16-1.5h.88l-.44-.88z"
          />
    </svg>
  );
});

IcTrivia.displayName = 'IcTrivia';
