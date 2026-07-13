import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcArrowNext(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m21.71 11.29-6-6a1.004 1.004 0 1 0-1.42 1.42l4.3 4.29H3a1 1 0 1 0 0 2h15.59l-4.3 4.29a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l6-6a1 1 0 0 0 0-1.42"
          />
    </Svg>
  );
}
