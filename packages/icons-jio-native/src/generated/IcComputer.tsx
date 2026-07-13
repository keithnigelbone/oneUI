import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcComputer(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 3H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h6v2H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2h6a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m0 10H5V5.5a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5z"
          />
    </Svg>
  );
}
