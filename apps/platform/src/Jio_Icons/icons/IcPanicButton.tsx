import * as React from 'react';
import type { SVGProps } from 'react';
const SvgIcPanicButton = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-6 13a4 4 0 1 1 0-8 4 4 0 0 1 0 8"
    />
  </svg>
);
export default SvgIcPanicButton;
