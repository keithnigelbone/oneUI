import * as React from 'react';
import type { SVGProps } from 'react';
const SvgIcExtract = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M20 3h-6c-.55 0-1 .45-1 1s.45 1 1 1h3.59L12.8 9.79a.996.996 0 0 0 .71 1.7c.26 0 .51-.1.71-.29l4.79-4.79V10c0 .55.45 1 1 1s1-.45 1-1V4c0-.55-.45-1-1-1zM9.79 12.79 5 17.58v-3.59c0-.55-.45-1-1-1s-1 .45-1 1v6c0 .55.45 1 1 1h6c.55 0 1-.45 1-1s-.45-1-1-1H6.41l4.79-4.79a.996.996 0 1 0-1.41-1.41"
    />
  </svg>
);
export default SvgIcExtract;
