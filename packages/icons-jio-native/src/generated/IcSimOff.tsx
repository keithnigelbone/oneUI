import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcSimOff(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20.71 3.29a1 1 0 0 0-1.42 0l-16 16a1 1 0 0 0 .325 1.64 1 1 0 0 0 1.095-.22l.53-.54A3 3 0 0 0 8 22h8a3 3 0 0 0 3-3V6.41l1.71-1.7a1 1 0 0 0 0-1.42M12 20H8a1 1 0 0 1-1-1v-.59L8.41 17H12zm5-1a1 1 0 0 1-1 1h-2v-3h3zm0-4h-5v-1.59L13.41 12H17zM7 12h.76l9.64-9.64A3 3 0 0 0 16 2h-5a2.86 2.86 0 0 0-1.32.29 3 3 0 0 0-1.06.84l-3 3.7A3 3 0 0 0 5 8.7v6.06l2-2z"
          />
    </Svg>
  );
}
