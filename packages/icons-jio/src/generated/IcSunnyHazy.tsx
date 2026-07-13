import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcSunnyHazy = forwardRef<SVGSVGElement, IconComponentProps>(function IcSunnyHazy(
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
            d="M21 19c-.75 0-1.08-.3-1.59-.75C18.82 17.72 18 17 16.5 17s-2.32.72-2.91 1.25c-.51.45-.84.75-1.59.75s-1.08-.3-1.59-.75C9.82 17.72 9 17 7.5 17s-2.32.72-2.91 1.25c-.51.45-.84.75-1.59.75-.55 0-1 .45-1 1s.45 1 1 1c1.5 0 2.32-.72 2.91-1.25.51-.45.84-.75 1.59-.75s1.08.3 1.59.75C9.68 20.28 10.5 21 12 21s2.32-.72 2.91-1.25c.51-.45.84-.75 1.59-.75s1.08.3 1.59.75C18.68 20.28 19.5 21 21 21c.55 0 1-.45 1-1s-.45-1-1-1M12 6c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1s-1 .45-1 1v2c0 .55.45 1 1 1m-9 7h2c.55 0 1-.45 1-1s-.45-1-1-1H3c-.55 0-1 .45-1 1s.45 1 1 1m3.34-5.24a.996.996 0 1 0 1.41-1.41L6.34 4.94a.996.996 0 1 0-1.41 1.41zm11.31 0 1.41-1.41a.996.996 0 1 0-1.41-1.41l-1.41 1.41a.996.996 0 1 0 1.41 1.41m-4.03 6.46c-.62.5-1.01.78-1.63.78-.55 0-1 .45-1 1s.45 1 1 1c1.35 0 2.2-.68 2.87-1.22.62-.5 1.01-.78 1.63-.78s1 .28 1.63.78c.68.54 1.52 1.22 2.87 1.22.55 0 1-.45 1-1s-.45-1-1-1c-.62 0-1-.28-1.63-.78-.68-.54-1.52-1.22-2.87-1.22s-2.2.68-2.87 1.22m-5.57.82c.37.04.73.1 1.05.19.33-1.26 1.46-2.2 2.81-2.24.12-.08.35-.26.45-.34.77-.62 2.07-1.66 4.12-1.66.14 0 .27.02.4.03a5 5 0 0 0-4.9-4.03c-2.76 0-5 2.24-5 5 0 1.15.4 2.2 1.06 3.04z"
          />
    </svg>
  );
});

IcSunnyHazy.displayName = 'IcSunnyHazy';
