import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcColourPalette = forwardRef<SVGSVGElement, IconComponentProps>(function IcColourPalette(
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
            d="M21.8 10A10 10 0 1 0 12 22a3 3 0 0 0 3-3v-1.72A2.08 2.08 0 0 1 17 15h2a3 3 0 0 0 3-3c0-.672-.067-1.342-.2-2M6.44 7.44a1.5 1.5 0 1 1 0 2.12 1.49 1.49 0 0 1 0-2.12M6.5 15a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m4.06 3.56a1.5 1.5 0 1 1 0-2.12 1.49 1.49 0 0 1 0 2.12M12 8a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3m5.56 1.56a1.5 1.5 0 1 1 0-2.12 1.49 1.49 0 0 1 0 2.12"
          />
    </svg>
  );
});

IcColourPalette.displayName = 'IcColourPalette';
