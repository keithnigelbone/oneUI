import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcIos = forwardRef<SVGSVGElement, IconComponentProps>(function IcIos(
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
            d="M4.2 9.42c-.4 0-.82.18-.82.74v5.25c0 .55.42.74.82.74s.81-.19.81-.74v-5.25c0-.56-.4-.74-.81-.74M4.2 7c-.56 0-.94.39-.94.94s.38.94.94.94.94-.4.94-.94S4.74 7 4.2 7m14.29 3.95-1.21-.46c-.69-.25-1.12-.44-1.12-.96 0-.56.59-.92 1.43-.92.34 0 .87.04 1.51.44.12.08.25.17.47.17.42 0 .83-.47.83-.87 0-.25-.16-.47-.34-.61-.86-.65-1.75-.74-2.47-.74-1.96 0-3.19 1.01-3.19 2.54s.86 2.03 2.31 2.56l1.22.46c.66.25 1.07.51 1.07 1 0 .62-.57.99-1.42.99s-1.37-.25-1.83-.61c-.17-.13-.34-.26-.57-.26-.43 0-.87.51-.87.86 0 .26.12.43.25.56.64.64 1.64 1.07 3.03 1.07 1.9 0 3.17-.99 3.17-2.6 0-1.33-.83-2.05-2.28-2.6zM9.83 7c-1.09 0-1.91.17-2.63.98-.52.6-.77 1.85-.77 3.6s.25 3 .77 3.6c.71.81 1.53.97 2.63.97s1.91-.17 2.63-.97c.52-.6.77-1.85.77-3.6s-.25-3-.77-3.6C11.75 7.17 10.93 7 9.83 7m1.38 6.86c-.34.65-1.01.65-1.38.65s-1.04 0-1.38-.65c-.26-.49-.26-1.26-.26-2.29s.01-1.79.26-2.29c.34-.68 1.01-.68 1.38-.68s1.03 0 1.38.68c.25.49.26 1.26.26 2.29s0 1.79-.26 2.29"
          />
    </svg>
  );
});

IcIos.displayName = 'IcIos';
