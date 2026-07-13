import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const Ic8K = forwardRef<SVGSVGElement, IconComponentProps>(function Ic8K(
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
            d="M8.32 12.77c-.47 0-.77.26-.77.79 0 .42.26.79.77.79s.77-.37.77-.79c0-.53-.3-.79-.77-.79m0-1.61c.43 0 .7-.25.7-.75 0-.41-.24-.76-.7-.76s-.7.35-.7.76c0 .5.26.75.7.75M19 4H5C3.34 4 2 5.34 2 7v10c0 1.66 1.34 3 3 3h14c1.66 0 3-1.34 3-3V7c0-1.66-1.34-3-3-3M8.32 16.22c-1.63 0-2.77-.96-2.77-2.45 0-.76.22-1.31.8-1.8.05-.02.06-.06.06-.1s-.01-.06-.05-.1c-.29-.31-.56-.94-.56-1.63 0-1.46 1.07-2.38 2.52-2.38s2.52.91 2.52 2.38c0 .7-.28 1.32-.56 1.63-.04.04-.05.06-.05.1s.01.07.06.1c.59.49.8 1.04.8 1.8 0 1.49-1.14 2.45-2.77 2.45m9.03 0c-.26 0-.53-.13-.76-.49l-1.64-2.62c-.04-.06-.06-.08-.11-.08-.04 0-.06.02-.08.05l-.38.47c-.07.1-.08.24-.08.36v1.46c0 .68-.55.85-1.03.85s-1.01-.17-1.01-.85V8.63c0-.68.55-.85 1.01-.85.48 0 1.03.17 1.03.85v1.73c0 .08.02.13.08.13.04 0 .06-.02.07-.04l1.75-2.27c.23-.3.48-.41.72-.41.47 0 1.09.47 1.09 1 0 .18-.07.38-.24.6l-1.54 1.93s-.06.07-.06.11.04.1.06.13l2.03 3.15c.13.2.18.38.18.55 0 .52-.61.97-1.09.97z"
          />
    </svg>
  );
});

Ic8K.displayName = 'Ic8K';
