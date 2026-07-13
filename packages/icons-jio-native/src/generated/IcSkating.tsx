import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSkating(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17.5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3M20 19h-3v-3.93a3 3 0 0 0-1.34-2.5l-1.89-1.26 2-2.71A1 1 0 0 0 15 7H8a1 1 0 0 0 0 2h5l-4.2 5.6a1 1 0 0 1-.8.4H5v-1a1 1 0 1 0-2 0 1 1 0 0 0 0 2v2a1 1 0 0 0 0 2 1 1 0 1 0 2 0v-3h3a3 3 0 0 0 2.4-1.2l2.17-2.89 2 1.33a1 1 0 0 1 .45.83V19H14a1 1 0 0 0 0 2 1 1 0 0 0 2 0h2a1 1 0 0 0 2 0 1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
