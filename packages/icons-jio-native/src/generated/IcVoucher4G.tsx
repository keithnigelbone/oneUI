import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcVoucher4G(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 5H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3M6 16a1 1 0 1 1 0-2 1 1 0 0 1 0 2m5-1a1 1 0 0 1-2 0v-2a1 1 0 1 1 2 0zm4 0a1 1 0 0 1-2 0v-4a1 1 0 0 1 2 0zm4 0a1 1 0 0 1-2 0V9a1 1 0 0 1 2 0z"
          />
    </Svg>
  );
}
