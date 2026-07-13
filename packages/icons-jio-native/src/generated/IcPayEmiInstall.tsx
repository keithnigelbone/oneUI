import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPayEmiInstall(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m11.68 12.46-3.13-1.57A1 1 0 0 1 9 9h1a1 1 0 1 0 0-2H8a1 1 0 0 1 0-2h5a1 1 0 1 1 0 2h-.18a3 3 0 0 1-.93 3.33l1.44.72a6.95 6.95 0 0 1 6.67-.37V5a3 3 0 0 0-3-3H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h5.11a7 7 0 0 1-.43-9.54M17 12a5 5 0 1 0 0 10 5 5 0 0 0 0-10m1.5 6a1 1 0 0 1-1 1h-2a1 1 0 0 1 0-2h1v-1.5a1 1 0 0 1 2 0z"
          />
    </Svg>
  );
}
