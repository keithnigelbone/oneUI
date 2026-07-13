import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHorror(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M10.6 2.14a7 7 0 0 0-4.26 11A8.33 8.33 0 0 1 8 18a4 4 0 0 0 8 0 7.83 7.83 0 0 1 1.56-4.76 7 7 0 0 0-7-11.1zM9 11a1.5 1.5 0 0 1-1.5-1.5v-1a1.5 1.5 0 1 1 3 0v1A1.5 1.5 0 0 1 9 11m5 7a2 2 0 1 1-4 0v-3a2 2 0 0 1 4 0zm2.5-8.5a1.5 1.5 0 1 1-3 0v-1a1.5 1.5 0 1 1 3 0z"
          />
    </Svg>
  );
}
