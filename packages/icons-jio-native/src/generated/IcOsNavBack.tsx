import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcOsNavBack(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m14.32 3.37-9.97 7.01a1.973 1.973 0 0 0 0 3.23l9.97 7.01c1.33.94 3.18 0 3.18-1.61V4.99c0-1.61-1.85-2.55-3.18-1.61z"
          />
    </Svg>
  );
}
