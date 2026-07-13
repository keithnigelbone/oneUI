import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSirene = forwardRef<SVGSVGElement, IconComponentProps>(function IcSirene(
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
            d="M12 7a1 1 0 0 0 1-1V4a1 1 0 0 0-2 0v2a1 1 0 0 0 1 1m4.74 1.26a1 1 0 0 0 .71-.3l1.41-1.41a1 1 0 1 0-1.41-1.41L16 6.55A1 1 0 0 0 16 8a1 1 0 0 0 .74.26M6.55 8a1 1 0 0 0 .71.3A1 1 0 0 0 8 8a1 1 0 0 0 0-1.45L6.55 5.14a1 1 0 0 0-1.41 1.41zm.65 7.42a1 1 0 0 0 1 1.12h7.62a1 1 0 0 0 1-1.12l-.7-5.63a2 2 0 0 0-2-1.75H9.88a2 2 0 0 0-2 1.75zM20 11h-2a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2m-3.63 6.5H7.63A1.58 1.58 0 0 0 6 19v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1a1.58 1.58 0 0 0-1.63-1.5M7 12a1 1 0 0 0-1-1H4a1 1 0 0 0 0 2h2a1 1 0 0 0 1-1"
          />
    </svg>
  );
});

IcSirene.displayName = 'IcSirene';
