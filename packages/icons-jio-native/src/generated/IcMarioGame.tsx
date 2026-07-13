import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcMarioGame(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M10.16 5.87 9.92 7.3a.61.61 0 0 0 .25.59.63.63 0 0 0 .64.04L12 7.27l1.19.66a.63.63 0 0 0 .64-.04.61.61 0 0 0 .25-.59l-.24-1.43 1-1a.6.6 0 0 0-.34-1l-1.34-.2-.61-1.29a.59.59 0 0 0-1.08 0l-.61 1.29-1.34.2a.6.6 0 0 0-.34 1zM18 10H6a2 2 0 1 0 0 4v6a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-6a2 2 0 0 0 0-4"
          />
    </Svg>
  );
}
