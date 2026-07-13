import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcOverlay(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M15 5a6.9 6.9 0 0 0-3 .69A6.9 6.9 0 0 0 9 5a7 7 0 0 0 0 14 6.9 6.9 0 0 0 3-.69 6.9 6.9 0 0 0 3 .69 7 7 0 1 0 0-14M9 17a5 5 0 1 1 1-9.9 7 7 0 0 0 0 9.8q-.495.095-1 .1m3-1a4.94 4.94 0 0 1 0-8 4.94 4.94 0 0 1 0 8"
          />
    </Svg>
  );
}
