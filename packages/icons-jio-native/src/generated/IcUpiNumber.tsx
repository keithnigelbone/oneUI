import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcUpiNumber(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 3H6C4.34 3 3 4.34 3 6v12c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3V6c0-1.66-1.34-3-3-3m-1.5 12.5c0 .55-.45 1-1 1h-7c-.55 0-1-.45-1-1v-7c0-.55.45-1 1-1s1 .45 1 1v6h5v-6c0-.55.45-1 1-1s1 .45 1 1z"
          />
    </Svg>
  );
}
