import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHeavyRain = forwardRef<SVGSVGElement, IconComponentProps>(function IcHeavyRain(
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
            d="M21 6c-.75 0-1.08-.3-1.59-.75C18.82 4.72 18 4 16.5 4s-2.32.72-2.91 1.25c-.51.45-.84.75-1.59.75s-1.08-.3-1.59-.75C9.82 4.72 9 4 7.5 4s-2.32.72-2.91 1.25C4.08 5.7 3.75 6 3 6c-.55 0-1 .45-1 1s.45 1 1 1c1.5 0 2.32-.72 2.91-1.25C6.42 6.3 6.75 6 7.5 6s1.08.3 1.59.75C9.68 7.28 10.5 8 12 8s2.32-.72 2.91-1.25c.51-.45.84-.75 1.59-.75s1.08.3 1.59.75C18.68 7.28 19.5 8 21 8c.55 0 1-.45 1-1s-.45-1-1-1m-5.68 3.05a.996.996 0 0 0-1.26.63l-3 9a1 1 0 0 0 .63 1.26c.11.04.21.05.32.05.42 0 .81-.26.95-.68l3-9a1 1 0 0 0-.63-1.26zm4 0a.996.996 0 0 0-1.26.63l-3 9a1 1 0 0 0 .63 1.26c.11.04.21.05.32.05.42 0 .81-.26.95-.68l3-9a1 1 0 0 0-.63-1.26zm-8 0a.996.996 0 0 0-1.26.63l-3 9a1 1 0 0 0 .63 1.26c.11.04.21.05.32.05.42 0 .81-.26.95-.68l3-9a1 1 0 0 0-.63-1.26zm-4 0a.996.996 0 0 0-1.26.63l-3 9a1 1 0 0 0 .63 1.26c.11.04.21.05.32.05.42 0 .81-.26.95-.68l3-9a1 1 0 0 0-.63-1.26z"
          />
    </svg>
  );
});

IcHeavyRain.displayName = 'IcHeavyRain';
