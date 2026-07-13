import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const NotificationFilled = forwardRef<SVGSVGElement, IconComponentProps>(function NotificationFilled(
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
      <path d="M12.5994 2.9999C12.5994 2.66853 12.3308 2.3999 11.9994 2.3999C11.668 2.3999 11.3994 2.66853 11.3994 2.9999V4.72464C9.84157 4.86458 8.37438 5.54619 7.25948 6.66109C6.00238 7.91819 5.29614 9.62319 5.29614 11.401V17.429H3.82852C3.49714 17.429 3.22852 17.6976 3.22852 18.029C3.22852 18.3603 3.49714 18.629 3.82852 18.629H9.99844C9.97071 18.7638 9.95656 18.9017 9.95656 19.0405C9.95656 19.3991 10.051 19.7513 10.2303 20.0619C10.4095 20.3724 10.6674 20.6303 10.978 20.8096C11.2885 20.9889 11.6408 21.0833 11.9994 21.0833C12.358 21.0833 12.7103 20.9889 13.0208 20.8096C13.3314 20.6303 13.5893 20.3724 13.7686 20.0619C13.9479 19.7513 14.0422 19.3991 14.0422 19.0405C14.0422 18.9017 14.0281 18.7638 14.0004 18.629H20.1713C20.5027 18.629 20.7713 18.3603 20.7713 18.029C20.7713 17.6976 20.5027 17.429 20.1713 17.429H18.7026L18.7026 11.401C18.7026 9.62319 17.9964 7.91819 16.7393 6.66109C15.6244 5.5462 14.1572 4.86459 12.5994 4.72464V2.9999Z" fill="currentColor"/>
    </svg>
  );
});

NotificationFilled.displayName = 'NotificationFilled';
