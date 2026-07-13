import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPaired(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20.71 3.29a1 1 0 0 0-1.42 0l-2.46 2.47-.71-.71a3 3 0 0 0-4.24 0l-2 2a1 1 0 0 0 0 1.41l5.66 5.66a1 1 0 0 0 1.41 0l2-2a3 3 0 0 0 0-4.24l-.71-.71 2.47-2.46a1 1 0 0 0 0-1.42M8.46 9.88a1 1 0 0 0-1.41 0l-2 2a3 3 0 0 0 0 4.24l.71.71-2.47 2.46a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l2.46-2.47.71.71a3 3 0 0 0 4.24 0l2-2a1 1 0 0 0 0-1.41z"
          />
    </Svg>
  );
}
