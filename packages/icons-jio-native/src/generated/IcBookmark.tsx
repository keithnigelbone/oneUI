import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBookmark(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 2H7a3 3 0 0 0-3 3v15a2 2 0 0 0 3 1.73l5-2.88 5 2.88a2 2 0 0 0 1 .27 2 2 0 0 0 1.732-1.001A2 2 0 0 0 20 20V5a3 3 0 0 0-3-3"
          />
    </Svg>
  );
}
