import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCallHunting(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M9 16H8a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1h1a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H7.6a1.93 1.93 0 0 0-1.2.4C5.28 4.28 3 6.71 3 12s2.28 7.72 3.4 8.6a1.93 1.93 0 0 0 1.2.4H9a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2m11 0a1 1 0 0 0-1 1v.6a6 6 0 0 0-4.07-1.6H14a1 1 0 0 0 0 2h.93a3.94 3.94 0 0 1 2.62 1H17a1 1 0 0 0 0 2h3a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1m0-13h-3a1 1 0 1 0 0 2h.55a3.94 3.94 0 0 1-2.62 1H14a1 1 0 1 0 0 2h.93A6 6 0 0 0 19 6.4V7a1 1 0 0 0 2 0V4a1 1 0 0 0-1-1m-1.29 6.29a1.004 1.004 0 0 0-1.42 1.42l.3.29H11a1 1 0 0 0 0 2h6.59l-.3.29a1 1 0 0 0 .325 1.639 1 1 0 0 0 1.095-.219l2-2a1 1 0 0 0 0-1.42z"
          />
    </Svg>
  );
}
