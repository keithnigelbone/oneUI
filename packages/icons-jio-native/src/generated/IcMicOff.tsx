import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMicOff(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M7.07 12.69A5 5 0 0 1 7 12v-1a1 1 0 1 0-2 0v1a7 7 0 0 0 .41 2.34zM12 2a3 3 0 0 0-3 3v5.76l6-6A3 3 0 0 0 12 2m3 18H9a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2m-3-5a3 3 0 0 0 3-3v-1.56L20.49 5a1.055 1.055 0 0 0-.745-1.799A1.05 1.05 0 0 0 19 3.51L3.51 19A1.055 1.055 0 0 0 5 20.49l2.87-2.88A7 7 0 0 0 19 12v-1a1 1 0 0 0-2 0v1a5 5 0 0 1-7.73 4.18l1.46-1.47A3 3 0 0 0 12 15"
          />
    </Svg>
  );
}
