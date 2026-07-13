import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcClose(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m13.41 12 6.3-6.29a1.004 1.004 0 0 0-1.42-1.42L12 10.59l-6.29-6.3a1.004 1.004 0 1 0-1.42 1.42l6.3 6.29-6.3 6.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l6.29-6.3 6.29 6.3a1 1 0 0 0 1.639-.325 1 1 0 0 0-.22-1.095z"
          />
    </Svg>
  );
}
