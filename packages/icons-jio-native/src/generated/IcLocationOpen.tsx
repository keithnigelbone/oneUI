import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcLocationOpen(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17.66 4.34A8 8 0 0 0 4 10c0 5 5.94 10.8 6.62 11.45a2 2 0 0 0 2.76 0C14.06 20.8 20 15 20 10a8 8 0 0 0-2.34-5.66M12 16a6 6 0 1 1 0-12 6 6 0 0 1 0 12"
          />
    </Svg>
  );
}
