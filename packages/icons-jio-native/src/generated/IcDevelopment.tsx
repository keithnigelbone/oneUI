import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDevelopment(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3M8 13a1 1 0 0 1-.71-.29l-2-2a1 1 0 0 1 0-1.42l2-2a1.004 1.004 0 0 1 1.42 1.42L7.41 10l1.3 1.29A1 1 0 0 1 8 13m2.93 4.37a1 1 0 0 1-1.628.348 1 1 0 0 1-.232-1.088l4-10a1 1 0 1 1 1.86.74zm7.78-2.66-2 2a1.002 1.002 0 0 1-1.639-.325 1 1 0 0 1 .219-1.095l1.3-1.29-1.3-1.29a1.004 1.004 0 0 1 1.42-1.42l2 2a1 1 0 0 1 0 1.42"
          />
    </Svg>
  );
}
