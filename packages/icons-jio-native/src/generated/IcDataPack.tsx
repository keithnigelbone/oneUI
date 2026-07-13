import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcDataPack(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V6a3 3 0 0 0-3-3m-7 12.75a1 1 0 0 1-2 0V11.1l-1.22 1.52a1 1 0 1 1-1.56-1.24l3-3.76a1 1 0 0 1 1.78.63zm6.78-3.13-3 3.76a1 1 0 0 1-1.594-.054A1 1 0 0 1 13 15.75v-7.5a1 1 0 0 1 2 0v4.65l1.22-1.52a1 1 0 0 1 1.56 1.24"
          />
    </Svg>
  );
}
