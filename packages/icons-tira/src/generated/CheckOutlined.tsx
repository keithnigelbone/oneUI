import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const CheckOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function CheckOutlined(
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
      <path d="M20.4121 5.59749C20.6464 5.8318 20.6464 6.2117 20.4121 6.44602L8.73853 18.1196C8.348 18.5101 7.71483 18.5101 7.32431 18.1196L3.58589 14.3811C3.35158 14.1468 3.35158 13.7669 3.5859 13.5326C3.82021 13.2983 4.20011 13.2983 4.43442 13.5326L8.03142 17.1296L19.5636 5.59749C19.7979 5.36317 20.1778 5.36317 20.4121 5.59749Z" fill="currentColor"/>
    </svg>
  );
});

CheckOutlined.displayName = 'CheckOutlined';
