import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFashion(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m20.7 4.94-5-1.87a1 1 0 0 0-1.17.35 3 3 0 0 1-5 0 1 1 0 0 0-1.17-.35l-5 1.87A2 2 0 0 0 2.1 7.45l1 3A2 2 0 0 0 5 11.82h.28l.72-.13V19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-7.31l.72.11H19a2 2 0 0 0 1.9-1.37l1-3a2 2 0 0 0-1.2-2.49"
          />
    </Svg>
  );
}
