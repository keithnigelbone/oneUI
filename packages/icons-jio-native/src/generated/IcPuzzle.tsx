import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPuzzle(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 10a2.2 2.2 0 0 0-.63.1A1 1 0 0 1 18 9.2V7a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h2.2a1 1 0 0 0 .9-1.37 2 2 0 1 1 3.8 0 1 1 0 0 0 .9 1.37H15a3 3 0 0 0 3-3v-2.2a1 1 0 0 1 1.37-.9q.308.097.63.1a2 2 0 0 0 0-4"
          />
    </Svg>
  );
}
