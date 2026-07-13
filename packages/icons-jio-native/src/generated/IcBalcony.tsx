import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBalcony(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 11a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-4.5a1 1 0 0 0-1 1c0 4.75 3.6 6 5.5 6m2 1H3a1 1 0 0 0 0 2v4a2.08 2.08 0 0 0 2.14 2h13.72A2.08 2.08 0 0 0 21 18v-4a1 1 0 0 0 0-2M7 18H5v-3.95a.22.22 0 0 1 .14-.05H7zm4 0H9v-4h2zm4 0h-2v-4h2zm3.86 0H17v-4h2v4a.22.22 0 0 1-.14 0M5 11c1.9 0 5.5-1.25 5.5-6a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1"
          />
    </Svg>
  );
}
