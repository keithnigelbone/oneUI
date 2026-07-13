import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcNightMostlyCloudyShowers = forwardRef<SVGSVGElement, IconComponentProps>(function IcNightMostlyCloudyShowers(
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
            d="M19.77 10.51C19.36 8.51 17.65 7 15.6 7c-1.6 0-2.97.93-3.71 2.28-.18-.03-.37-.06-.56-.06-1.77 0-3.2 1.49-3.2 3.33-1.18 0-2.13.99-2.13 2.22s.96 2.22 2.13 2.22H18.8c1.77 0 3.2-1.49 3.2-3.33 0-1.49-.94-2.73-2.23-3.16zM9.2 18.41l-1.5 2c-.33.44-.24 1.07.2 1.4.18.13.39.2.6.2.3 0 .6-.14.8-.4l1.5-2c.33-.44.24-1.07-.2-1.4s-1.07-.24-1.4.2m4 0-1.5 2c-.33.44-.24 1.07.2 1.4.18.13.39.2.6.2.3 0 .6-.14.8-.4l1.5-2c.33-.44.24-1.07-.2-1.4s-1.07-.24-1.4.2m4 0-1.5 2c-.33.44-.24 1.07.2 1.4.18.13.39.2.6.2.3 0 .6-.14.8-.4l1.5-2c.33-.44.24-1.07-.2-1.4s-1.07-.24-1.4.2M10.87 7.25c.45-.53.97-.98 1.55-1.34a5.7 5.7 0 0 0-2.21-3.73c-.65-.49-1.6.15-1.36.94.33 1.08.28 2.33-.34 3.6A3.92 3.92 0 0 1 6.7 8.53c-1.27.61-2.52.67-3.6.34-.78-.24-1.43.71-.94 1.36.68.9 1.63 1.58 2.72 1.96.39-.51.9-.93 1.48-1.21.62-2.02 2.38-3.52 4.5-3.72z"
          />
    </svg>
  );
});

IcNightMostlyCloudyShowers.displayName = 'IcNightMostlyCloudyShowers';
