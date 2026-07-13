import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const ChatListOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function ChatListOutlined(
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
      <path d="M7.51605 7.89429C7.93027 7.89429 8.26605 7.5585 8.26605 7.14429C8.26605 6.73007 7.93027 6.39429 7.51605 6.39429C7.10184 6.39429 6.76605 6.73007 6.76605 7.14429C6.76605 7.5585 7.10184 7.89429 7.51605 7.89429Z" fill="currentColor"/>
      <path d="M10.7661 7.14429C10.7661 7.5585 10.4303 7.89429 10.0161 7.89429C9.60184 7.89429 9.26605 7.5585 9.26605 7.14429C9.26605 6.73007 9.60184 6.39429 10.0161 6.39429C10.4303 6.39429 10.7661 6.73007 10.7661 7.14429Z" fill="currentColor"/>
      <path d="M12.5161 7.89429C12.9303 7.89429 13.2661 7.5585 13.2661 7.14429C13.2661 6.73007 12.9303 6.39429 12.5161 6.39429C12.1018 6.39429 11.7661 6.73007 11.7661 7.14429C11.7661 7.5585 12.1018 7.89429 12.5161 7.89429Z" fill="currentColor"/>
      <path d="M6.91614 12.7903C6.91614 12.4589 7.18477 12.1903 7.51614 12.1903L16.6675 12.1903C16.9989 12.1903 17.2675 12.4589 17.2675 12.7903C17.2675 13.1217 16.9989 13.3903 16.6675 13.3903L7.51614 13.3903C7.18477 13.3903 6.91614 13.1217 6.91614 12.7903Z" fill="currentColor"/>
      <path d="M7.51614 15.2377C7.18477 15.2377 6.91614 15.5063 6.91614 15.8377C6.91614 16.169 7.18477 16.4377 7.51614 16.4377H16.6675C16.9989 16.4377 17.2675 16.169 17.2675 15.8377C17.2675 15.5063 16.9989 15.2377 16.6675 15.2377L7.51614 15.2377Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M6 4C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20H17.9998C19.1043 20 19.9998 19.1046 19.9998 18V6C19.9998 4.89543 19.1043 4 17.9998 4H6ZM17.9998 5.2H6C5.55817 5.2 5.2 5.55817 5.2 6V8.70764H18.7998V6C18.7998 5.55817 18.4416 5.2 17.9998 5.2ZM5.2 18V9.90764H18.7998V18C18.7998 18.4418 18.4416 18.8 17.9998 18.8H6C5.55817 18.8 5.2 18.4418 5.2 18Z" fill="currentColor"/>
    </svg>
  );
});

ChatListOutlined.displayName = 'ChatListOutlined';
