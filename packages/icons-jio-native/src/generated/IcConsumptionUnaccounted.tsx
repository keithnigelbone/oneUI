import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcConsumptionUnaccounted(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M7 15H5a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1m2-9H7l1.8-2.4a1 1 0 1 0-1.6-1.2l-3 4a1 1 0 0 0-.09 1A1 1 0 0 0 5 8h2l-1.8 2.4a1 1 0 0 0 1.6 1.2l3-4a1 1 0 0 0 .09-1A1 1 0 0 0 9 6m4 5h-2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1m6-4h-2a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
