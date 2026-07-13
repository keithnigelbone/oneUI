import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPresentations = forwardRef<SVGSVGElement, IconComponentProps>(function IcPresentations(
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
            d="M20 15c0 1.1-.9 2-2 2h-5v1.38c.31.27.5.67.5 1.12 0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5c0-.45.19-.84.5-1.12V17H6c-1.1 0-2-.9-2-2V7h16zm0-12c.55 0 1 .45 1 1s-.45 1-1 1H4c-.55 0-1-.45-1-1s.45-1 1-1z"
          />
    </svg>
  );
});

IcPresentations.displayName = 'IcPresentations';
