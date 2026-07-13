import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBatteryFullLoading(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2 3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3m-1.2 9.6-3 4a.999.999 0 1 1-1.6-1.2L12 14h-2a1 1 0 0 1-.89-.55 1 1 0 0 1 .09-1l3-4a1 1 0 1 1 1.6 1.2L12 12h2a1 1 0 0 1 .8 1.6"
          />
    </Svg>
  );
}
