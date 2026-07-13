import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCut(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21 3a1 1 0 0 0-1.44 0L3 19.56A1.018 1.018 0 1 0 4.44 21L21 4.44A1 1 0 0 0 21 3M6 3a3 3 0 0 0-3 3v10.76L16.76 3zm12 18a3 3 0 0 0 3-3V7.24L7.24 21z"
          />
    </Svg>
  );
}
