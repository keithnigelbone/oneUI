import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcAdventure = forwardRef<SVGSVGElement, IconComponentProps>(function IcAdventure(
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
            d="m20.87 19.5-2.87-5a1 1 0 0 0-1.73 0l-1.51 2.61L10.63 10V8.5h3.67a1 1 0 0 0 .89-.5 1 1 0 0 0-.07-1l-.65-1 .66-1a1 1 0 0 0 0-1 1 1 0 0 0-.88-.53h-3.8A1 1 0 0 0 9.63 3a1 1 0 0 0-1 1v6l-5.5 9.5A1 1 0 0 0 4 21h16a1 1 0 0 0 .87-1.5"
          />
    </svg>
  );
});

IcAdventure.displayName = 'IcAdventure';
