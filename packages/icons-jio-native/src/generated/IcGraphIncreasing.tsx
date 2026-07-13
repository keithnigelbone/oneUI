import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcGraphIncreasing(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M13 14h-2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1m6-2h-2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-7a1 1 0 0 0-1-1M7 16H5a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1M19 3h-3a1 1 0 1 0 0 2h.59l-3.86 3.86-2.41-.81a1 1 0 0 0-.94.17l-5 4A1 1 0 0 0 5 14a1 1 0 0 0 .62-.22l4.58-3.66 2.48.83a1 1 0 0 0 1-.24L18 6.41V7a1 1 0 0 0 2 0V4a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
