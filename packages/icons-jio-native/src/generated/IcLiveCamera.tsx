import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcLiveCamera(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16.5 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m3.05 2.72L18 15.5V14a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1.5l1.55.78a1 1 0 0 0 1.45-.9v-2.76a1 1 0 0 0-1.45-.9M12 7.5A4.5 4.5 0 1 0 7.5 12 4.49 4.49 0 0 0 12 7.5"
          />
    </Svg>
  );
}
