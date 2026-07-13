import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcOsNavHome(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M10.67 2.51 4.01 8.43C3.37 9 3 9.82 3 10.67V18c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3v-7.33c0-.86-.37-1.67-1.01-2.24l-6.66-5.92c-.76-.67-1.9-.67-2.66 0"
          />
    </Svg>
  );
}
