import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPause(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M8.5 4A1.5 1.5 0 0 0 7 5.5v13a1.5 1.5 0 0 0 3 0v-13A1.5 1.5 0 0 0 8.5 4m7 0A1.5 1.5 0 0 0 14 5.5v13a1.5 1.5 0 1 0 3 0v-13A1.5 1.5 0 0 0 15.5 4"
          />
    </Svg>
  );
}
