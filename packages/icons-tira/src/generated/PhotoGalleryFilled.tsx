import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const PhotoGalleryFilled = forwardRef<SVGSVGElement, IconComponentProps>(function PhotoGalleryFilled(
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
      <path d="M5 3C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V11.8547V5C21 3.89543 20.1046 3 19 3H5Z" fill="currentColor"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M11.0015 8.50073C11.0015 9.88185 9.88185 11.0015 8.50073 11.0015C7.11962 11.0015 6 9.88185 6 8.50073C6 7.11962 7.11962 6 8.50073 6C9.88185 6 11.0015 7.11962 11.0015 8.50073ZM9.80147 8.50073C9.80147 9.21911 9.21911 9.80147 8.50073 9.80147C7.78236 9.80147 7.2 9.21911 7.2 8.50073C7.2 7.78236 7.78236 7.2 8.50073 7.2C9.21911 7.2 9.80147 7.78236 9.80147 8.50073Z" fill="white"/>
      <path d="M14.7808 11.311C14.9083 11.0117 15.2512 10.8686 15.5537 10.9884L20.7791 13.0578C21 13 20.9042 13 21 13C21.122 12.6919 21 12 21 12V11.8547L15.9955 9.87274C15.0881 9.51337 14.0595 9.94268 13.6769 10.8406L11.4751 16.0066C11.3564 16.2851 11.0488 16.4315 10.7578 16.3481L8.03048 15.566C7.32598 15.364 6.56934 15.6092 6.11736 16.1862L3.02771 20.13L3.97234 20.87L7.06199 16.9262C7.21265 16.7339 7.46487 16.6522 7.6997 16.7195L10.427 17.5016C11.3001 17.752 12.223 17.3126 12.5791 16.477L14.7808 11.311Z" fill="white"/>
    </svg>
  );
});

PhotoGalleryFilled.displayName = 'PhotoGalleryFilled';
