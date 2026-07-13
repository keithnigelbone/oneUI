import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcArrowBack(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m2.29 12.71 6 6a1.004 1.004 0 1 0 1.42-1.42L5.41 13H21a1 1 0 1 0 0-2H5.41l4.3-4.29a1 1 0 0 0 0-1.42 1 1 0 0 0-1.42 0l-6 6a1 1 0 0 0 0 1.42"
          />
    </Svg>
  );
}
