import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSearch(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M10.004 2a7 7 0 0 1 5.6 11.19l6.11 6.1a1.002 1.002 0 0 1-.325 1.639 1 1 0 0 1-1.095-.219l-6.1-6.11A7 7 0 1 1 10.004 2m0 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10"
          />
    </Svg>
  );
}
