import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const UserOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function UserOutlined(
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
      <path d="M12 14C15.866 14 19 14.4437 19 17.5C19 20.5563 15.866 21 12 21C8.13401 21 5 20.5563 5 17.5C5 14.4437 8.13401 14 12 14ZM12 15.2002C10.0597 15.2002 8.5186 15.3206 7.48535 15.7227C6.99346 15.9141 6.69218 16.142 6.50977 16.3848C6.33629 16.6156 6.2002 16.9519 6.2002 17.5C6.2002 18.0481 6.33629 18.3844 6.50977 18.6152C6.69218 18.858 6.99346 19.0859 7.48535 19.2773C8.5186 19.6794 10.0597 19.7998 12 19.7998C13.9403 19.7998 15.4814 19.6794 16.5146 19.2773C17.0065 19.0859 17.3078 18.858 17.4902 18.6152C17.6637 18.3844 17.7998 18.0481 17.7998 17.5C17.7998 16.9519 17.6637 16.6156 17.4902 16.3848C17.3078 16.142 17.0065 15.9141 16.5146 15.7227C15.4814 15.3206 13.9403 15.2002 12 15.2002ZM12 3.5C14.4853 3.5 16.5 5.51472 16.5 8C16.5 10.4853 14.4853 12.5 12 12.5C9.51472 12.5 7.5 10.4853 7.5 8C7.5 5.51472 9.51472 3.5 12 3.5ZM12 4.7002C10.1775 4.7002 8.7002 6.17746 8.7002 8C8.7002 9.82254 10.1775 11.2998 12 11.2998C13.8225 11.2998 15.2998 9.82254 15.2998 8C15.2998 6.17746 13.8225 4.7002 12 4.7002Z" fill="currentColor"/>
    </svg>
  );
});

UserOutlined.displayName = 'UserOutlined';
