import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPercentageValue(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 2H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V5a3 3 0 0 0-3-3M8.37 6.37A1.22 1.22 0 0 1 9.25 6a1.25 1.25 0 0 1 1.15.77c.096.227.124.477.08.72a1.3 1.3 0 0 1-1 1A1.25 1.25 0 0 1 8 7.25a1.22 1.22 0 0 1 .37-.88m-.08 5.92 6-6a1.003 1.003 0 1 1 1.42 1.42l-6 6a1 1 0 0 1-1.639-.325 1 1 0 0 1 .219-1.095m7.71.46A1.26 1.26 0 0 1 14.75 14a1.25 1.25 0 0 1-1.15-.77 1.27 1.27 0 0 1-.08-.72 1.3 1.3 0 0 1 1-1A1.25 1.25 0 0 1 16 12.75M16 19H8a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
