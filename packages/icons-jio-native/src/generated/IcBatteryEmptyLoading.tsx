import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBatteryEmptyLoading(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2 3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3m1 15a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1V4h4v1a1 1 0 0 0 1 1h1a1 1 0 0 1 1 1zm-3-7h-2l1.8-2.4a1 1 0 0 0-1.6-1.2l-3 4a1 1 0 0 0-.09 1 1 1 0 0 0 .89.6h2l-1.8 2.4a1 1 0 0 0 1.6 1.2l3-4A1 1 0 0 0 14 12"
          />
    </Svg>
  );
}
