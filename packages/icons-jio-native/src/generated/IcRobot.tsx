import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcRobot(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 8h-5V6.72A2 2 0 0 0 14 5a2 2 0 1 0-4 0 2 2 0 0 0 1 1.72V8H6a3 3 0 0 0-3 3v7a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-7a3 3 0 0 0-3-3M7.5 11a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3m9.5 7H7a1 1 0 0 1 0-2h10a1 1 0 0 1 0 2m-.5-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"
          />
    </Svg>
  );
}
