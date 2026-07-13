import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWallet(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 12a2 2 0 0 0 2 2h3v-4h-3a2 2 0 0 0-2 2m2-8H5a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-1h-3a4 4 0 1 1 0-8h3V7a3 3 0 0 0-3-3"
          />
    </Svg>
  );
}
