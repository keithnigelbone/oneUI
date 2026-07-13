import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSupport(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19 4H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h3v1a2 2 0 0 0 3.2 1.6l3.47-2.6H19a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3m-7 12.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5m1.32-4.62-.33.24A1 1 0 0 1 11 12a2.18 2.18 0 0 1 1.17-1.76c.56-.4.83-.61.83-1.24a1.17 1.17 0 0 0-1-1 1.17 1.17 0 0 0-1 1 1 1 0 0 1-2 0 3.16 3.16 0 0 1 3-3 3.16 3.16 0 0 1 3 3 3.31 3.31 0 0 1-1.68 2.88"
          />
    </Svg>
  );
}
