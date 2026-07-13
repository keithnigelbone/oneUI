import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const DislikeOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function DislikeOutlined(
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
      <path d="M18.0009 3.57825C19.4366 3.57844 20.6003 4.74222 20.6005 6.17786V10.5363C20.6005 11.9721 19.4367 13.1366 18.0009 13.1368H16.2275L13.2421 19.9747C13.1236 20.2463 12.8558 20.422 12.5595 20.422C10.8918 20.4219 9.5401 19.0701 9.53997 17.4025V14.6154H6.35638C4.75202 14.6153 3.5306 13.177 3.79095 11.5939L4.75091 5.75598C4.95764 4.49997 6.04341 3.5783 7.31634 3.57825H18.0009ZM7.31634 4.77844C6.63088 4.7785 6.04672 5.27491 5.93548 5.95129L4.97454 11.7882C4.83435 12.6406 5.4925 13.4161 6.35638 13.4161H9.93939C10.3812 13.4161 10.7402 13.7741 10.7402 14.2159V17.4025C10.7403 18.3093 11.4034 19.0612 12.2714 19.1993L15.2353 12.4113V4.77844H7.31634ZM16.4355 11.9366H18.0009C18.7739 11.9365 19.4003 11.3093 19.4003 10.5363V6.17786C19.4001 5.40496 18.7738 4.77864 18.0009 4.77844H16.4355V11.9366Z" fill="currentColor"/>
    </svg>
  );
});

DislikeOutlined.displayName = 'DislikeOutlined';
