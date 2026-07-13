import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHome(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21.47 9.31 13.85 2.7a2.8 2.8 0 0 0-3.7 0L2.53 9.31A1.53 1.53 0 0 0 3.45 12H4v7a3 3 0 0 0 3 3h3v-6h4v6h3a3 3 0 0 0 3-3v-7h.55a1.53 1.53 0 0 0 .92-2.69"
          />
    </Svg>
  );
}
