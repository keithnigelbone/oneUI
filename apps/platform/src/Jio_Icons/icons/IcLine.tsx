import * as React from 'react';
import type { SVGProps } from 'react';
const SvgIcLine = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="m20.71 19.29-16-16A.996.996 0 1 0 3.3 4.7l15.99 16.01c.2.2.45.29.71.29s.51-.1.71-.29a.996.996 0 0 0 0-1.41z"
    />
  </svg>
);
export default SvgIcLine;
