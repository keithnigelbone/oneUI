import * as React from 'react';
import type { SVGProps } from 'react';
const SvgIcText = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="M20 3H4c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1s1-.45 1-1V5h6v14H9c-.55 0-1 .45-1 1s.45 1 1 1h6c.55 0 1-.45 1-1s-.45-1-1-1h-2V5h6v2c0 .55.45 1 1 1s1-.45 1-1V4c0-.55-.45-1-1-1"
    />
  </svg>
);
export default SvgIcText;
