import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWaterChecked(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m17.7 10.39-4.85-7.93c-.36-.59-1.34-.59-1.71 0l-4.85 7.92a8.76 8.76 0 0 0-1.3 4.6c0 3.86 3.14 7 7 7s7-3.14 7-7c0-1.62-.45-3.21-1.3-4.6zm-2 3.32-4 4c-.2.2-.45.29-.71.29s-.51-.1-.71-.29l-2-2a.996.996 0 1 1 1.41-1.41l1.29 1.29 3.29-3.29a.996.996 0 1 1 1.41 1.41z"
          />
    </Svg>
  );
}
