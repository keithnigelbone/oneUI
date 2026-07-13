import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPayBill(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 2H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3M9.5 6h5a1 1 0 1 1 0 2h-.18a3 3 0 0 1-.93 3.33l1.56.78A1 1 0 0 1 14.5 14a.93.93 0 0 1-.45-.11l-4-2A1 1 0 0 1 10.5 10h1a1 1 0 1 0 0-2h-2a1 1 0 0 1 0-2M15 19H9a1 1 0 0 1 0-2h6a1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
