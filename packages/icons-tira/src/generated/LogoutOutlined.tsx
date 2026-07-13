import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const LogoutOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function LogoutOutlined(
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
      <path d="M13.9121 3.41504L14.2686 3.50488C17.9216 4.51295 20.5995 7.89282 20.5996 11.8994C20.5996 16.6974 16.7567 20.5996 12 20.5996C7.24332 20.5996 3.40039 16.6974 3.40039 11.8994C3.40052 7.76364 6.25405 4.2959 10.0879 3.41504L10.208 3.40039C10.487 3.39349 10.7415 3.58279 10.8066 3.86523C10.8808 4.18819 10.6794 4.51075 10.3564 4.58496L10.0508 4.66211C6.91378 5.52794 4.59974 8.43697 4.59961 11.8994C4.59961 16.0488 7.92012 19.4004 12 19.4004C16.0799 19.4004 19.4004 16.0488 19.4004 11.8994C19.4003 8.43697 17.0862 5.52794 13.9492 4.66211L13.6436 4.58496L13.5283 4.5459C13.2744 4.43016 13.1284 4.14783 13.1934 3.86523C13.2585 3.58279 13.513 3.39349 13.792 3.40039L13.9121 3.41504Z" fill="currentColor"/>
      <path d="M12 2.40039C12.3314 2.40039 12.5996 2.66863 12.5996 3V8C12.5996 8.33137 12.3314 8.59961 12 8.59961C11.6686 8.59961 11.4004 8.33137 11.4004 8V3C11.4004 2.66863 11.6686 2.40039 12 2.40039Z" fill="currentColor"/>
    </svg>
  );
});

LogoutOutlined.displayName = 'LogoutOutlined';
