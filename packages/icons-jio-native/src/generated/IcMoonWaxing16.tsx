import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMoonWaxing16(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2M4 12c0-4.41 3.59-8 8-8 .85 0 1.67.14 2.44.38C16.61 6.21 18 8.93 18 12s-1.39 5.78-3.56 7.62c-.77.25-1.59.38-2.44.38-4.41 0-8-3.59-8-8"
          />
    </Svg>
  );
}
