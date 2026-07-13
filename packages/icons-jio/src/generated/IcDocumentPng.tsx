import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDocumentPng = forwardRef<SVGSVGElement, IconComponentProps>(function IcDocumentPng(
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
            d="M8.75 15.54h-.66s-.06.01-.06.06v.78s.01.06.06.06h.66c.25 0 .42-.16.42-.44s-.17-.46-.42-.46"
          />
          <path
            fill="currentColor"
            d="M19.27 2.73C18.8 2.26 18.17 2 17.5 2H10c-.53 0-1.04.21-1.41.59l-3 3C5.21 5.96 5 6.47 5 7v12.5c0 .66.26 1.3.73 1.77s1.1.73 1.77.73h10c.66 0 1.3-.26 1.77-.73s.73-1.1.73-1.77v-15c0-.66-.26-1.3-.73-1.77M8.91 17.49h-.82s-.06.01-.06.06v1.01c0 .37-.3.46-.56.46s-.55-.09-.55-.46v-3.59c0-.37.25-.5.52-.5H8.9c.78 0 1.4.49 1.4 1.51s-.61 1.51-1.39 1.51m5.34.96c0 .44-.22.57-.58.57-.25 0-.42-.08-.59-.4l-1.02-1.88s-.02-.04-.05-.04-.03.05-.03.05v1.81c0 .37-.3.46-.56.46s-.55-.09-.55-.46v-3.54c0-.44.22-.57.58-.57.25 0 .42.08.59.4l1.02 1.85s.02.04.05.04.03-.05.03-.05v-1.77c0-.37.3-.46.56-.46s.55.09.55.46v3.54zm4.06-1.05c0 .47-.15.85-.31 1.06-.36.45-.85.57-1.36.57s-1.05-.12-1.41-.58c-.27-.34-.33-.92-.33-1.71s.06-1.37.33-1.71c.36-.46.88-.58 1.42-.58.47 0 .87.1 1.18.32.14.1.23.2.23.43 0 .26-.27.55-.53.55-.12 0-.19-.04-.27-.08-.23-.13-.36-.18-.6-.18-.22 0-.41.08-.51.27-.1.18-.11.56-.11.97s.01.79.11.97c.1.19.29.27.49.27s.32-.07.44-.19c.05-.04.12-.19.12-.31v-.04s-.02-.06-.06-.06h-.08c-.36 0-.47-.25-.47-.52s.11-.53.47-.53h.84c.26 0 .4.17.4.4z"
          />
    </svg>
  );
});

IcDocumentPng.displayName = 'IcDocumentPng';
