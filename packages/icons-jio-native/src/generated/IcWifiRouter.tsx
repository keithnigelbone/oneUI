import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWifiRouter(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19.92 9.86a1 1 0 0 0 1.37-.35 4.79 4.79 0 0 0 0-5 1 1 0 0 0-1.72 1c.274.45.423.964.43 1.49a2.94 2.94 0 0 1-.43 1.49 1 1 0 0 0 .35 1.37M19 12h-1V5a1 1 0 0 0-2 0v7H5a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3M6 17a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2m3.57-7a1 1 0 0 0 .86-1.51A2.94 2.94 0 0 1 14 7a2.94 2.94 0 0 1 .43-1.49 1 1 0 0 0-1.72-1 4.79 4.79 0 0 0 0 5 1 1 0 0 0 .86.49"
          />
    </Svg>
  );
}
