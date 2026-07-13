import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcGroup(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M10 11a4.5 4.5 0 1 0-4.5-4.5A4.51 4.51 0 0 0 10 11m8 1a3 3 0 1 0 0-5.999A3 3 0 0 0 18 12m0 1a4 4 0 0 0-2.67 1A8 8 0 0 0 2 20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2 8 8 0 0 0-.07-1H20a2 2 0 0 0 2-2 4 4 0 0 0-4-4"
          />
    </Svg>
  );
}
