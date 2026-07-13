import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDc9V(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16.92 15.43a6 6 0 1 1 0-6.86 1 1 0 0 0 1.64-1.14A8 8 0 0 0 4.07 11H3a1 1 0 0 0 0 2h1.07a8 8 0 0 0 14.49 3.57 1 1 0 0 0-1.64-1.14M21 11h-5.14a4 4 0 1 0 0 2H21a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
