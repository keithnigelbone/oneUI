import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const UserFilled = forwardRef<SVGSVGElement, IconComponentProps>(function UserFilled(
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
      <path d="M12 3.5C9.51472 3.5 7.5 5.51472 7.5 8C7.5 10.4853 9.51472 12.5 12 12.5C14.4853 12.5 16.5 10.4853 16.5 8C16.5 5.51472 14.4853 3.5 12 3.5Z" fill="currentColor"/>
      <path d="M19 17.5C19 20.5563 15.866 21 12 21C8.13401 21 5 20.5563 5 17.5C5 14.4437 8.13401 14 12 14C15.866 14 19 14.4437 19 17.5Z" fill="currentColor"/>
    </svg>
  );
});

UserFilled.displayName = 'UserFilled';
