import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcGraphTable(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 17a1 1 0 0 0 1-1V6a1 1 0 0 0-2 0v10a1 1 0 0 0 1 1m-4 0a1 1 0 0 0 1-1v-6a1 1 0 0 0-2 0v6a1 1 0 0 0 1 1m-4 0a1 1 0 0 0 1-1v-4a1 1 0 1 0-2 0v4a1 1 0 0 0 1 1m12-6a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0v-4a1 1 0 0 0-1-1m0 8H5V4a1 1 0 0 0-2 0v16a1 1 0 0 0 1 1h16a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
