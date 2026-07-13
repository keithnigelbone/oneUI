import * as React from 'react';
import type { SVGProps } from 'react';
const SvgIcSeekbar = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path fill="currentColor" d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12" />
  </svg>
);
export default SvgIcSeekbar;
