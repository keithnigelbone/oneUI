import * as React from 'react';
import type { SVGProps } from 'react';
const SvgIcBrush = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M8.5 11A4.75 4.75 0 0 0 4 15.5c0 2.81-.68 3.76-.74 3.82a1 1 0 0 0-.18 1.06A1 1 0 0 0 4 21c4.19 0 9-.62 9-5.5A4.75 4.75 0 0 0 8.5 11m11.62-7.12a3 3 0 0 0-4.24 0l-5.45 5.44a7 7 0 0 1 4.22 4.27l5.47-5.47a3 3 0 0 0 0-4.24"
    />
  </svg>
);
export default SvgIcBrush;
