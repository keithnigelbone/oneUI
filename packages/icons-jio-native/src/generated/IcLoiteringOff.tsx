import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcLoiteringOff(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M4.73 3.32a1 1 0 0 0-1.46 1.36l6 6.39L8.28 14H6a1 1 0 0 0-.93.63l-2 5a1 1 0 1 0 1.86.74L6.68 16H9a1 1 0 0 0 .95-.68l.86-2.59L12 14v3H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h10a1 1 0 0 0 .73-1.68zM11.5 7a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M19 9h-2a1 1 0 0 0-1 1v2.41l.55.59L20 16.68V10a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
