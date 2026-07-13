import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcNightHazy = forwardRef<SVGSVGElement, IconComponentProps>(function IcNightHazy(
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
            d="M21 19c-.75 0-1.08-.3-1.59-.75C18.82 17.72 18 17 16.5 17s-2.32.72-2.91 1.25c-.51.45-.84.75-1.59.75s-1.08-.3-1.59-.75C9.82 17.72 9 17 7.5 17s-2.32.72-2.91 1.25c-.51.45-.84.75-1.59.75-.55 0-1 .45-1 1s.45 1 1 1c1.5 0 2.32-.72 2.91-1.25.51-.45.84-.75 1.59-.75s1.08.3 1.59.75C9.68 20.28 10.5 21 12 21s2.32-.72 2.91-1.25c.51-.45.84-.75 1.59-.75s1.08.3 1.59.75C18.68 20.28 19.5 21 21 21c.55 0 1-.45 1-1s-.45-1-1-1m-9-4c-.55 0-1 .45-1 1s.45 1 1 1c1.35 0 2.2-.68 2.87-1.22.62-.5 1.01-.78 1.63-.78s1 .28 1.63.78c.68.54 1.52 1.22 2.87 1.22.55 0 1-.45 1-1s-.45-1-1-1c-.62 0-1-.28-1.63-.78-.68-.54-1.52-1.22-2.87-1.22s-2.2.68-2.87 1.22c-.62.5-1.01.78-1.63.78m-3 .98A3 3 0 0 1 11.92 13c.12-.08.35-.26.45-.34.65-.52 1.68-1.33 3.2-1.58.22-.61.36-1.26.4-1.93.19-2.75-1.15-5.2-3.24-6.61-.8-.53-1.84.25-1.51 1.15.36.99.46 2.1.23 3.26-.46 2.24-2.27 4.05-4.51 4.51a5.85 5.85 0 0 1-3.26-.23c-.88-.32-1.69.69-1.17 1.48a7.37 7.37 0 0 0 6.48 3.28z"
          />
    </svg>
  );
});

IcNightHazy.displayName = 'IcNightHazy';
