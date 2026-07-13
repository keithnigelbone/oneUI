import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSdCard = forwardRef<SVGSVGElement, IconComponentProps>(function IcSdCard(
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
            d="M17 2H9a3 3 0 0 0-3 3v5.59l-1.12 1.12A3 3 0 0 0 4 13.83V19a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3m-7 5a1 1 0 0 1-2 0V5a1 1 0 0 1 2 0zm4 0a1 1 0 0 1-2 0V5a1 1 0 0 1 2 0zm4 0a1 1 0 0 1-2 0V5a1 1 0 0 1 2 0z"
          />
    </svg>
  );
});

IcSdCard.displayName = 'IcSdCard';
