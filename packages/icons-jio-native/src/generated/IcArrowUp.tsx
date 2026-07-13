import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcArrowUp(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m18.71 8.29-6-6a1 1 0 0 0-1.42 0l-6 6a1.004 1.004 0 0 0 1.42 1.42L11 5.41V21a1 1 0 1 0 2 0V5.41l4.29 4.3a1 1 0 0 0 1.42 0 1 1 0 0 0 0-1.42"
          />
    </Svg>
  );
}
