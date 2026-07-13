import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const NavigationFilled = forwardRef<SVGSVGElement, IconComponentProps>(function NavigationFilled(
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
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor"/>
      <path d="M15.7468 8.78221C15.8971 8.44683 15.5535 8.10324 15.2181 8.25359L6.10787 12.3374C5.72751 12.5079 5.82897 13.0738 6.24488 13.1016L10.2587 13.3692C10.4587 13.3825 10.6179 13.5418 10.6312 13.7417L10.8988 17.7554C10.9266 18.1713 11.4924 18.2728 11.6629 17.8924L15.7468 8.78221Z" fill="white"/>
    </svg>
  );
});

NavigationFilled.displayName = 'NavigationFilled';
