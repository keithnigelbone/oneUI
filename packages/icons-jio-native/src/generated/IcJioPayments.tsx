import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcJioPayments(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 7h4a2 2 0 0 0-.59-1.41l-3-3A2 2 0 0 0 15 2v4a1 1 0 0 0 1 1m-2.12 1.12A3 3 0 0 1 13 6V2H6.5A2.49 2.49 0 0 0 4 4.5v15A2.49 2.49 0 0 0 6.5 22h11a2.49 2.49 0 0 0 2.5-2.5V9h-4a3 3 0 0 1-2.12-.88M8 18a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m0-4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4 4a1 1 0 1 1 0-2 1 1 0 0 1 0 2m1-5a1 1 0 1 1-2 0 1 1 0 0 1 2 0"
          />
    </Svg>
  );
}
