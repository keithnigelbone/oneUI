import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFireAlarm(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M9.5 16A6.5 6.5 0 1 0 3 9.5 6.51 6.51 0 0 0 9.5 16m0-8.5a2 2 0 1 1 0 4 2 2 0 0 1 0-4M19 7a2 2 0 0 0 0 4v3a4 4 0 0 1-4 4h-.5v-1.64a8.44 8.44 0 0 1-10 0V19a2 2 0 0 0 2 2h6a2 2 0 0 0 1.72-1H15a6 6 0 0 0 6-6V9a2 2 0 0 0-2-2"
          />
    </Svg>
  );
}
