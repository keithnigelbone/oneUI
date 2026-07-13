import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const TrendingOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function TrendingOutlined(
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
      <path d="M19.7987 7.23816C19.8357 7.23816 19.8724 7.24111 19.9081 7.24597C20.0904 7.21812 20.2833 7.27355 20.4237 7.41394C20.5634 7.55375 20.6168 7.74509 20.5897 7.92664C20.5948 7.96309 20.5995 8.00011 20.5995 8.03796V12.7606C20.5993 13.0918 20.3302 13.3602 19.9989 13.3602C19.6677 13.3602 19.3995 13.0918 19.3993 12.7606V9.28601L14.5848 14.1005C14.2724 14.4129 13.7664 14.4129 13.454 14.1005L10.1845 10.8319L4.43054 16.5858C4.19623 16.8201 3.81623 16.8201 3.58191 16.5858C3.34774 16.3515 3.34765 15.9714 3.58191 15.7372L9.61902 9.70007C9.93145 9.38778 10.4385 9.38769 10.7509 9.70007L14.0194 12.9696L18.5507 8.43835H15.077C14.7457 8.43835 14.4764 8.16914 14.4764 7.83777C14.4767 7.50658 14.7458 7.23816 15.077 7.23816H19.7987Z" fill="currentColor"/>
    </svg>
  );
});

TrendingOutlined.displayName = 'TrendingOutlined';
