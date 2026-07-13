import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTemperature(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 14V6a4 4 0 1 0-8 0v8a4.94 4.94 0 0 0-1 3 5 5 0 1 0 10 0 4.94 4.94 0 0 0-1-3m-4 5a2 2 0 0 1-2-2 2 2 0 0 1 1-1.72V8a1 1 0 0 1 2 0v7.28A2 2 0 0 1 14 17a2 2 0 0 1-2 2"
          />
    </Svg>
  );
}
