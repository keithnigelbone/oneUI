import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMilkLow(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16.83 6.41 15.6 5.19A2 2 0 0 0 16 4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2 2 2 0 0 0 .4 1.19L7.17 6.41A4 4 0 0 0 6 9.24V19a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9.24a4 4 0 0 0-1.17-2.83M16 15c-3.71.23-4.29 1.71-8 1.94v-7.7a2 2 0 0 1 .59-1.41L10.41 6h3.18l1.82 1.83A2 2 0 0 1 16 9.24z"
          />
    </Svg>
  );
}
