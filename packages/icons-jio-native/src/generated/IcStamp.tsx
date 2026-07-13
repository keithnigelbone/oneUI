import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcStamp(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 20H5a1 1 0 0 0 0 2h14a1 1 0 0 0 0-2m-1-7h-2a3 3 0 0 1-3-3v-.14a4 4 0 1 0-2 0V10a3 3 0 0 1-3 3H6a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1a2 2 0 0 0-2-2"
          />
    </Svg>
  );
}
