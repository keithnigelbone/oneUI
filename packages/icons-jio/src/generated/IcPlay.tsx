import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPlay = forwardRef<SVGSVGElement, IconComponentProps>(function IcPlay(
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
            d="m19.15 10.36-10-7A2 2 0 0 0 8 3a1.9 1.9 0 0 0-.92.23A2 2 0 0 0 6 5v14a2 2 0 0 0 1.08 1.77c.282.154.599.233.92.23a2 2 0 0 0 1.15-.36l10-7a2 2 0 0 0 0-3.28"
          />
    </svg>
  );
});

IcPlay.displayName = 'IcPlay';
