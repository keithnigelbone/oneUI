import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcPesticides(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M16 3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v1h8zm1 3H7a3 3 0 0 0-3 3v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9a3 3 0 0 0-3-3m1 5a2 2 0 0 1-2 2h-1v2h1a2 2 0 0 1 2 2v1a1 1 0 0 1-2 0v-1h-1.18a3 3 0 0 1-5.64 0H8v1a1 1 0 1 1-2 0v-1a2 2 0 0 1 2-2h1v-2H8a2 2 0 0 1-2-2v-1a1 1 0 0 1 2 0v1h1.18a3 3 0 0 1 5.64 0H16v-1a1 1 0 0 1 2 0zm-6 0a1 1 0 0 0-1 1v4a1 1 0 0 0 2 0v-4a1 1 0 0 0-1-1"
          />
    </Svg>
  );
}
