import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcIntersection(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M15 5a6.9 6.9 0 0 0-3 .69A6.9 6.9 0 0 0 9 5a7 7 0 0 0 0 14 6.9 6.9 0 0 0 3-.69 6.9 6.9 0 0 0 3 .69 7 7 0 1 0 0-14m-5 11.9q-.495.095-1 .1a5 5 0 1 1 1-9.9 7 7 0 0 0 0 9.8m5 .1a5.6 5.6 0 0 1-1-.1 7 7 0 0 0 0-9.8 5 5 0 1 1 1 9.9"
          />
    </Svg>
  );
}
