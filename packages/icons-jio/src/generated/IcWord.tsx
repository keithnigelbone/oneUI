import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcWord = forwardRef<SVGSVGElement, IconComponentProps>(function IcWord(
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
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-2.55 7.72-1.5 3a.5.5 0 0 1-.9 0L12 11.62l-1 2.1a.52.52 0 0 1-.9 0l-1.5-3a.5.5 0 1 1 .9-.44l1.05 2.1 1.05-2.1a.52.52 0 0 1 .9 0l1.05 2.1 1.05-2.1a.501.501 0 0 1 .9.44z"
          />
    </svg>
  );
});

IcWord.displayName = 'IcWord';
