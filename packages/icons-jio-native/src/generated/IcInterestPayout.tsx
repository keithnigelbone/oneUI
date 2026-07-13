import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcInterestPayout(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 2H5a1 1 0 0 0 0 2v17a1 1 0 0 0 .53.88 1 1 0 0 0 1-.05L9 20.2l2.45 1.63a1 1 0 0 0 1.11 0L15 20.2l2.44 1.63A1 1 0 0 0 19 21V4a1 1 0 1 0 0-2m-4.5 9a3 3 0 0 1-1.11 2.33l1.56.78A1 1 0 0 1 14.5 16a.93.93 0 0 1-.45-.11l-4-2A1 1 0 0 1 10.5 12h1a1 1 0 0 0 0-2h-2a1 1 0 0 1 0-2h5a1 1 0 1 1 0 2h-.18a3 3 0 0 1 .18 1"
          />
    </Svg>
  );
}
