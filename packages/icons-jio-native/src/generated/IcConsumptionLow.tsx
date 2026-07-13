import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcConsumptionLow(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m16.7 11.88-.41.41a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l2-2a1 1 0 0 0 0-1.42l-2-2a1.003 1.003 0 1 0-1.42 1.42l.13.13C11.79 9.25 8.54 7 5.86 2.49a1 1 0 0 0-1.72 1c3.11 5.2 7.05 7.84 12.56 8.39M7 10H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V11a1 1 0 0 0-1-1m12 7h-2a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1m-6-3h-2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
