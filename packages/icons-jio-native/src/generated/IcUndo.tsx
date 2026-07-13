import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcUndo(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M14 8H6.41l2.3-2.29a1.004 1.004 0 0 0-1.42-1.42l-4 4a1 1 0 0 0 0 1.42l4 4a1 1 0 0 0 1.639-.325 1 1 0 0 0-.22-1.095L6.41 10H14a5 5 0 0 1 5 5v3a1 1 0 0 0 2 0v-3a7 7 0 0 0-7-7"
          />
    </Svg>
  );
}
