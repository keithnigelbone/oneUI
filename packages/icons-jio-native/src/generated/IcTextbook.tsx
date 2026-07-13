import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTextbook(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M3.5 5v14a3 3 0 0 0 3 3V2a3 3 0 0 0-3 3m14-3h-9v20h9a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3M16 10h-3a2 2 0 0 1 0-4h3a2 2 0 0 1 0 4"
          />
    </Svg>
  );
}
