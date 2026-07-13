import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBeamer(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 7a4.94 4.94 0 0 0-8 0H5a3 3 0 0 0-3 3v4a3 3 0 0 0 2 2.82V18a1 1 0 1 0 2 0v-1h11v1a1 1 0 0 0 2 0v-1a3 3 0 0 0 3-3v-4a3 3 0 0 0-3-3m-4 6a3 3 0 1 1 0-6 3 3 0 0 1 0 6"
          />
    </Svg>
  );
}
