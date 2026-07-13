import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcGateway2(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="M21.12 12.88A3 3 0 0 0 19 12V9a1 1 0 0 0-2 0v3H7V9a1 1 0 0 0-2 0v3a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3v-2a3 3 0 0 0-.88-2.12M9 17H6a1 1 0 1 1 0-2h3a1 1 0 0 1 0 2m4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2m4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2M8.36 6.89a7.93 7.93 0 0 1 7.28 0 1 1 0 1 0 .91-1.78 9.94 9.94 0 0 0-9.1 0 1 1 0 0 0 .91 1.78m1.23 1.64a1.003 1.003 0 0 0 .82 1.83 3.7 3.7 0 0 1 3.18 0q.195.09.41.09a1 1 0 0 0 .91-.59 1 1 0 0 0-.5-1.33 5.8 5.8 0 0 0-4.82 0"
          />
    </Svg>
  );
}
