import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcInsomnia(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M7 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4m1 1H4V5a1 1 0 0 0-2 0v14a1 1 0 1 0 2 0v-1h16v1a1 1 0 0 0 2 0v-4H11a3 3 0 0 1-3-3m11-4h-6a3 3 0 0 0-3 3v1a1 1 0 0 0 1 1h11v-2a3 3 0 0 0-3-3"
          />
    </Svg>
  );
}
