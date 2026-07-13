import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcLipidProfile = forwardRef<SVGSVGElement, IconComponentProps>(function IcLipidProfile(
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
            d="M13.4 18.15c0-.19.03-.37.06-.56-1.72-.38-3.02-1.92-3.02-3.75 0-2.12 1.73-3.85 3.85-3.85.94 0 1.79.35 2.46.92.28-.23.58-.43.91-.58l-4.81-7.86c-.09-.14-.21-.26-.36-.35-.15-.08-.32-.13-.49-.13s-.34.04-.49.13a.93.93 0 0 0-.36.35L6.3 10.39a8.8 8.8 0 0 0-1.3 4.6 7 7 0 0 0 7 7c1.06 0 2.1-.25 3.04-.7-.99-.7-1.64-1.84-1.64-3.14M20.74 12.81c-.13-.2-.3-.37-.5-.5a1.82 1.82 0 0 0-1.4-.28c-.24.05-.46.15-.66.28-.1.07-.19.14-.27.23 0 0 0 .01-.01.02.15.41.24.84.24 1.29 0 .19-.03.37-.06.56.76.17 1.43.56 1.94 1.1.08-.04.15-.07.23-.12.2-.13.37-.3.5-.5a1.82 1.82 0 0 0 0-2.06z"
          />
          <path
            fill="currentColor"
            d="M15.32 12.32a1.82 1.82 0 0 0-1.75-.17c-.66.28-1.13.94-1.13 1.7s.46 1.42 1.13 1.7c.22.09.46.15.72.15h.03c.44-.52 1.02-.93 1.68-1.15.09-.21.14-.44.14-.69 0-.38-.12-.74-.32-1.03-.06-.09-.13-.18-.21-.26-.09-.09-.18-.17-.29-.24zM17.97 16.45a1.9 1.9 0 0 0-.72-.15q-.39 0-.72.15c-.45.19-.81.56-.99 1.01-.09.21-.14.44-.14.69 0 .76.46 1.42 1.13 1.7.22.09.46.15.72.15q.39 0 .72-.15c.66-.28 1.13-.94 1.13-1.7 0-.17-.03-.33-.07-.48-.15-.55-.54-1-1.06-1.22"
          />
    </svg>
  );
});

IcLipidProfile.displayName = 'IcLipidProfile';
