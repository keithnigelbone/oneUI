import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcLogin(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M10.29 14.29a1.002 1.002 0 0 0 .325 1.639 1 1 0 0 0 1.095-.219l3-3a1 1 0 0 0 0-1.42l-3-3a1.004 1.004 0 0 0-1.42 1.42l1.3 1.29H3a1 1 0 0 0 0 2h8.59zM12 2a10.06 10.06 0 0 0-8.09 4.13 1 1 0 0 0 .575 1.565A1 1 0 0 0 5.53 7.31a8 8 0 1 1 0 9.38 1.002 1.002 0 1 0-1.62 1.18A10 10 0 1 0 12 2"
          />
    </Svg>
  );
}
