import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHashtag = forwardRef<SVGSVGElement, IconComponentProps>(function IcHashtag(
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
            d="M19.5 13.59h-3.21l.64-3h2.57c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5h-1.92l.54-2.5a1.498 1.498 0 1 0-2.93-.63l-.67 3.13h-3.13l.54-2.5A1.498 1.498 0 1 0 9 4.46l-.67 3.13H4.52c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h3.16l-.64 3H4.51c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h1.88l-.5 2.33c-.17.81.34 1.61 1.15 1.78.11.02.21.03.32.03.69 0 1.31-.48 1.46-1.19l.63-2.95h3.13l-.5 2.33c-.17.81.34 1.61 1.15 1.78.11.02.21.03.32.03.69 0 1.31-.48 1.46-1.19l.63-2.95h3.85c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5zm-9.4 0 .64-3h3.13l-.64 3z"
          />
    </svg>
  );
});

IcHashtag.displayName = 'IcHashtag';
