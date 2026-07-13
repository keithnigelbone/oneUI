import * as React from 'react';
import type { SVGProps } from 'react';
const SvgIcControler = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M6.38 9.08a1 1 0 0 0-1.09.21l-2 2a1 1 0 0 0 0 1.41l2 2A1 1 0 0 0 6 15a.84.84 0 0 0 .38-.08A1 1 0 0 0 7 14v-4a1 1 0 0 0-.62-.92M10 7h4a1 1 0 0 0 .93-.62 1 1 0 0 0-.23-1.08l-2-2A1.08 1.08 0 0 0 12 3a1 1 0 0 0-.7.29l-2 2A1 1 0 0 0 10 7m4 10h-4a1 1 0 0 0-.71 1.7l2 2c.191.185.444.292.71.3a1 1 0 0 0 .71-.29l2-2A1 1 0 0 0 14 17m6.71-5.68-2-2A1 1 0 0 0 17 10v4a1 1 0 0 0 1 1 1 1 0 0 0 .71-.29l2-2A1 1 0 0 0 21 12a1 1 0 0 0-.3-.68zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6"
    />
  </svg>
);
export default SvgIcControler;
