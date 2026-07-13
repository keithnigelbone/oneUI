import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcForward1(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m14.71 11.29-7-7a1.004 1.004 0 1 0-1.42 1.42l6.3 6.29-6.3 6.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l7-7a1 1 0 0 0 0-1.42m5 0-7-7a1.004 1.004 0 1 0-1.42 1.42l6.3 6.29-6.3 6.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l7-7a1 1 0 0 0 0-1.42"
          />
    </Svg>
  );
}
