import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcDocumentOdt = forwardRef<SVGSVGElement, IconComponentProps>(function IcDocumentOdt(
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
            d="M18.27 2.73C17.8 2.26 17.17 2 16.5 2H9c-.53 0-1.04.21-1.41.59l-3 3C4.21 5.96 4 6.47 4 7v12.5c0 .66.26 1.3.73 1.77s1.1.73 1.77.73h10c.66 0 1.3-.26 1.77-.73s.73-1.1.73-1.77v-15c0-.66-.26-1.3-.73-1.77M8.98 18.41c-.37.46-.91.59-1.43.59s-1.06-.12-1.43-.59c-.27-.34-.34-.94-.34-1.74s.07-1.39.34-1.74c.37-.46.9-.59 1.43-.59s1.06.13 1.43.59c.27.34.34.94.34 1.74s-.07 1.39-.34 1.74m4.15 0c-.36.45-.86.56-1.39.56h-1.25c-.28 0-.53-.12-.53-.5v-3.59c0-.38.25-.51.53-.51h1.25c.53 0 1.02.11 1.39.56.28.34.34.94.34 1.74s-.06 1.4-.34 1.74m3.61-2.97h-.67s-.06.01-.06.06v3.03c0 .38-.3.47-.56.47s-.57-.09-.57-.47V15.5s-.01-.06-.06-.06h-.65c-.37 0-.48-.26-.48-.53 0-.28.11-.54.48-.54h2.56c.37 0 .48.26.48.54s-.11.53-.48.53z"
          />
          <path
            fill="currentColor"
            d="M11.7 15.44h-.55s-.06.01-.06.06v2.34s.01.06.06.06h.55c.2 0 .39-.07.5-.24.1-.17.11-.57.11-.98s0-.81-.11-.99c-.1-.17-.3-.24-.5-.24zM7.54 15.42c-.2 0-.39.08-.5.27-.1.18-.11.57-.11.99s.01.81.11.98c.11.19.3.27.5.27s.39-.08.5-.27c.1-.18.11-.57.11-.98s-.01-.81-.11-.99a.55.55 0 0 0-.5-.27"
          />
    </svg>
  );
});

IcDocumentOdt.displayName = 'IcDocumentOdt';
