import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCrop(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 14a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1H7V3a1 1 0 0 0-2 0v2H3a1 1 0 0 0 0 2h14zm4 3H7v-7a1 1 0 0 0-2 0v8a1 1 0 0 0 1 1h11v2a1 1 0 0 0 2 0v-2h2a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
