import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcUsb(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 6h-2a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1c0 .9-.77 1.4-2 2.14-.31.19-.64.39-1 .6V6h.25a1 1 0 0 0 .85-1.53l-1.25-2a1 1 0 0 0-1.7 0l-1.25 2A1 1 0 0 0 10.75 6H11v8.06l-.75-.39c-1.19-.6-1.94-1-2.17-2a2 2 0 1 0-2 .08c.32 2.19 2 3.06 3.28 3.69.496.214.958.5 1.37.85a3 3 0 1 0 2.27-.1v-.28c0-.83.75-1.32 2-2s3-1.79 3-3.87a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
