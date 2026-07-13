import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBikeMan(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21 10h-1.15l.15-.84A1 1 0 0 0 19 8h-6a1 1 0 0 0-1 1.16l.14.84H11a1 1 0 0 0 0 2h1.49l.51 3.16a1 1 0 0 0 .8.81 3 3 0 0 1 4.38 0 1 1 0 0 0 .8-.81l.53-3.16H21a1 1 0 0 0 0-2m-5 2a1 1 0 1 1 0-2 1 1 0 0 1 0 2M6 7H4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2v4a1 1 0 1 0 2 0v-4a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2M5 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3m11 11a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
