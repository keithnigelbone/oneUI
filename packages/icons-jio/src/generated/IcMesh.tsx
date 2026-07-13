import React, { forwardRef } from 'react';
import type { IconComponentProps } from '../iconProps';

export const IcMesh = forwardRef<SVGSVGElement, IconComponentProps>(function IcMesh(
  { size = 24, width, height, color = 'currentColor', className, style, ...props },
  ref,
) {
  const dim = width ?? height ?? size;
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 22 24"
      width={width ?? dim}
      height={height ?? dim}
      color={color}
      className={className}
      style={style}
      {...props}
    >
      <path
            fill="currentColor"
            d="M18.578 14.267V9.772a1.975 1.975 0 1 0-1.97-3.425L12.717 4.1c0-1.09-.891-1.98-1.98-1.98-1.09 0-1.98.89-1.98 1.98l-3.88 2.237h-.01a1.983 1.983 0 0 0-2.704.723 1.983 1.983 0 0 0 .723 2.702h.02v4.475h-.03a1.977 1.977 0 1 0 1.98 3.426l3.871 2.247v.02a1.98 1.98 0 1 0 3.96 0l3.89-2.238c.951.545 2.159.218 2.703-.722a1.985 1.985 0 0 0-.712-2.703zM4.876 9.753l2.94 1.702c-.03.178-.06.357-.06.545s.02.346.05.515l-2.95 1.702V9.753zm4.87 8.444-3.9-2.257 2.95-1.703c.278.238.594.426.941.555v3.415zm0-8.989a2.9 2.9 0 0 0-.92.535L5.866 8.04l3.88-2.228v3.406zm1.98-3.415 3.862 2.237-2.95 1.703a2.9 2.9 0 0 0-.911-.525zm3.882 10.167-3.881 2.227v-3.405c.346-.12.663-.307.93-.545l2.95 1.703v.02m.99-1.723-2.94-1.703c.029-.178.049-.346.049-.534q0-.282-.06-.565l2.93-1.692s.01 0 .02.01z"
          />
    </svg>
  );
});

IcMesh.displayName = 'IcMesh';
