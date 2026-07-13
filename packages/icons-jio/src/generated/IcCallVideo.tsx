import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcCallVideo = forwardRef<SVGSVGElement, IconComponentProps>(function IcCallVideo(
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
            d="m16.84 16.6-.73-.75a2 2 0 0 0-1.42-.58c-.27 0-.52.05-.77.15s-.46.25-.65.43l-.7.71c-.09.09-.2.17-.33.22-.12.05-.25.08-.38.08s-.26-.03-.38-.08a1.2 1.2 0 0 1-.33-.22l-4.23-4.24a1 1 0 0 1-.22-.33 1 1 0 0 1-.08-.38c0-.13.03-.26.08-.38s.13-.23.22-.33l.71-.7a2 2 0 0 0 .58-1.42c0-.27-.05-.52-.15-.77s-.25-.46-.43-.65l-.71-.71a2 2 0 0 0-1.42-.58c-.27 0-.52.05-.77.15-.24.1-.46.25-.65.43l-1 1c-.3.31-.5.7-.56 1.13-.16 1.4-.04 4.74 3.68 8.48s7.08 3.84 8.49 3.72c.43-.06.82-.26 1.13-.56l1-1A2 2 0 0 0 17.4 18c0-.27-.05-.52-.15-.77-.1-.24-.25-.46-.43-.65zM21.87 4.26a.95.95 0 0 0-.36-.33.96.96 0 0 0-.47-.09c-.16.01-.32.07-.45.17l-1.53 1.18v-.47a1.77 1.77 0 0 0-1.77-1.77h-5.3a1.77 1.77 0 0 0-1.77 1.77v3.53a1.77 1.77 0 0 0 1.77 1.77h5.3a1.77 1.77 0 0 0 1.77-1.77v-.44l1.53 1.15c.13.1.29.16.45.17s.33-.02.47-.09a.88.88 0 0 0 .49-.79V4.72a.94.94 0 0 0-.13-.46"
          />
    </svg>
  );
});

IcCallVideo.displayName = 'IcCallVideo';
