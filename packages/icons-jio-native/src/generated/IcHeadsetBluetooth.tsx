import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcHeadsetBluetooth(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 11h-1v-1a7 7 0 1 0-14 0v1H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-7a5 5 0 1 1 10 0v7a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2m-4.45 6.17-2.5-1.67 2.5-1.67a1 1 0 0 0 0-1.63l-4-3a1 1 0 0 0-1-.09A1 1 0 0 0 10 10v3.46l-.45-.29a1 1 0 0 0-1.1 1.66l1 .67-1 .67a1 1 0 0 0 1.11 1.66l.45-.3V21a1 1 0 0 0 .55.89.9.9 0 0 0 .44.11 1 1 0 0 0 .6-.2l4-3a1 1 0 0 0 0-1.63zM12 12l1.27.95-1.27.85zm0 7v-1.8l1.27.85z"
          />
    </Svg>
  );
}
