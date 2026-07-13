import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHarddrive(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 2H7a3 3 0 0 0-3 3v10a4.92 4.92 0 0 1 3-1h10a4.92 4.92 0 0 1 3 1V5a3 3 0 0 0-3-3m0 14H7a3 3 0 0 0 0 6h10a3 3 0 0 0 0-6m0 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
