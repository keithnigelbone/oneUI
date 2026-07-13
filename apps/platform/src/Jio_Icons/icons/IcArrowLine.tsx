import * as React from 'react';
import type { SVGProps } from 'react';
const SvgIcArrowLine = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M20 15c-.55 0-1 .45-1 1v1.59L4.71 3.29A.996.996 0 1 0 3.3 4.7l14.29 14.29H16c-.55 0-1 .45-1 1s.45 1 1 1h4c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1z"
    />
  </svg>
);
export default SvgIcArrowLine;
