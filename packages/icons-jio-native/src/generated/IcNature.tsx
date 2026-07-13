import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcNature(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17.89 9.11q.109-.55.11-1.11A6 6 0 1 0 6 8q.002.56.11 1.11A4 4 0 0 0 7 17h4v3H9a1 1 0 0 0 0 2h6a1 1 0 1 0 0-2h-2v-3h4a4 4 0 0 0 .89-7.89"
          />
    </Svg>
  );
}
