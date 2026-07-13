import * as React from 'react';
import type { SVGProps } from 'react';
const SvgIcFrame = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M10 16h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2m11 2h-1V6h1a1 1 0 1 0 0-2h-1V3a1 1 0 0 0-2 0v1H6V3a1 1 0 0 0-2 0v1H3a1 1 0 0 0 0 2h1v12H3a1 1 0 0 0 0 2h1v1a1 1 0 1 0 2 0v-1h12v1a1 1 0 0 0 2 0v-1h1a1 1 0 0 0 0-2m-3 0H6V6h12z"
    />
  </svg>
);
export default SvgIcFrame;
