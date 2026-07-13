import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcBlowingDriftingSnow = forwardRef<SVGSVGElement, IconComponentProps>(function IcBlowingDriftingSnow(
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
            d="M14 8c.55 0 1 .45 1 1s-.45 1-1 1H9c-.55 0-1 .45-1 1s.45 1 1 1h5c1.65 0 3-1.35 3-3s-1.35-3-3-3c-.55 0-1 .45-1 1s.45 1 1 1m2 8H6c-.55 0-1 .45-1 1s.45 1 1 1h10c.55 0 1 .45 1 1s-.45 1-1 1-1 .45-1 1 .45 1 1 1c1.65 0 3-1.35 3-3s-1.35-3-3-3m3-7c-.55 0-1 .45-1 1s.45 1 1 1 1 .45 1 1-.45 1-1 1H3c-.55 0-1 .45-1 1s.45 1 1 1h16c1.65 0 3-1.35 3-3s-1.35-3-3-3M7.29 5.71c.2.2.45.29.71.29s.51-.1.71-.29L9 5.42l.29.29c.2.2.45.29.71.29s.51-.1.71-.29a.996.996 0 0 0 0-1.41l-.29-.29.29-.29A.996.996 0 1 0 9.3 2.31l-.29.29-.29-.29a.996.996 0 1 0-1.41 1.41l.29.29-.29.29a.996.996 0 0 0 0 1.41zm-5 4c.2.2.45.29.71.29s.51-.1.71-.29L4 9.42l.29.29c.2.2.45.29.71.29s.51-.1.71-.29a.996.996 0 0 0 0-1.41l-.29-.29.29-.29A.996.996 0 1 0 4.3 6.31l-.29.29-.29-.29a.996.996 0 1 0-1.41 1.41l.29.29-.29.29a.996.996 0 0 0 0 1.41z"
          />
    </svg>
  );
});

IcBlowingDriftingSnow.displayName = 'IcBlowingDriftingSnow';
