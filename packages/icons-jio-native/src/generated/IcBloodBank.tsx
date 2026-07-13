import React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';
export function IcBloodBank(props: SvgProps) {
  const fill = String(props.fill ?? '#000000');
  return (
    <Svg viewBox="0 0 24 24" fill="none" {...props}>
      <Path
            fill={fill}
            d="m21 16.55-1.76-1.76a1 1 0 0 0-1.42 0L16 16.55A3.46 3.46 0 0 0 15 19a3.4 3.4 0 0 0 1 2.46 3.5 3.5 0 0 0 4.94 0A3.4 3.4 0 0 0 22 19a3.46 3.46 0 0 0-1-2.45M13 19v-9h3v3.76l.38-.39a3 3 0 0 1 1.62-.82V10h1a2 2 0 0 0 .79-3.84l-7-3a2.06 2.06 0 0 0-1.58 0l-7 3A2 2 0 0 0 5 10h1v9H4a1 1 0 0 0 0 2h9.38a5.5 5.5 0 0 1-.38-2m-2 0H8v-9h3z"
          />
    </Svg>
  );
}
