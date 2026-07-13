import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcModem(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M6.67 8.05a8 8 0 0 1 10.66 0 1 1 0 0 0 .67.25 1 1 0 0 0 .74-.3 1 1 0 0 0-.07-1.41 10 10 0 0 0-13.34 0 1 1 0 0 0 1.34 1.46m1.72 1.18a1.002 1.002 0 0 0 1.22 1.59 4 4 0 0 1 4.78 0 1.002 1.002 0 0 0 1.22-1.59 6 6 0 0 0-7.22 0m12.73 3.65A3 3 0 0 0 19 12H5a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-2a3 3 0 0 0-.88-2.12M6.71 16.71a1 1 0 0 1-1.27.12.94.94 0 0 1-.36-.45A1 1 0 0 1 5 15.8a1 1 0 0 1 .8-.8 1 1 0 0 1 .58.06.94.94 0 0 1 .45.36 1 1 0 0 1-.12 1.27zM10 17a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
