import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMotorbikeSide(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M19.83 13.13 18.6 7.6A2 2 0 0 0 20.5 9a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5 2 2 0 0 0-2 2q-.015.13 0 .26L18 4.78A1 1 0 0 0 17 4h-2a1 1 0 1 0 0 2h1.2l.37 1.7A3.4 3.4 0 0 0 14.5 7h-2a3.5 3.5 0 0 0-3.15 2H4a2 2 0 1 0 0 4h1a3 3 0 1 0 2.82 4h5.35a3 3 0 0 0 2.12-.88l.79-.79a2.999 2.999 0 1 0 3.75-2.2M5 17a1 1 0 1 1 0-2 1 1 0 0 1 0 2m14 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2"
          />
    </Svg>
  );
}
