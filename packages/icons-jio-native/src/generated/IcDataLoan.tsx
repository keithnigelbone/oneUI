import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDataLoan(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M7.71 7.71 9 6.41V12a1 1 0 1 0 2 0V4a1 1 0 0 0-.62-.92 1 1 0 0 0-1.09.21l-3 3a1.004 1.004 0 0 0 1.42 1.42m5.91 5.21A.84.84 0 0 0 14 13a1 1 0 0 0 .71-.29l3-3A1.005 1.005 0 0 0 17 7.996a1 1 0 0 0-.71.294L15 9.59V4a1 1 0 0 0-2 0v8a1 1 0 0 0 .62.92m7.07 3.14a1 1 0 0 0-1.41 0l-2.17 2.28a2 2 0 0 1-1.45.62H12a1 1 0 0 1 0-2h1.66a1 1 0 0 0 0-2H8a2 2 0 0 0-2 2H4a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h11.66a4 4 0 0 0 2.89-1.24l2.17-2.28a1 1 0 0 0-.03-1.38"
          />
    </Svg>
  );
}
