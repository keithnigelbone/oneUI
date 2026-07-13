import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const SyncOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function SyncOutlined(
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
      <path d="M19.584 13.4005C20.2547 13.4006 20.628 14.1765 20.209 14.7003L16.4688 19.3751C16.2618 19.6338 15.8837 19.6758 15.625 19.4689C15.3663 19.2619 15.3244 18.8839 15.5312 18.6251L18.752 14.5997H4C3.66869 14.5997 3.40049 14.3314 3.40039 14.0001C3.40039 13.6688 3.66863 13.4005 4 13.4005H19.584ZM7.53125 4.62513C7.73825 4.36638 8.11624 4.32438 8.375 4.53138C8.63367 4.7384 8.67573 5.1164 8.46875 5.37513L5.24805 9.40052H20C20.3314 9.40053 20.5996 9.66876 20.5996 10.0001C20.5995 10.3314 20.3313 10.5997 20 10.5997H4.41602C3.74534 10.5996 3.37212 9.82371 3.79102 9.29993L7.53125 4.62513Z" fill="currentColor"/>
    </svg>
  );
});

SyncOutlined.displayName = 'SyncOutlined';
