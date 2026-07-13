import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBedSingle(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 8h-7a3 3 0 0 0-3 3v1H7v-1a3 3 0 0 0-3-3V5a1 1 0 0 0-2 0v14a1 1 0 1 0 2 0v-1h16v1a1 1 0 0 0 2 0v-8a3 3 0 0 0-3-3"
          />
    </Svg>
  );
}
