import * as React from 'react';
import type { SVGProps } from 'react';
const SvgVector3 = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 20 20"
    {...props}
  >
    <path
      fill="currentColor"
      d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0m.92 13.38c-.15.37-.52.62-.92.62H7c-.55 0-1-.45-1-1v-3c0-.4.24-.77.62-.92.38-.16.8-.07 1.09.22l3 3c.29.29.37.72.22 1.09zM14 10c0 .4-.24.77-.62.92a.995.995 0 0 1-1.09-.21l-3-3c-.29-.29-.37-.72-.22-1.09S9.59 6 9.99 6h3c.55 0 1 .45 1 1v3z"
    />
  </svg>
);
export default SvgVector3;
