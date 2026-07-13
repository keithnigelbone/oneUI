import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBodyCare(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M7.19 20a2 2 0 0 0 2 2h5.62a2 2 0 0 0 2-2v-1H7.19zM18.51 2.65A1.88 1.88 0 0 0 17.09 2H6.91a1.88 1.88 0 0 0-1.42.65 1.86 1.86 0 0 0-.44 1.5L7 17h10l2-12.85a1.86 1.86 0 0 0-.49-1.5"
          />
    </Svg>
  );
}
