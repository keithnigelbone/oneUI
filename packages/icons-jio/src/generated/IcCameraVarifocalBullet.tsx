import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCameraVarifocalBullet = forwardRef<SVGSVGElement, IconComponentProps>(function IcCameraVarifocalBullet(
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
            d="M11.978 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2m9.71-3-3-5a2 2 0 0 0-1.71-1h-10a2 2 0 0 0-1.71 1l-3 5a2 2 0 0 0 1.71 3h1v4a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-4h1a2 2 0 0 0 1.74-1 2 2 0 0 0-.03-2m-9.71 7a3 3 0 1 1 0-6 3 3 0 0 1 0 6"
          />
    </svg>
  );
});

IcCameraVarifocalBullet.displayName = 'IcCameraVarifocalBullet';
