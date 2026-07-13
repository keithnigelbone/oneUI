import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFemaleMale(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M22 9a5 5 0 1 0-6 4.9V16h-1a1 1 0 0 0 0 2h1v2a1 1 0 1 0 2 0v-2h1a1 1 0 1 0 0-2h-1v-2.1A5 5 0 0 0 22 9m-5 3a3 3 0 1 1 0-6 3 3 0 0 1 0 6m-9-.9V6.41l.29.3a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42l-2-2a1 1 0 0 0-1.42 0l-2 2a1.004 1.004 0 0 0 1.42 1.42l.29-.3v4.69a5 5 0 1 0 2 0M7 19a3 3 0 1 1 0-6 3 3 0 0 1 0 6"
          />
    </Svg>
  );
}
