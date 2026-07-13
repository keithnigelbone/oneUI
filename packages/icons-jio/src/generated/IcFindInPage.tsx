import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcFindInPage = forwardRef<SVGSVGElement, IconComponentProps>(function IcFindInPage(
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
            d="M12.01 11c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2m9.11-7.12C20.56 3.32 19.79 3 19 3H5c-.8 0-1.56.32-2.12.88S2 5.21 2 6v12c0 .8.32 1.56.88 2.12S4.21 21 5 21h14c.8 0 1.56-.32 2.12-.88S22 18.79 22 18V6c0-.8-.32-1.56-.88-2.12M10.29 5.29A1 1 0 0 1 11 5a1.014 1.014 0 0 1 .99 1.2q-.06.3-.27.51c-.14.14-.32.24-.51.27a1.014 1.014 0 0 1-1.2-.99c0-.27.11-.52.29-.71zm-4.31.9c-.04.19-.13.37-.27.51s-.32.24-.51.27A1.014 1.014 0 0 1 4 5.98c0-.27.11-.52.29-.71A1 1 0 0 1 5 4.98c.2 0 .39.06.56.17.16.11.29.27.37.45s.1.38.06.58zm1.64.73A1.01 1.01 0 0 1 7 5.99c0-.27.11-.52.29-.71A1 1 0 0 1 8 4.99a1.014 1.014 0 0 1 .99 1.2q-.06.3-.27.51c-.14.14-.32.24-.51.27-.19.04-.4.02-.58-.06zm10.1 11.79c-.2.2-.45.29-.71.29s-.51-.1-.71-.29l-2.27-2.27c-.59.35-1.28.57-2.02.57-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4c0 .74-.22 1.42-.57 2.02l2.27 2.27c.39.39.39 1.02 0 1.41z"
          />
    </svg>
  );
});

IcFindInPage.displayName = 'IcFindInPage';
