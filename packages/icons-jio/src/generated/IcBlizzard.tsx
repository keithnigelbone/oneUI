import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBlizzard = forwardRef<SVGSVGElement, IconComponentProps>(function IcBlizzard(
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
            d="M14 10H9c-.55 0-1 .45-1 1s.45 1 1 1h5c1.65 0 3-1.35 3-3s-1.35-3-3-3c-.55 0-1 .45-1 1s.45 1 1 1 1 .45 1 1-.45 1-1 1m3 6H7c-.55 0-1 .45-1 1s.45 1 1 1h10c.55 0 1 .45 1 1s-.45 1-1 1-1 .45-1 1 .45 1 1 1c1.65 0 3-1.35 3-3s-1.35-3-3-3m2-7c-.55 0-1 .45-1 1s.45 1 1 1 1 .45 1 1-.45 1-1 1H3c-.55 0-1 .45-1 1s.45 1 1 1h16c1.65 0 3-1.35 3-3s-1.35-3-3-3M2.17 7.95c.19.29.51.45.83.45.19 0 .38-.05.55-.17l.8-.53v.96c0 .55.45 1 1 1s1-.45 1-1V7.7l.8.53c.17.11.36.17.55.17.32 0 .64-.16.83-.45.31-.46.18-1.08-.28-1.39l-1.11-.74 1.11-.74c.46-.31.58-.93.28-1.39s-.93-.58-1.39-.28l-.8.53v-.96c0-.55-.45-1-1-1s-1 .45-1 1v.96l-.8-.53a1.001 1.001 0 1 0-1.11 1.67l1.11.74-1.11.74c-.46.31-.58.93-.28 1.39zM13 19H5c-.55 0-1 .45-1 1s.45 1 1 1h8c.55 0 1-.45 1-1s-.45-1-1-1"
          />
    </svg>
  );
});

IcBlizzard.displayName = 'IcBlizzard';
