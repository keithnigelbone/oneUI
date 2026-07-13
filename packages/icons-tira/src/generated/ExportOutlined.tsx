import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const ExportOutlined = forwardRef<SVGSVGElement, IconComponentProps>(function ExportOutlined(
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
      <path d="M12.0156 3.40027C12.3467 3.40052 12.6152 3.66873 12.6152 3.99988C12.6152 4.3311 12.3468 4.60022 12.0156 4.60046H6C5.22703 4.60067 4.60067 5.22688 4.60059 5.99988V17.9999C4.60059 18.7729 5.22698 19.4001 6 19.4003H18C18.7732 19.4003 19.4004 18.7731 19.4004 17.9999V12.0243C19.4006 11.6932 19.6689 11.4249 20 11.4247C20.3313 11.4247 20.6004 11.6931 20.6006 12.0243V17.9999C20.6006 19.4358 19.4359 20.6005 18 20.6005H6C4.56424 20.6003 3.40039 19.4357 3.40039 17.9999V5.99988C3.40047 4.56414 4.56429 3.40048 6 3.40027H12.0156ZM19.4004 3.39441C20.0631 3.39441 20.6006 3.93186 20.6006 4.5946V7.99402C20.6006 8.32539 20.3314 8.5946 20 8.5946C19.6688 8.59439 19.4004 8.32526 19.4004 7.99402V5.44421L10.7686 14.076C10.5342 14.3104 10.1542 14.3104 9.91992 14.076C9.686 13.8417 9.68574 13.4616 9.91992 13.2274L18.5527 4.5946H16C15.6688 4.59439 15.4004 4.32526 15.4004 3.99402C15.4006 3.66296 15.6689 3.39462 16 3.39441H19.4004Z" fill="currentColor"/>
    </svg>
  );
});

ExportOutlined.displayName = 'ExportOutlined';
