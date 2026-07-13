import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBoxing(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 2h-4C9.24 2 7 3.24 7 6v4a1 1 0 0 0 1 1h7v-1a1 1 0 0 1 2 0v1a2 2 0 0 1-2 2H8a3 3 0 0 1-3-3V6a3 3 0 0 0-3 3v4a4 4 0 0 0 4 4v2a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-3l2.12-2.12a3 3 0 0 0 .88-2.12V7a5 5 0 0 0-5-5"
          />
    </Svg>
  );
}
