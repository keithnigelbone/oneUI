import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcScreen(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 4H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h7v2H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2h7a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2"
          />
    </Svg>
  );
}
