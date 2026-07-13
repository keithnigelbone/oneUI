import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFlushRelay(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m20.41 5.34-1.75-1.75A2 2 0 0 0 17.25 3H6.75a2 2 0 0 0-1.41.59L3.59 5.34A2 2 0 0 0 3 6.75V9h18V6.75a2 2 0 0 0-.59-1.41M8 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2M3 14.62A2 2 0 0 0 3.59 16L8 20.41a2 2 0 0 0 1.38.59h5.24a2 2 0 0 0 1.38-.59L20.41 16a2 2 0 0 0 .59-1.38V11H3z"
          />
    </Svg>
  );
}
