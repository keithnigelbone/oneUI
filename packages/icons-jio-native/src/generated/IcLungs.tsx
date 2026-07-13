import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcLungs(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 6a2 2 0 0 0-2 2v.59l-1-1V4a1 1 0 0 0-2 0v3.59l-1 1V8a2 2 0 0 0-2-2 5 5 0 0 0-5 5v8a2 2 0 0 0 2 2 2 2 0 0 0 1.14-.36l.41-.28A8 8 0 0 0 10 13.78v-2.37l2-2 2 2v2.37a8 8 0 0 0 3.45 6.58l.41.28A2 2 0 0 0 19 21a2 2 0 0 0 2-2v-8a5 5 0 0 0-5-5"
          />
    </Svg>
  );
}
