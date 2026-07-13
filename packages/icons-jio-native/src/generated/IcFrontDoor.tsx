import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFrontDoor(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M5 7h14a1 1 0 0 0 .76-1.65A10.23 10.23 0 0 0 12 2a10.23 10.23 0 0 0-7.76 3.35A1 1 0 0 0 5 7m5 2H5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1m-2 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2m11-7h-5a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1m-3 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
