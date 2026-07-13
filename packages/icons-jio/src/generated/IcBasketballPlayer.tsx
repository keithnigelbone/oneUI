import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBasketballPlayer = forwardRef<SVGSVGElement, IconComponentProps>(function IcBasketballPlayer(
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
            d="M12.5 5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m6.5 7.32a1 1 0 0 0-.63-1.27l-2-.67a2 2 0 0 1-1-.79l-1.13-1.7a2.93 2.93 0 0 0-1.16-1l-1.52-.76a1 1 0 0 0-.8-.13l-2.84.71a3 3 0 0 0-2.18 2.21L5 11.76A1 1 0 0 0 5.76 13H6a1 1 0 0 0 1-.76l.71-2.83a1 1 0 0 1 .73-.73l1.15-.29L6 20.73A1 1 0 0 0 6.73 22q.135.023.27 0a1 1 0 0 0 1-.73l2-7.21 1.76.59L10 20.73a1 1 0 0 0 .73 1.27q.135.023.27 0a1 1 0 0 0 1-.73l1.7-6.07a2 2 0 0 0-1.29-2.45l-1.84-.61 1.06-3.71.45.23a.9.9 0 0 1 .38.34l1.14 1.7a4 4 0 0 0 2.06 1.57l2 .68a1 1 0 0 0 1.34-.63M18.5 14a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3"
          />
    </svg>
  );
});

IcBasketballPlayer.displayName = 'IcBasketballPlayer';
