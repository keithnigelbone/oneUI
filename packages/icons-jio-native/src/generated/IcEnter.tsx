import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcEnter(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M15.5 5H12a1 1 0 0 0 0 2h3.5a3.5 3.5 0 1 1 0 7H6.41l2.3-2.29a1.004 1.004 0 0 0-1.42-1.42l-4 4a1 1 0 0 0 0 1.42l4 4a1 1 0 0 0 1.639-.325 1 1 0 0 0-.22-1.095L6.41 16h9.09a5.5 5.5 0 0 0 0-11"
          />
    </Svg>
  );
}
