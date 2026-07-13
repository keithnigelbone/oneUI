import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const NavigationOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function NavigationOutlined(
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
      <path fillRule="evenodd" clipRule="evenodd" d="M6.24489 13.1013C5.82897 13.0736 5.72751 12.5077 6.10788 12.3372L15.2182 8.25335C15.5535 8.103 15.8971 8.44658 15.7468 8.78197L11.6629 17.8922C11.4924 18.2726 10.9266 18.1711 10.8988 17.7552L10.6312 13.7415C10.6179 13.5415 10.4587 13.3823 10.2587 13.369L6.24489 13.1013ZM9.53099 12.1178L13.7928 10.2073L11.8824 14.469L11.8286 13.6616C11.7753 12.8619 11.1384 12.225 10.3386 12.1716L9.53099 12.1178Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12ZM20.8 12C20.8 16.8601 16.8601 20.8 12 20.8C7.13989 20.8 3.2 16.8601 3.2 12C3.2 7.13989 7.13989 3.2 12 3.2C16.8601 3.2 20.8 7.13989 20.8 12Z" fill="currentColor"/>
    </svg>
  );
});

NavigationOutlined.displayName = 'NavigationOutlined';
