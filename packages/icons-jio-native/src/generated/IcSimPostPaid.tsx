import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSimPostPaid(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M8 20a1 1 0 0 1-1-1v-2h3a7 7 0 0 1 9-6.71V5a3 3 0 0 0-3-3h-5a3 3 0 0 0-2.38 1.13l-3 3.7A3 3 0 0 0 5 8.7V19a3 3 0 0 0 3 3h4.11a7 7 0 0 1-1.43-2zm-1-8h3v3H7zm10 0a5 5 0 1 0 0 10 5 5 0 0 0 0-10m1.5 6a1 1 0 0 1-1 1h-2a1 1 0 0 1 0-2h1v-1.5a1 1 0 1 1 2 0z"
          />
    </Svg>
  );
}
