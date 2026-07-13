import * as React from 'react';
import type { SVGProps } from 'react';
const SvgIcWarning = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20m-1 4.5a1 1 0 0 1 2 0v6a1 1 0 0 1-2 0zm1 12a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"
    />
  </svg>
);
export default SvgIcWarning;
