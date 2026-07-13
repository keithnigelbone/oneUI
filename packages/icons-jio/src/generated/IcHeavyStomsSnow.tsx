import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHeavyStomsSnow = forwardRef<SVGSVGElement, IconComponentProps>(function IcHeavyStomsSnow(
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
            d="M16.17 11A3.009 3.009 0 0 1 19 7c.16 0 .31.03.47.05.01-.1.03-.2.03-.3C19.5 4.13 17.37 2 14.75 2c-1.64 0-3.08.83-3.93 2.09A3.7 3.7 0 0 0 10 4a3.98 3.98 0 0 0-3.86 3.01C6.09 7.01 6.05 7 6 7c-1.66 0-3 1.34-3 3s1.34 3 3 3h4.18c.41-1.16 1.51-2 2.82-2zM19 9c-.55 0-1 .45-1 1s.45 1 1 1 1 .45 1 1-.45 1-1 1h-6c-.55 0-1 .45-1 1s.45 1 1 1h6c1.65 0 3-1.35 3-3s-1.35-3-3-3m1 7h-3c-.55 0-1 .45-1 1s.45 1 1 1h3c.55 0 1-.45 1-1s-.45-1-1-1m-10.46.05a1.01 1.01 0 0 0-1.39-.28l-.8.53v-.96c0-.55-.45-1-1-1s-1 .45-1 1v.96l-.8-.53a1.001 1.001 0 1 0-1.11 1.67l1.11.74-1.11.74c-.46.31-.58.93-.28 1.39.19.29.51.45.83.45.19 0 .38-.05.55-.17l.8-.53v.96c0 .55.45 1 1 1s1-.45 1-1v-.96l.8.53c.17.11.36.17.55.17.32 0 .64-.16.83-.45.31-.46.18-1.08-.28-1.39l-1.11-.74 1.11-.74c.46-.31.58-.93.28-1.39zm5.17.25a.996.996 0 0 0-1.41 0l-.29.29-.29-.29a.996.996 0 1 0-1.41 1.41l.29.29-.29.29a.996.996 0 0 0 .71 1.7c.26 0 .51-.1.71-.29l.29-.29.29.29c.2.2.45.29.71.29s.51-.1.71-.29a.996.996 0 0 0 0-1.41l-.29-.29.29-.29a.996.996 0 0 0 0-1.41z"
          />
    </svg>
  );
});

IcHeavyStomsSnow.displayName = 'IcHeavyStomsSnow';
