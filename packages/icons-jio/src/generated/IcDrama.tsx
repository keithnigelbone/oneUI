import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDrama = forwardRef<SVGSVGElement, IconComponentProps>(function IcDrama(
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
            d="M20.71 8.29A1 1 0 0 0 20 8H9a1 1 0 0 0-1 1v6c0 4.65 5.91 6.85 6.16 6.94a1 1 0 0 0 .68 0C15.09 21.85 21 19.65 21 15V9a1 1 0 0 0-.29-.71m-9.92 3a1 1 0 0 1 1.27-.12.94.94 0 0 1 .36.45 1 1 0 0 1 .06.58 1 1 0 0 1-.78.78 1 1 0 0 1-.58-.06.94.94 0 0 1-.45-.36 1 1 0 0 1 .12-1.27m7.46 5a4.9 4.9 0 0 1-1.69 1.27 4.94 4.94 0 0 1-4.12 0 4.9 4.9 0 0 1-1.69-1.27 1 1 0 0 1-.26-.34.9.9 0 0 1-.1-.42c0-.145.03-.288.09-.42a1 1 0 0 1 .26-.35 1.1 1.1 0 0 1 .38-.2.9.9 0 0 1 .43 0 .83.83 0 0 1 .4.16 1 1 0 0 1 .3.31 3 3 0 0 0 1 .75 2.94 2.94 0 0 0 2.46 0 3 3 0 0 0 1-.75 1 1 0 0 1 1.72.61 1 1 0 0 1-.18.68zm0-3.61a1 1 0 0 1-1.27.12.94.94 0 0 1-.36-.45 1 1 0 0 1-.06-.58 1 1 0 0 1 .74-.77 1 1 0 0 1 .58.06.94.94 0 0 1 .45.36 1 1 0 0 1-.12 1.27zM16 6V3a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v6a6.64 6.64 0 0 0 3 5.19V9a3 3 0 0 1 .24-1.17 2.85 2.85 0 0 1 .67-1 2.9 2.9 0 0 1 1-.65A3.1 3.1 0 0 1 9.08 6z"
          />
    </svg>
  );
});

IcDrama.displayName = 'IcDrama';
