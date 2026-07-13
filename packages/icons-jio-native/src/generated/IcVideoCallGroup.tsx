import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcVideoCallGroup(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m19.6 7.8-2.6 2V8a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-1.75l2.6 1.95A1.5 1.5 0 0 0 22 15V9a1.5 1.5 0 0 0-2.4-1.2m-8.38.2a1.34 1.34 0 1 1 .02 2.68A1.34 1.34 0 0 1 11.22 8m-3.55.89a1.34 1.34 0 1 1 0 2.68 1.34 1.34 0 0 1 0-2.68M13 15.11h-2.67a.89.89 0 0 1-.89.89H5.89a.89.89 0 0 1-.89-.89 2.67 2.67 0 0 1 2.67-2.67A2.6 2.6 0 0 1 9 12.8a2.67 2.67 0 0 1 4.92 1.42.89.89 0 0 1-.92.89"
          />
    </Svg>
  );
}
