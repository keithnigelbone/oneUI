import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDocumentTif = forwardRef<SVGSVGElement, IconComponentProps>(function IcDocumentTif(
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
            d="M19.27 2.73C18.8 2.26 18.17 2 17.5 2H10c-.53 0-1.04.21-1.41.59l-3 3C5.21 5.96 5 6.47 5 7v12.5c0 .66.26 1.3.73 1.77s1.1.73 1.77.73h10c.66 0 1.3-.26 1.77-.73s.73-1.1.73-1.77v-15c0-.66-.26-1.3-.73-1.77m-8.32 12.8h-.66s-.06.01-.06.06v2.98c0 .38-.3.46-.55.46-.26 0-.56-.08-.56-.46v-2.98s-.01-.06-.06-.06h-.64c-.36 0-.47-.25-.47-.52s.11-.53.47-.53h2.52c.36 0 .47.25.47.53s-.11.52-.47.52zm2.16 3.04c0 .37-.3.46-.56.46s-.55-.09-.55-.46v-3.65c0-.37.3-.46.55-.46.26 0 .56.09.56.46zm3.47-3.04h-1.44s-.06.01-.06.06v.49s.01.06.06.06h1.03c.36 0 .47.25.47.53s-.11.52-.47.52h-1.03s-.06.01-.06.06v1.31c0 .37-.3.46-.56.46s-.55-.09-.55-.46v-3.59c0-.37.25-.5.52-.5h2.08c.36 0 .47.25.47.53s-.11.52-.47.52z"
          />
    </svg>
  );
});

IcDocumentTif.displayName = 'IcDocumentTif';
