import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const SendOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function SendOutlined(
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
      <path d="M17.4873 4.43757C18.7565 3.96649 20.0007 5.18666 19.5547 6.46491L14.876 19.8751C14.4028 21.2301 12.5221 21.3251 11.9151 20.0245L9.50198 14.8507C9.46109 14.763 9.38923 14.6935 9.30081 14.6544L4.08108 12.3428C2.76849 11.7617 2.82634 9.87973 4.1719 9.37995L17.4873 4.43757ZM4.58889 10.5049C4.25316 10.6302 4.23861 11.1009 4.56643 11.2462L9.78714 13.5567C10.1408 13.7133 10.4254 13.9933 10.5889 14.3438L13.003 19.5176C13.155 19.842 13.6248 19.8178 13.7432 19.4796L18.2305 6.61628L11.9229 12.9249C11.6885 13.1585 11.3083 13.1589 11.0742 12.9249C10.8402 12.6908 10.8406 12.3106 11.0742 12.0762L17.4004 5.74909L4.58889 10.5049Z" fill="currentColor"/>
    </svg>
  );
});

SendOutlined.displayName = 'SendOutlined';
