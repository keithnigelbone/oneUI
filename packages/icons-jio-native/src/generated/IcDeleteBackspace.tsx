import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDeleteBackspace(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 5H8a3 3 0 0 0-2.34 1.18l-3.05 4a3 3 0 0 0 0 3.64l3.05 4A3 3 0 0 0 8 19h11a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3m-1.29 8.29a1.002 1.002 0 0 1-.326 1.639 1 1 0 0 1-1.094-.219L15 13.41l-1.29 1.3a1 1 0 0 1-1.64-.325 1 1 0 0 1 .22-1.095l1.3-1.29-1.3-1.29a1.004 1.004 0 1 1 1.42-1.42l1.29 1.3 1.29-1.3a1.004 1.004 0 0 1 1.42 1.42L16.41 12z"
          />
    </Svg>
  );
}
