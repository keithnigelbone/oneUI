import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcGpon(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18.5 13a2.7 2.7 0 0 0-.7.11l-4.7-5.37a2.5 2.5 0 1 0-2.2 0l-4.7 5.37a2.7 2.7 0 0 0-.7-.11A2.5 2.5 0 1 0 8 15.5c0-.383-.093-.76-.27-1.1L11 10.66v5.55a2.5 2.5 0 1 0 2 0v-5.55l3.27 3.74a2.4 2.4 0 0 0-.27 1.1 2.5 2.5 0 1 0 2.5-2.5"
          />
    </Svg>
  );
}
