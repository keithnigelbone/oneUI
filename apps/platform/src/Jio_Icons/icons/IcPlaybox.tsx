import * as React from 'react';
import type { SVGProps } from 'react';
const SvgIcPlaybox = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <path
      fill="currentColor"
      d="m15.03 11.27-4.44-3.11a.93.93 0 0 0-.51-.16c-.14 0-.28.03-.41.1-.14.07-.27.19-.35.33a.94.94 0 0 0-.13.46v6.22c0 .16.05.32.13.46s.21.25.35.33c.13.07.27.1.41.1.18 0 .36-.06.51-.16l4.44-3.11c.12-.08.21-.19.28-.32s.1-.27.1-.41-.03-.28-.1-.41a.9.9 0 0 0-.28-.32"
    />
    <path
      fill="currentColor"
      d="M17 21H7c-2.21 0-4-1.79-4-4V7c0-2.21 1.79-4 4-4h10c2.21 0 4 1.79 4 4v10c0 2.21-1.79 4-4 4M7 5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z"
    />
  </svg>
);
export default SvgIcPlaybox;
