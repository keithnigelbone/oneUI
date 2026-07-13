import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const LocationFilled = forwardRef<SVGSVGElement, IconComponentProps>(function LocationFilled(
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
      <path d="M18.5515 7.05698C19.0198 8.1764 19.3061 9.42937 19.3061 10.8124C19.3862 12.678 18.1933 17.0752 12.9591 20.4399C12.3915 20.8047 11.6668 20.8218 11.0959 20.4623C8.54875 18.8583 4.76177 15.3904 4.69234 10.8528C4.67216 9.53392 4.98127 8.30005 5.49374 7.17278C7.9618 1.74382 16.2499 1.55541 18.5515 7.05698Z" fill="currentColor"/>
      <path d="M15.0005 11C15.0005 12.6569 13.6574 14 12.0005 14C10.3437 14 9.00055 12.6569 9.00055 11C9.00055 9.34315 10.3437 8 12.0005 8C13.6574 8 15.0005 9.34315 15.0005 11Z" fill="white"/>
    </svg>
  );
});

LocationFilled.displayName = 'LocationFilled';
