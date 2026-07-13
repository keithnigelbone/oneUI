import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMoon34(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2c-1.38 0-2.7.28-3.89.79a9.6 9.6 0 0 0-2.47 1.5c-1.98 1.63-3.31 4-3.59 6.69-.03.34-.05.68-.05 1.02 0 5.52 4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m0 18V4c4.41 0 8 3.59 8 8s-3.59 8-8 8"
          />
    </Svg>
  );
}
