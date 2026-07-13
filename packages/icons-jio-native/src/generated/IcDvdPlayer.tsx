import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDvdPlayer(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 14H5a3 3 0 0 0 0 6h14a3 3 0 0 0 0-6m-8 4H5a1 1 0 0 1 0-2h6a1 1 0 0 1 0 2m4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8m0-5a1 1 0 1 1 0 2 1 1 0 0 1 0-2"
          />
    </Svg>
  );
}
