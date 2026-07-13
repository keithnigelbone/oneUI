import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcConsumptionAccounted(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M13 11h-2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1m-6 4H5a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1m3.71-8.71a1 1 0 0 0-1.42 0l-1 1a1 1 0 0 0 0 1.42 1 1 0 0 0 1.42 0l1-1a1 1 0 0 0 0-1.42M19 7h-2a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1M9 2a5 5 0 0 0-5 5 1 1 0 0 0 2 0 3 3 0 1 1 6 0 1 1 0 0 0 2 0 5 5 0 0 0-5-5"
          />
    </Svg>
  );
}
