import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcHairfall = forwardRef<SVGSVGElement, IconComponentProps>(function IcHairfall(
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
            d="M10.21 11.99c.01.06.04.12.06.18.18.51.52.93 1 1.12.01 0 .03.01.04.02.01 0 .03.01.04.02.96.39 2.08-.09 2.72-1.08v-.02c.1-.16.18-.32.26-.5.07-.16.12-.33.16-.5v-.02c.1-.42.13-.85.16-1.27.08-1.16.15-2.35 1.73-3.79.43-.33.85-.67 1.27-.98.35-.27.49-.78.31-1.17-.18-.38-.62-.49-.98-.24-.5.33-.92.67-1.29.99-1.89 1.49-4.79 3.93-5.31 5.21 0 .02-.02.04-.02.06s-.02.04-.02.06a2.86 2.86 0 0 0-.12 1.9V12zm-1.9 2.15v-.12c0-.33 0-.97.69-2.47H5.72c-.95 0-1.73.78-1.73 1.73v1.73h4.42c-.06-.29-.1-.57-.1-.86zm9.93-2.67h-3.33c.03.06.05.12.08.19.2.49.39.99.49 1.52v.04l.02.03v.03c.06.3.09.57.09.85s-.04.58-.1.88H20v-1.77c0-.97-.79-1.77-1.77-1.77zM12.02 18l-.11-.01c-.94 0-1.86-.46-2.57-1.29l-.06-.06-.03-.03-.1-.13-.08-.1-.02-.03c-.08-.11-.14-.23-.21-.35H4v2c0 1.1.72 2 1.6 2h12.8c.88 0 1.6-.9 1.6-2v-2h-4.82c-.73 1.22-1.88 1.99-3.17 2z"
          />
    </svg>
  );
});

IcHairfall.displayName = 'IcHairfall';
