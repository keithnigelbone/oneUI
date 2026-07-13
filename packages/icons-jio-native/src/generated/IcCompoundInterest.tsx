import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcCompoundInterest(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M20 19H5v-1.91h1.18c7 0 10.16-4.08 12.68-9.39l.19.58A1 1 0 0 0 20 9q.16.021.32 0A1 1 0 0 0 21 7.68l-1-3a1 1 0 0 0-1.27-.63l-3 1A1.019 1.019 0 1 0 16.32 7l.84-.28C14.68 12 11.86 15.53 5 15.07V4a1 1 0 0 0-2 0v16a1 1 0 0 0 1 1h16a1 1 0 0 0 0-2"
          />
    </Svg>
  );
}
