import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSmartBulbRgb(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M14 20h-4a1 1 0 0 0 0 2h4a1 1 0 0 0 0-2M11.88 2A7.1 7.1 0 0 0 5 8.74a7 7 0 0 0 2.85 5.89A2.9 2.9 0 0 1 9 17a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1 2.86 2.86 0 0 1 1.13-2.34A7 7 0 0 0 11.88 2M10 11a1 1 0 1 1 0-2.002A1 1 0 0 1 10 11m2-3a1 1 0 1 1 0-2 1 1 0 0 1 0 2m2 3a1 1 0 1 1 0-2.001 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
