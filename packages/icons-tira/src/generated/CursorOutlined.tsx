import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const CursorOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function CursorOutlined(
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
      <path d="M6.5882 4.89746C6.54276 4.31378 7.1914 3.9358 7.67707 4.26269L21.0247 13.25C21.5837 13.6267 21.3396 14.4979 20.6663 14.5293L13.847 14.8437L16.7611 19.8926C16.9265 20.1795 16.8282 20.5463 16.5413 20.7119C16.2544 20.8774 15.8877 20.779 15.722 20.4922L12.7689 15.3789L9.12629 21.1855C8.76775 21.7569 7.88777 21.5407 7.83527 20.8682L6.5882 4.89746ZM8.91339 19.2666L12.2064 14.0205C12.3283 13.8261 12.5377 13.703 12.7669 13.6924L19.0999 13.4004L7.86554 5.83594L8.91339 19.2666Z" fill="currentColor"/>
    </svg>
  );
});

CursorOutlined.displayName = 'CursorOutlined';
