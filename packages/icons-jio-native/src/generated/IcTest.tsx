import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTest(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18.5 2h-13a1.5 1.5 0 0 0 0 3H6v11a6 6 0 1 0 12 0V5h.5a1.5 1.5 0 0 0 0-3M16 10H8V5h8z"
          />
    </Svg>
  );
}
