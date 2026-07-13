import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcReply(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m2.59 9.59 5-5a2 2 0 0 1 2.18-.44A2 2 0 0 1 11 6v2s10.25 1.86 11 11.84A1.09 1.09 0 0 1 20.93 21a1.08 1.08 0 0 1-1-.78C19.32 18.39 17.33 14 11 14v2a2 2 0 0 1-1.23 1.85 2 2 0 0 1-2.18-.44l-5-5a2 2 0 0 1 0-2.82"
          />
    </Svg>
  );
}
