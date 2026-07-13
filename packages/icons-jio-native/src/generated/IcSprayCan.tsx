import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSprayCan(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M14 7h-4a3 3 0 0 0-3 3v1h10v-1a3 3 0 0 0-3-3m0-4a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v2h4zM7 21a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-8H7zM18 5h2a1 1 0 1 0 0-2h-2a1 1 0 1 0 0 2m2.24 1.53-2-.5A1.014 1.014 0 0 0 17.76 8l2 .5H20a1.007 1.007 0 0 0 .24-2z"
          />
    </Svg>
  );
}
