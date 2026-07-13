import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBedDouble(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M6 9a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2h2V9a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2h2V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v4h2zm14 3H4a2 2 0 0 0-2 2v5a1 1 0 1 0 2 0v-1h16v1a1 1 0 0 0 2 0v-5a2 2 0 0 0-2-2"
          />
    </Svg>
  );
}
