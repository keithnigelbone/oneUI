import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPhotoCamera = forwardRef<SVGSVGElement, IconComponentProps>(function IcPhotoCamera(
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
            d="M19 6h-7V5a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v1H5a3.12 3.12 0 0 0-3 3.23v7.54A3.12 3.12 0 0 0 5 20h14a3.12 3.12 0 0 0 3-3.23V9.23A3.12 3.12 0 0 0 19 6m-7 10a3 3 0 1 1 0-5.999A3 3 0 0 1 12 16"
          />
    </svg>
  );
});

IcPhotoCamera.displayName = 'IcPhotoCamera';
