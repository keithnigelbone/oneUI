import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDoorlock(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M11 13a4 4 0 1 1 2.62-7H17V5a3 3 0 0 0-3-3H8a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v-7h-3.38A4 4 0 0 1 11 13m1 4.61V19a1 1 0 0 1-2 0v-1.39a1.5 1.5 0 1 1 2 0M19 8h-6.28a2 2 0 1 0 0 2H19a1 1 0 1 0 0-2"
          />
    </Svg>
  );
}
