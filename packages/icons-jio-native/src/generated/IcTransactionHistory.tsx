import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcTransactionHistory(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 12a5 5 0 1 0 0 10 5 5 0 0 0 0-10m1.5 6a1 1 0 0 1-1 1h-2a1 1 0 0 1 0-2h1v-1.5a1 1 0 0 1 2 0zM8 18a1 1 0 0 1 0-2h2.08a7 7 0 0 1 1.18-3H8a1 1 0 0 1 0-2h5.41A7 7 0 0 1 17 10a6.9 6.9 0 0 1 3 .69V5a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h5.11a7 7 0 0 1-2-4zM8 6h3a1 1 0 1 1 0 2H8a1 1 0 0 1 0-2"
          />
    </Svg>
  );
}
