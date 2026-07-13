import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcWifiStrength3(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21.34 8.59a13.94 13.94 0 0 0-18.68 0A1.002 1.002 0 0 0 4 10.08a11.93 11.93 0 0 1 16 0 1 1 0 0 0 .67.25 1 1 0 0 0 .67-1.74M12 17a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m-3.59-2.79a1 1 0 1 0 1.2 1.6 4 4 0 0 1 4.78 0 1 1 0 0 0 1.2-1.6 6 6 0 0 0-7.18 0M12 9a10 10 0 0 0-6.49 2.4 1 1 0 0 0 1.3 1.52 8 8 0 0 1 10.38 0 1 1 0 1 0 1.3-1.52A10 10 0 0 0 12 9"
            opacity={0.2}
          />
          <Path
            fill={fill}
            d="M12 17a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3m-3.59-2.79a1 1 0 1 0 1.2 1.6 4 4 0 0 1 4.78 0 1 1 0 0 0 1.2-1.6 6 6 0 0 0-7.18 0m10.08-2.81a10 10 0 0 0-13 0 1 1 0 0 0 1.3 1.52 8 8 0 0 1 10.38 0 1 1 0 0 0 1.3-1.52z"
          />
    </Svg>
  );
}
