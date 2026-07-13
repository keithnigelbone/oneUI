import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcVoucherCashback(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 5H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V8a3 3 0 0 0-3-3m-8 6a3 3 0 0 1-1.11 2.33l1.56.78A1 1 0 0 1 11 16a.93.93 0 0 1-.45-.11l-4-2A1 1 0 0 1 7 12h1a1 1 0 0 0 0-2H6a1 1 0 0 1 0-2h5a1 1 0 1 1 0 2h-.18a3 3 0 0 1 .18 1m6 6a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
