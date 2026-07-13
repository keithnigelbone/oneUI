import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFlag(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m18.48 10 2.11-2.79A2 2 0 0 0 19 4H5V3a1 1 0 0 0-2 0v18a1 1 0 1 0 2 0v-5h14a2 2 0 0 0 1.59-3.21z"
          />
    </Svg>
  );
}
