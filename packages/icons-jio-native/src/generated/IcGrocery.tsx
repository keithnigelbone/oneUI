import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcGrocery(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M18.71 11.71a1 1 0 0 1-1.42 0L16 10.41l-1.29 1.3a1 1 0 0 1-1.42 0L12 10.41l-1.29 1.3a1 1 0 0 1-1.42 0L8 10.41l-1.29 1.3a1 1 0 0 1-1.42 0L4 10.41V20a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9.59zm-2-3.42L18 9.59l1-1V3a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v5.59l.29-.3a1 1 0 0 1 1.42 0m-9.42 0a1 1 0 0 1 1.42 0L10 9.59l1.29-1.3a1 1 0 0 1 1.42 0l.29.3V6a4 4 0 1 0-8 0v2.59l1 1z"
          />
    </Svg>
  );
}
