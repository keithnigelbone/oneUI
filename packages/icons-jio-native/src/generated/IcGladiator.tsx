import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcGladiator(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M12 7a6.5 6.5 0 0 0-6.5 6.5v.5h4.06a.51.51 0 1 1 .2 1L5.5 16.79v2.7A2 2 0 0 0 8 21.43l8.22-1.89a3 3 0 0 0 2.33-2.93V13.5A6.5 6.5 0 0 0 12 7m9.84 3.26A10 10 0 0 0 3 7.72 1 1 0 0 0 3.26 9l.58.45a1 1 0 0 0 1.45-.26 8 8 0 0 1 7.53-3.62 8.08 8.08 0 0 1 7 6.5c.195 1.3.255 2.617.18 3.93a2.87 2.87 0 0 0 1.83-2.18 9.7 9.7 0 0 0 .01-3.56"
          />
    </Svg>
  );
}
