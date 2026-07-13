import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcNews = forwardRef<SVGSVGElement, IconComponentProps>(function IcNews(
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
            d="M19 2h-9a3 3 0 0 0-3 3v13a1 1 0 1 1-2 0V8H4a2 2 0 0 0-2 2v9a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3m-3 15h-5a1 1 0 0 1 0-2h5a1 1 0 0 1 0 2m2-5h-7a1 1 0 0 1 0-2h7a1 1 0 0 1 0 2m0-5h-7a1 1 0 1 1 0-2h7a1 1 0 1 1 0 2"
          />
    </svg>
  );
});

IcNews.displayName = 'IcNews';
