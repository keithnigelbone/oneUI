import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPaste(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 2h-8a3 3 0 0 0-3 3v3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-3h3a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3m1 11a1 1 0 0 1-1 1h-3v-3a3 3 0 0 0-3-3h-3V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1z"
          />
    </Svg>
  );
}
