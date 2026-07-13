import * as React from 'react';
import type { SVGProps } from 'react';
const SvgIcArch = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M6 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3A15 15 0 0 0 6 3"
    />
  </svg>
);
export default SvgIcArch;
