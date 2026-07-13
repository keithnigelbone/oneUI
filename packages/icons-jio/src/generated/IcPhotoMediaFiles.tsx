import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcPhotoMediaFiles = forwardRef<SVGSVGElement, IconComponentProps>(function IcPhotoMediaFiles(
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
      <path
            fill="currentColor"
            d="M6 13a1 1 0 1 0 0 2 1 1 0 0 0 0-2M20 2H9a2 2 0 0 0-2 2v6H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-6h3a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2m-7.29 12.29a1 1 0 0 0-1.42 0L8 17.59l-1.29-1.3a1 1 0 0 0-1.42 0L4 17.59V12h11v4.59zM17 12a2 2 0 0 0-2-2H9V4h11v8zm-3-5.92a.5.5 0 0 0-.78.42v2a.51.51 0 0 0 .26.44.5.5 0 0 0 .24.06.6.6 0 0 0 .28-.08l1.5-1a.51.51 0 0 0 0-.84z"
          />
    </svg>
  );
});

IcPhotoMediaFiles.displayName = 'IcPhotoMediaFiles';
