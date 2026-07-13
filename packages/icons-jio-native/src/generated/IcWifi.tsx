import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWifi(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M8.41 14.21a1 1 0 1 0 1.2 1.6 4 4 0 0 1 4.78 0 1 1 0 0 0 1.2-1.6 6 6 0 0 0-7.18 0M12 17a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m9.34-8.41a13.94 13.94 0 0 0-18.68 0A1.002 1.002 0 0 0 4 10.08a11.93 11.93 0 0 1 16 0 1 1 0 0 0 .67.25 1 1 0 0 0 .67-1.74M12 9a10 10 0 0 0-6.49 2.4 1 1 0 0 0 1.3 1.52 8 8 0 0 1 10.38 0 1 1 0 1 0 1.3-1.52A10 10 0 0 0 12 9"
          />
    </Svg>
  );
}
