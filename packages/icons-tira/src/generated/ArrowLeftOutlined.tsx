import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const ArrowLeftOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function ArrowLeftOutlined(
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
      <path d="M9.30184 5.50871C9.52992 5.34849 9.84678 5.36488 10.0577 5.5634C10.2685 5.76202 10.3036 6.07709 10.1573 6.31437L10.0831 6.41105L5.38778 11.4003H19.9991L20.1202 11.412C20.3936 11.468 20.5996 11.71 20.5997 11.9999C20.5997 12.2898 20.3936 12.5318 20.1202 12.5878L19.9991 12.5995H5.38778L10.0831 17.5888C10.31 17.83 10.2986 18.2093 10.0577 18.4364C9.81649 18.6635 9.43718 18.6521 9.21005 18.4111L3.8204 12.6855C3.48073 12.3246 3.45984 11.7742 3.75692 11.3896L3.8204 11.3144L9.21005 5.58879L9.30184 5.50871Z" fill="currentColor"/>
    </svg>
  );
});

ArrowLeftOutlined.displayName = 'ArrowLeftOutlined';
