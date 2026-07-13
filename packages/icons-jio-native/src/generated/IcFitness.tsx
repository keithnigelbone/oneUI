import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcFitness(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M17 19h-2a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2m-9 0H6a1 1 0 0 0 0 2h2a1 1 0 0 0 0-2m11.77-4.85-4.23-1.81L17.68 7H19a1 1 0 0 0 .89-.55l1-2a1 1 0 0 0-1.78-.9L18.38 5H15a1 1 0 1 0 0 2h.52l-1.82 4.55-4.93-2.1a4.5 4.5 0 0 0-1.1-.34L6.62 7H8a1 1 0 0 0 0-2H4a1 1 0 1 0 0 2h.38l1.16 2.31a3.9 3.9 0 0 0-1.37.86 4 4 0 0 0 0 5.66A4 4 0 0 0 6.71 17h.12l12 1H19a2 2 0 0 0 .77-3.85M7 14.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3"
          />
    </Svg>
  );
}
