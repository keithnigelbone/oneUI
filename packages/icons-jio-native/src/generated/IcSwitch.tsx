import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSwitch(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 4H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3M8 15a1 1 0 1 1-2 0V9a1 1 0 0 1 2 0zm10 0a1 1 0 0 1-2 0V9a1 1 0 0 1 2 0z"
          />
    </Svg>
  );
}
