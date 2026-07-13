import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcRadio(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 6a1.5 1.5 0 1 0-1.23-2.36l-13 2.94A3.49 3.49 0 0 0 3 10v8a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-8a3 3 0 0 0-3-3h-5l6-1.37A1.46 1.46 0 0 0 20 6m-7 8a3 3 0 1 1-5.999 0A3 3 0 0 1 13 14"
          />
    </Svg>
  );
}
