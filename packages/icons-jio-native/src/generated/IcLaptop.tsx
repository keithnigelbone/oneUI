import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcLaptop(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21 18h-2a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2H3a1 1 0 0 0 0 2h18a1 1 0 0 0 0-2m-2.5-2h-13a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-.5.5"
          />
    </Svg>
  );
}
